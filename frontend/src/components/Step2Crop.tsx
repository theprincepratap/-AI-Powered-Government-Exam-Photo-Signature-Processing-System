import { useCallback, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import type { PixelCrop, ResizeMode } from "../types";
import { getCroppedImageDataUrl } from "../utils/cropImage";
import styles from "./Step2Crop.module.css";

interface Props {
  mode: ResizeMode;
  photoFile: File | null;
  onCropComplete: (croppedUrl: string) => void;
  onBack: () => void;
  onSkip?: () => void;
}

type AspectPreset = { label: string; value: number | undefined };

const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Passport (7:9)", value: 7 / 9 },
  { label: "Square (1:1)",   value: 1 },
  { label: "4:3",            value: 4 / 3 },
  { label: "Free",           value: undefined },
];

export default function Step2Crop({ mode, photoFile, onCropComplete, onBack }: Props) {
  const imageUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );

  const [crop,     setCrop]     = useState({ x: 0, y: 0 });
  const [zoom,     setZoom]     = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect,   setAspect]   = useState<number | undefined>(7 / 9);
  const [croppedAreaPx, setCroppedAreaPx] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPx(croppedAreaPixels as PixelCrop);
    },
    [],
  );

  async function handleConfirm() {
    if (!imageUrl || !croppedAreaPx) return;
    setProcessing(true);
    try {
      const url = await getCroppedImageDataUrl(imageUrl, croppedAreaPx, rotation);
      onCropComplete(url);
    } finally {
      setProcessing(false);
    }
  }

  function handleReset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }

  if (!imageUrl) return null;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>✂ Crop Your Photo</h2>
        <p className={styles.subtitle}>
          Drag to reposition · Pinch / scroll to zoom · Use controls below to rotate
        </p>
      </div>

      {}
      <div className={styles.aspectRow}>
        <span className={styles.ctrlLabel}>Aspect ratio:</span>
        {ASPECT_PRESETS.map((p) => (
          <button
            key={p.label}
            className={`${styles.aspectBtn} ${aspect === p.value ? styles.aspectActive : ""}`}
            onClick={() => setAspect(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {}
      <div className={styles.cropWrapper}>
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          showGrid={true}
          cropShape="rect"
          style={{
            containerStyle: { borderRadius: "12px" },
          }}
        />
      </div>

      {}
      <div className={styles.controls}>
        {}
        <div className={styles.sliderRow}>
          <span className={styles.ctrlLabel}>🔍 Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.sliderVal}>{zoom.toFixed(2)}×</span>
        </div>

        {}
        <div className={styles.sliderRow}>
          <span className={styles.ctrlLabel}>🔄 Rotate</span>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.sliderVal}>{rotation}°</span>
        </div>

        {}
        <div className={styles.rotBtns}>
          {[-90, -45, 0, 45, 90].map((deg) => (
            <button
              key={deg}
              className={`${styles.rotBtn} ${rotation === deg ? styles.rotActive : ""}`}
              onClick={() => setRotation(deg)}
            >
              {deg === 0 ? "Reset" : `${deg > 0 ? "+" : ""}${deg}°`}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <button className={styles.resetBtn} onClick={handleReset}>
          ↺ Reset
        </button>
        <button
          className={styles.confirmBtn}
          disabled={!croppedAreaPx || processing}
          onClick={handleConfirm}
        >
          {processing ? (
            <span className={styles.spinner} />
          ) : (
            "Confirm Crop →"
          )}
        </button>
      </div>
    </div>
  );
}
