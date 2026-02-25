from __future__ import annotations
from typing import Any
PHOTO_MIN_CONFIDENCE: float = 0.7
PHOTO_MIN_FACE_FRACTION: float = 0.2
PHOTO_MAX_FACE_FRACTION: float = 0.8
PHOTO_MIN_RESOLUTION: int = 200
SIGNATURE_MIN_STROKES: int = 1
SIGNATURE_MIN_INK_COVERAGE: float = 0.005

def evaluate_photo_rules(analysis: list[dict[str, Any]]) -> dict[str, Any]:
    if not analysis:
        return {'is_valid': False, 'reason': 'no_face_detected', 'confidence': 0.0, 'face_count': 0}
    if len(analysis) > 1:
        return {'is_valid': False, 'reason': 'multiple_faces_detected', 'confidence': 0.0, 'face_count': len(analysis)}
    face = analysis[0]
    confidence = float(face.get('confidence', 0.0))
    if confidence < PHOTO_MIN_CONFIDENCE:
        return {'is_valid': False, 'reason': 'low_confidence', 'confidence': confidence, 'face_count': 1}
    bbox = face.get('bbox', [])
    if len(bbox) == 4:
        x_min, y_min, x_max, y_max = bbox
        face_area = (x_max - x_min) * (y_max - y_min)
        if face_area < PHOTO_MIN_FACE_FRACTION:
            return {'is_valid': False, 'reason': 'face_too_small', 'confidence': confidence, 'face_count': 1}
        if face_area > PHOTO_MAX_FACE_FRACTION:
            return {'is_valid': False, 'reason': 'face_too_large', 'confidence': confidence, 'face_count': 1}
    return {'is_valid': True, 'reason': 'ok', 'confidence': confidence, 'face_count': 1}

def evaluate_signature_rules(metadata: Any) -> dict[str, Any]:
    if isinstance(metadata, int):
        strokes = metadata
        ink_coverage = 0.05 if strokes > 0 else 0.0
    elif isinstance(metadata, dict):
        strokes = int(metadata.get('strokes', metadata.get('strokes_detected', 0)))
        ink_coverage = float(metadata.get('ink_coverage', 0.0))
    else:
        strokes = 0
        ink_coverage = 0.0
    if strokes < SIGNATURE_MIN_STROKES:
        return {'is_valid': False, 'reason': 'no_ink_detected', 'strokes_detected': strokes, 'ink_coverage': ink_coverage}
    if ink_coverage < SIGNATURE_MIN_INK_COVERAGE:
        return {'is_valid': False, 'reason': 'ink_too_sparse', 'strokes_detected': strokes, 'ink_coverage': ink_coverage}
    return {'is_valid': True, 'reason': 'ok', 'strokes_detected': strokes, 'ink_coverage': ink_coverage}

def aggregate_rules(photo_meta: dict[str, Any], signature_meta: dict[str, Any]) -> dict[str, Any]:
    photo_rules: dict[str, Any] = photo_meta.get('rules', {})
    sig_rules: dict[str, Any] = signature_meta.get('rules', {})
    photo_valid: bool = bool(photo_rules.get('is_valid', False))
    sig_valid: bool = bool(sig_rules.get('is_valid', False))
    triggered: list[str] = []
    if not photo_valid:
        triggered.append(f"photo:{photo_rules.get('reason', 'unknown')}")
    if not sig_valid:
        triggered.append(f"signature:{sig_rules.get('reason', 'unknown')}")
    return {'is_valid': photo_valid and sig_valid, 'rules_triggered': triggered, 'photo_reason': photo_rules.get('reason', 'not_evaluated'), 'signature_reason': sig_rules.get('reason', 'not_evaluated')}
