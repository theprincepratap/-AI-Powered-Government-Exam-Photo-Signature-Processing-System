from __future__ import annotations
import logging
from pathlib import Path
from typing import Any
logger = logging.getLogger(__name__)

def detect_faces(image_path: str) -> list[dict[str, Any]]:
    src = _validated_path(image_path)
    try:
        return _haar_cascade(src)
    except Exception as exc:
        logger.warning('Haar cascade failed (%s); returning empty result.', exc)
        return []

def validate_photo_for_govt(image_path: str, min_face_fraction: float=0.2, max_face_fraction: float=0.8) -> dict[str, Any]:
    faces = detect_faces(image_path)
    result: dict[str, Any] = {'faces': faces, 'face_count': len(faces), 'single_face': len(faces) == 1, 'size_ok': False, 'centred': False, 'is_valid': False, 'reason': ''}
    if not faces:
        result['reason'] = 'no_face_detected'
        return result
    if len(faces) > 1:
        result['reason'] = 'multiple_faces_detected'
        return result
    face = faces[0]
    x_min, y_min, x_max, y_max = face['bbox']
    face_area = (x_max - x_min) * (y_max - y_min)
    result['size_ok'] = min_face_fraction <= face_area <= max_face_fraction
    cx = (x_min + x_max) / 2
    cy = (y_min + y_max) / 2
    result['centred'] = 0.3 <= cx <= 0.7 and 0.2 <= cy <= 0.7
    if not result['size_ok']:
        result['reason'] = 'face_size_out_of_range'
    elif not result['centred']:
        result['reason'] = 'face_not_centred'
    else:
        result['is_valid'] = True
        result['reason'] = 'ok'
    return result

def _haar_cascade(src: Path) -> list[dict[str, Any]]:
    import cv2
    img = cv2.imread(str(src))
    if img is None:
        raise ValueError(f'OpenCV could not open: {src}')
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    detections = cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=5, minSize=(int(w * 0.1), int(h * 0.1)), flags=cv2.CASCADE_SCALE_IMAGE)
    results: list[dict[str, Any]] = []
    for x, y, fw, fh in detections if len(detections) else []:
        results.append({'bbox': [x / w, y / h, (x + fw) / w, (y + fh) / h], 'confidence': 0.9, 'width_px': int(fw), 'height_px': int(fh), 'detector': 'haar_cascade'})
    logger.info('Haar cascade: %d face(s) detected in %s', len(results), src.name)
    return results

def _validated_path(image_path: str) -> Path:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f'Image not found: {image_path}')
    return path
