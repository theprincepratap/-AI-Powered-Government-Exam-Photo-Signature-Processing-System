from __future__ import annotations
import logging
from pathlib import Path
logger = logging.getLogger(__name__)
WHITE = (255, 255, 255)

def remove_background(image_path: str, output_path: str | None=None) -> str:
    src = _validated_path(image_path)
    dst = Path(output_path) if output_path else src.with_name(f'bg_removed_{src.stem}.jpg')
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        result_path = _grabcut_removal(src, dst)
        logger.info('Background removed (GrabCut) %s → %s', src.name, dst.name)
        return result_path
    except Exception as exc:
        logger.warning('GrabCut failed (%s); falling back to colour threshold.', exc)
        return _threshold_removal(src, dst)

def _grabcut_removal(src: Path, dst: Path) -> str:
    import cv2
    import numpy as np
    img_bgr = cv2.imread(str(src))
    if img_bgr is None:
        raise ValueError(f'OpenCV could not read image: {src}')
    h, w = img_bgr.shape[:2]
    margin_x = max(1, int(w * 0.05))
    margin_y = max(1, int(h * 0.05))
    rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)
    mask = np.zeros((h, w), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(img_bgr, mask, rect, bgd_model, fgd_model, iterCount=5, mode=cv2.GC_INIT_WITH_RECT)
    fg_mask = np.where((mask == cv2.GC_BGD) | (mask == cv2.GC_PR_BGD), 0, 1).astype(np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    white_bg = np.full_like(img_bgr, 255)
    result = img_bgr.copy()
    result[fg_mask == 0] = white_bg[fg_mask == 0]
    cv2.imwrite(str(dst), result, [cv2.IMWRITE_JPEG_QUALITY, 95])
    return str(dst)

def _threshold_removal(src: Path, dst: Path) -> str:
    from PIL import Image
    with Image.open(src) as img:
        img = img.convert('RGBA')
        pixels = img.load()
        width, height = img.size
        border_sample: list[tuple[int, ...]] = []
        for x in range(width):
            border_sample.append(pixels[x, 0][:3])
            border_sample.append(pixels[x, height - 1][:3])
        for y in range(height):
            border_sample.append(pixels[0, y][:3])
            border_sample.append(pixels[width - 1, y][:3])
        r_avg = int(sum((c[0] for c in border_sample)) / len(border_sample))
        g_avg = int(sum((c[1] for c in border_sample)) / len(border_sample))
        b_avg = int(sum((c[2] for c in border_sample)) / len(border_sample))
        threshold = 40
        new_pixels = img.load()
        for y in range(height):
            for x in range(width):
                r, g, b, a = new_pixels[x, y]
                if abs(r - r_avg) < threshold and abs(g - g_avg) < threshold and (abs(b - b_avg) < threshold):
                    new_pixels[x, y] = (255, 255, 255, 255)
        white = Image.new('RGB', img.size, WHITE)
        white.paste(img, mask=img.split()[3])
        white.save(dst, format='JPEG', quality=95)
    logger.info('Background removed (threshold) %s → %s', src.name, dst.name)
    return str(dst)

def _validated_path(image_path: str) -> Path:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f'Image not found: {image_path}')
    return path
