from __future__ import annotations
import logging
from pathlib import Path
from typing import Tuple
from PIL import Image, ImageOps
logger = logging.getLogger(__name__)
PHOTO_SIZE: Tuple[int, int] = (413, 531)
SIGNATURE_SIZE: Tuple[int, int] = (413, 177)
PHOTO_DPI: Tuple[int, int] = (300, 300)
SIGNATURE_DPI: Tuple[int, int] = (300, 300)
BACKGROUND_COLOUR = (255, 255, 255)

def resize_photo(image_path: str, output_path: str | None=None) -> str:
    src = _validated_path(image_path)
    dst = Path(output_path) if output_path else src.with_name(f'resized_{src.stem}.jpg')
    dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as img:
        img = _to_rgb_white_bg(img)
        img = _pad_to_ratio(img, PHOTO_SIZE)
        img = img.resize(PHOTO_SIZE, Image.LANCZOS)
        img.save(dst, format='JPEG', quality=95, dpi=PHOTO_DPI, optimize=True)
    logger.info('Photo resized %s → %s (%dx%d)', src.name, dst.name, *PHOTO_SIZE)
    return str(dst)

def resize_signature(image_path: str, output_path: str | None=None) -> str:
    src = _validated_path(image_path)
    dst = Path(output_path) if output_path else src.with_name(f'resized_sig_{src.stem}.jpg')
    dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as img:
        img = _to_rgb_white_bg(img)
        img = _pad_to_ratio(img, SIGNATURE_SIZE)
        img = img.resize(SIGNATURE_SIZE, Image.LANCZOS)
        img.save(dst, format='JPEG', quality=95, dpi=SIGNATURE_DPI, optimize=True)
    logger.info('Signature resized %s → %s (%dx%d)', src.name, dst.name, *SIGNATURE_SIZE)
    return str(dst)

def get_image_info(image_path: str) -> dict:
    src = _validated_path(image_path)
    with Image.open(src) as img:
        dpi = img.info.get('dpi', (None, None))
        return {'width': img.width, 'height': img.height, 'mode': img.mode, 'format': img.format, 'dpi_x': dpi[0], 'dpi_y': dpi[1]}

def resize_to_spec(image_path: str) -> str:
    return resize_photo(image_path)

def _validated_path(image_path: str) -> Path:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f'Image not found: {image_path}')
    return path

def _to_rgb_white_bg(img: Image.Image) -> Image.Image:
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        background = Image.new('RGB', img.size, BACKGROUND_COLOUR)
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        return background
    return img.convert('RGB')

def _pad_to_ratio(img: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
    target_w, target_h = target_size
    src_w, src_h = img.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h
    if abs(target_ratio - src_ratio) < 0.001:
        return img
    if src_ratio > target_ratio:
        new_h = int(src_w / target_ratio)
        padded = Image.new('RGB', (src_w, new_h), BACKGROUND_COLOUR)
        padded.paste(img, (0, (new_h - src_h) // 2))
    else:
        new_w = int(src_h * target_ratio)
        padded = Image.new('RGB', (new_w, src_h), BACKGROUND_COLOUR)
        padded.paste(img, ((new_w - src_w) // 2, 0))
    return padded
