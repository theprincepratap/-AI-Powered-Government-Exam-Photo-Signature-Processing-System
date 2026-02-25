export type OutputFormat = "jpg" | "png";

export interface ResizeConfig {
  widthPx: number;
  heightPx: number;
  dpi: number;
  format: OutputFormat;

  maxSizeKB?: number;

  preserveAspectRatio?: boolean;
}

export interface ResizeResult {
  blob: Blob;

  url: string;
  widthPx: number;
  heightPx: number;
  sizeKB: number;
  format: OutputFormat;

  quality?: number;
}

const MIME: Record<OutputFormat, string> = {
  jpg: "image/jpeg",
  png: "image/png",
};

export async function resizeImage(
  source: File | string,
  config: ResizeConfig
): Promise<ResizeResult> {
  const img = await loadImage(source);

  const canvas = document.createElement("canvas");
  canvas.width  = config.widthPx;
  canvas.height = config.heightPx;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let dx = 0, dy = 0, dw = config.widthPx, dh = config.heightPx;

  if (config.preserveAspectRatio) {
    const srcRatio = img.naturalWidth / img.naturalHeight;
    const dstRatio = config.widthPx   / config.heightPx;
    if (srcRatio > dstRatio) {

      dh = Math.round(config.widthPx / srcRatio);
      dy = Math.round((config.heightPx - dh) / 2);
    } else {

      dw = Math.round(config.heightPx * srcRatio);
      dx = Math.round((config.widthPx - dw) / 2);
    }
  }

  ctx.drawImage(img, dx, dy, dw, dh);

  const mime = MIME[config.format];
  let blob: Blob;
  let quality: number | undefined;

  if (config.format === "jpg") {
    quality = 0.95;
    blob = await canvasToBlob(canvas, mime, quality);

    if (config.maxSizeKB) {

      while (blob.size > config.maxSizeKB * 1024 && quality > 0.30) {
        quality = Math.max(0.30, quality - 0.05);
        blob = await canvasToBlob(canvas, mime, quality);
      }
    }
  } else {
    blob = await canvasToBlob(canvas, mime, 1);
  }

  return {
    blob,
    url: URL.createObjectURL(blob),
    widthPx:  config.widthPx,
    heightPx: config.heightPx,
    sizeKB:   Math.round(blob.size / 1024),
    format:   config.format,
    quality,
  };
}

export async function getImageDimensions(
  source: File | string
): Promise<{ width: number; height: number; sizeKB: number }> {
  const img = await loadImage(source);
  const sizeKB =
    source instanceof File
      ? Math.round(source.size / 1024)
      : 0;
  return { width: img.naturalWidth, height: img.naturalHeight, sizeKB };
}

function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src =
      source instanceof File ? URL.createObjectURL(source) : source;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      mime,
      quality
    );
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
