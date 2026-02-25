import type { PixelCrop } from "../types";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  outputFormat: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.95,
): Promise<Blob> {
  const img    = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx    = canvas.getContext("2d")!;

  const { width: imgW, height: imgH } = img;

  const rotCanvas  = document.createElement("canvas");
  const rotCtx     = rotCanvas.getContext("2d")!;
  const rad        = (rotation * Math.PI) / 180;
  const sin        = Math.abs(Math.sin(rad));
  const cos        = Math.abs(Math.cos(rad));
  rotCanvas.width  = imgW * cos + imgH * sin;
  rotCanvas.height = imgW * sin + imgH * cos;
  rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
  rotCtx.rotate(rad);
  rotCtx.drawImage(img, -imgW / 2, -imgH / 2);

  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const offsetX = (rotCanvas.width  - imgW) / 2;
  const offsetY = (rotCanvas.height - imgH) / 2;

  ctx.drawImage(
    rotCanvas,
    pixelCrop.x + offsetX,
    pixelCrop.y + offsetY,
    pixelCrop.width,
    pixelCrop.height,
    0, 0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob returned null")),
      outputFormat,
      quality,
    );
  });
}

export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  outputFormat: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.95,
): Promise<string> {
  const blob = await getCroppedImageBlob(imageSrc, pixelCrop, rotation, outputFormat, quality);
  return URL.createObjectURL(blob);
}

export async function applyBackground(
  transparentDataUrl: string,
  bgColor: string,
): Promise<string> {
  const img    = await loadImage(transparentDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  if (bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const format = bgColor === "transparent" ? "image/png" : "image/jpeg";
  return canvas.toDataURL(format, 0.95);
}

export async function urlToFile(url: string, filename: string): Promise<File> {
  if (url.startsWith("data:")) {
    const [header, b64] = url.split(",");
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const binary = atob(b64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  }

  const res  = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, b64] = dataUrl.split(",");
  const mimeMatch = header ? header.match(/:(.*?);/) : null;
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(b64 ?? "");
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}
