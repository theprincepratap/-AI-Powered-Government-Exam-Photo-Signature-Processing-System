from __future__ import annotations
import base64
import io
import json
import os
import tempfile
from pathlib import Path
from django.conf import settings
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from . import models, serializers
from ai_engine import face_detection, background_removal, signature_processing, image_resize, rules
TEMPLATES_CONFIG_PATH = Path(__file__).resolve().parent.parent / 'templates_config.json'

class PhotoSubmissionViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = models.PhotoSubmission.objects.all().order_by('-created_at')
    serializer_class = serializers.PhotoSubmissionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        submission = self.get_object()
        source_path = submission.source.path
        faces = face_detection.detect_faces(source_path)
        photo_validation = face_detection.validate_photo_for_govt(source_path)
        bg_removed_path = background_removal.remove_background(source_path)
        processed_dir = Path(submission.source.path).parent.parent / 'processed' / 'photos'
        processed_dir.mkdir(parents=True, exist_ok=True)
        resized_path = image_resize.resize_photo(bg_removed_path, output_path=str(processed_dir / f'final_{submission.pk}.jpg'))
        rules_result = rules.evaluate_photo_rules(faces)

        def _rel(p: str) -> str:
            try:
                return os.path.relpath(p, start=str(Path(submission.source.path).parent.parent.parent))
            except ValueError:
                return p
        submission.metadata = {'faces': faces, 'photo_validation': photo_validation, 'bg_removed_path': _rel(bg_removed_path), 'resized_path': _rel(resized_path), 'target_size': image_resize.PHOTO_SIZE, 'rules': rules_result}
        submission.save(update_fields=['metadata', 'updated_at'])
        serializer = self.get_serializer(submission)
        return Response(serializer.data)

class SignatureSubmissionViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = models.SignatureSubmission.objects.all().order_by('-created_at')
    serializer_class = serializers.SignatureSubmissionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        submission = self.get_object()
        source_path = submission.source.path
        processed_dir = Path(source_path).parent.parent / 'processed' / 'signatures'
        processed_dir.mkdir(parents=True, exist_ok=True)
        cleaned_path = signature_processing.extract_signature(source_path, output_path=str(processed_dir / f'clean_{submission.pk}.jpg'))
        analysis = signature_processing.analyse_signature(cleaned_path)
        resized_path = image_resize.resize_signature(cleaned_path, output_path=str(processed_dir / f'final_{submission.pk}.jpg'))
        rules_result = rules.evaluate_signature_rules(analysis)

        def _rel(p: str) -> str:
            try:
                return os.path.relpath(p, start=str(Path(source_path).parent.parent.parent))
            except ValueError:
                return p
        submission.metadata = {'analysis': analysis, 'cleaned_path': _rel(cleaned_path), 'resized_path': _rel(resized_path), 'target_size': image_resize.SIGNATURE_SIZE, 'rules': rules_result}
        submission.save(update_fields=['metadata', 'updated_at'])
        serializer = self.get_serializer(submission)
        return Response(serializer.data)

class ProcessingResultViewSet(viewsets.ModelViewSet):
    queryset = models.ProcessingResult.objects.all().order_by('-created_at')
    serializer_class = serializers.ProcessingResultSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def aggregate(self, request):
        applicant_id = request.data.get('applicant_id')
        if not applicant_id:
            return Response({'detail': 'applicant_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        photo = models.PhotoSubmission.objects.filter(applicant_id=applicant_id).order_by('-created_at').first()
        signature = models.SignatureSubmission.objects.filter(applicant_id=applicant_id).order_by('-created_at').first()
        if not photo or not signature:
            return Response({'detail': 'Both a photo submission and a signature submission are required.'}, status=status.HTTP_400_BAD_REQUEST)
        evaluation = rules.aggregate_rules(photo.metadata, signature.metadata)
        result, _ = models.ProcessingResult.objects.update_or_create(applicant_id=applicant_id, defaults={'photo': photo, 'signature': signature, 'is_valid': evaluation.get('is_valid', False), 'rules_triggered': evaluation.get('rules_triggered', [])})
        serializer = self.get_serializer(result)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TemplateListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with open(TEMPLATES_CONFIG_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return Response(data)
        except FileNotFoundError:
            return Response({'detail': 'Templates configuration file not found.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except json.JSONDecodeError as exc:
            return Response({'detail': f'Malformed templates config: {exc}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RemoveBackgroundView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        img_bytes: bytes | None = None
        if 'image' in request.FILES:
            img_bytes = request.FILES['image'].read()
        elif 'image_b64' in request.data:
            try:
                raw = request.data['image_b64']
                if ',' in raw:
                    raw = raw.split(',', 1)[1]
                img_bytes = base64.b64decode(raw)
            except Exception:
                return Response({'detail': 'Invalid base64 image data.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': "No image provided. Send 'image' (file) or 'image_b64' (base64)."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            result_bytes = _run_rembg(img_bytes)
        except Exception as exc:
            return Response({'detail': f'Background removal failed: {exc}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        result_b64 = base64.b64encode(result_bytes).decode('ascii')
        return Response({'result_b64': result_b64, 'mime': 'image/png'})

def _run_rembg(img_bytes: bytes) -> bytes:
    try:
        from rembg import remove as rembg_remove
        result = rembg_remove(img_bytes)
        return result
    except ImportError:
        pass
    import cv2
    import numpy as np
    from PIL import Image
    nparr = np.frombuffer(img_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_cv is None:
        raise ValueError('Could not decode image bytes.')
    h, w = img_cv.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    margin = min(w, h) // 10
    rect = (margin, margin, w - 2 * margin, h - 2 * margin)
    cv2.grabCut(img_cv, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
    mask2 = np.where((mask == 2) | (mask == 0), 0, 255).astype('uint8')
    img_rgba = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGBA)
    img_rgba[:, :, 3] = mask2
    pil_img = Image.fromarray(img_rgba)
    buf = io.BytesIO()
    pil_img.save(buf, format='PNG')
    return buf.getvalue()
