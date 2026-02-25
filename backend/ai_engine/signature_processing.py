from __future__ import annotations
import logging
from pathlib import Path
from typing import Any
logger = logging.getLogger(__name__)

def extract_signature(image_path: str, output_path: str | None=None) -> str:
    src = _validated_path(image_path)
    dst = Path(output_path) if output_path else src.with_name(f'sig_clean_{src.stem}.jpg')
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        return _process_with_opencv(src, dst)
    except Exception as exc:
        logger.warning('OpenCV signature processing failed (%s); using Pillow fallback.', exc)
        return _process_with_pillow(src, dst)

def analyse_signature(image_path: str) -> dict[str, Any]:
    src = _validated_path(image_path)
    try:
        return _analyse_with_opencv(src)
    except Exception as exc:
        logger.warning('Signature analysis failed (%s).', exc)
        return {'strokes': 0, 'ink_coverage': 0.0, 'has_ink': False, 'bounding_box': None, 'is_valid': False, 'reason': str(exc)}

def _process_with_opencv(src: Path, dst: Path) -> str:
    import cv2
    import numpy as np
    img = cv2.imread(str(src))
    if img is None:
        raise ValueError(f'OpenCV could not open: {src}')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, blockSize=15, C=10)
    if np.mean(binary) < 127:
        binary = cv2.bitwise_not(binary)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    ink_mask = cv2.bitwise_not(binary)
    coords = cv2.findNonZero(ink_mask)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        pad_x = max(5, int(w * 0.05))
        pad_y = max(5, int(h * 0.05))
        ih, iw = binary.shape
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(iw, x + w + pad_x)
        y2 = min(ih, y + h + pad_y)
        binary = binary[y1:y2, x1:x2]
    cv2.imwrite(str(dst), binary, [cv2.IMWRITE_JPEG_QUALITY, 95])
    logger.info('Signature extracted (OpenCV) %s → %s', src.name, dst.name)
    return str(dst)

def _analyse_with_opencv(src: Path) -> dict[str, Any]:
    import cv2
    import numpy as np
    img = cv2.imread(str(src), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f'OpenCV could not open: {src}')
    _, binary = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    significant = [c for c in contours if cv2.contourArea(c) >= 10]
    ink_pixels = int(np.sum(binary > 0))
    total_pixels = img.size
    ink_coverage = ink_pixels / total_pixels if total_pixels else 0.0
    bbox = None
    if significant:
        all_pts = np.vstack(significant)
        x, y, w, h = cv2.boundingRect(all_pts)
        bbox = [int(x), int(y), int(w), int(h)]
    is_valid = len(significant) >= 1 and ink_coverage >= 0.005
    reason = 'ok' if is_valid else 'no_ink' if not significant else 'ink_too_sparse'
    return {'strokes': len(significant), 'ink_coverage': round(ink_coverage, 4), 'has_ink': len(significant) > 0, 'bounding_box': bbox, 'is_valid': is_valid, 'reason': reason}

def _process_with_pillow(src: Path, dst: Path) -> str:
    from PIL import Image, ImageFilter, ImageOps
    with Image.open(src) as img:
        gray = img.convert('L')
        blurred = gray.filter(ImageFilter.GaussianBlur(radius=1))
        threshold = 140
        binary = blurred.point(lambda p: 255 if p > threshold else 0)
        binary.save(dst, format='JPEG', quality=95)
    logger.info('Signature extracted (Pillow fallback) %s → %s', src.name, dst.name)
    return str(dst)

def _validated_path(image_path: str) -> Path:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f'Image not found: {image_path}')
    return path
