import { useCallback, useRef, useState } from "react";
import type { ResizeMode } from "../types";
import styles from "./Step1Upload.module.css";

interface Props {
  mode: ResizeMode | null;
  onMode: (m: ResizeMode) => void;
  photoFile: File | null;
  signatureFile: File | null;
  onPhotoFile: (f: File | null) => void;
  onSignatureFile: (f: File | null) => void;
  onNext: () => void;
}

const ACCEPT_IMG = "image/jpeg,image/png,image/webp";
const MAX_MB = 10;

function useDropZone(
  onFile: (f: File) => void,
): [boolean, React.DragEventHandler, React.DragEventHandler, React.DragEventHandler] {
  const [over, setOver] = useState(false);
  const onDragOver: React.DragEventHandler = (e) => {
    e.preventDefault();
    setOver(true);
  };
  const onDragLeave: React.DragEventHandler = () => setOver(false);
  const onDrop: React.DragEventHandler = (e) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };
  return [over, onDragOver, onDragLeave, onDrop];
}

function FileZone({
  label,
  hint,
  file,
  onFile,
  onClear,
}: {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [warn, setWarn] = useState<string | null>(null);

  const handleFile = useCallback(
    (f: File) => {
      setWarn(null);
      if (!f.type.startsWith("image/")) {
        setWarn("Please upload an image file (JPEG / PNG / WebP).");
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setWarn(`File exceeds ${MAX_MB} MB limit.`);
        return;
      }
      onFile(f);
    },
    [onFile],
  );

  const [over, onDragOver, onDragLeave, onDrop] = useDropZone(handleFile);

  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className={styles.zoneWrapper}>
      <p className={styles.zoneLabel}>{label}</p>
      {file ? (
        <div className={styles.preview}>
          <img src={preview!} alt="preview" className={styles.thumb} />
          <div className={styles.previewInfo}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>
              {(file.size / 1024).toFixed(0)} KB
            </span>
            <button className={styles.clearBtn} onClick={onClear}>
              ✕ Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.dropZone} ${over ? styles.dropOver : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <span className={styles.dropIcon}>📂</span>
          <p className={styles.dropMain}>Drag &amp; drop or click to select</p>
          <p className={styles.dropHint}>{hint}</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_IMG}
            className={styles.hidden}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>
      )}
      {warn && <p className={styles.warn}>⚠ {warn}</p>}
    </div>
  );
}

const OPTIONS: { id: ResizeMode; emoji: string; title: string; desc: string }[] = [
  {
    id: "photo",
    emoji: "🧑‍💼",
    title: "Resize Photo",
    desc: "Passport-style government photo with crop, background removal & resize.",
  },
  {
    id: "signature",
    emoji: "✍️",
    title: "Resize Signature",
    desc: "Scan or photo of your signature – clean and resize to spec.",
  },
  {
    id: "both",
    emoji: "🗂️",
    title: "Both Photo & Signature",
    desc: "Process both at once in a single workflow.",
  },
];

export default function Step1Upload({
  mode,
  onMode,
  photoFile,
  signatureFile,
  onPhotoFile,
  onSignatureFile,
  onNext,
}: Props) {
  const needsPhoto = mode === "photo" || mode === "both";
  const needsSig   = mode === "signature" || mode === "both";

  const canProceed =
    mode !== null &&
    (!needsPhoto || photoFile !== null) &&
    (!needsSig   || signatureFile !== null);

  return (
    <div className={styles.root}>
      {}
      <section className={styles.modeSection}>
        <h2 className={styles.sectionTitle}>What would you like to resize?</h2>
        <div className={styles.modeCards}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.modeCard} ${mode === opt.id ? styles.selected : ""}`}
              onClick={() => onMode(opt.id)}
            >
              {mode === opt.id && (
                <span className={styles.badge}>✓</span>
              )}
              <span className={styles.modeEmoji}>{opt.emoji}</span>
              <strong>{opt.title}</strong>
              <p>{opt.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {}
      {mode && (
        <section className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>Upload your file(s)</h2>
          <div className={`${styles.uploadGrid} ${mode === "both" ? styles.two : ""}`}>
            {needsPhoto && (
              <FileZone
                label="📷 Photograph"
                hint="JPEG or PNG · max 10 MB · min 200×200 px recommended"
                file={photoFile}
                onFile={onPhotoFile}
                onClear={() => onPhotoFile(null)}
              />
            )}
            {needsSig && (
              <FileZone
                label="✍ Signature"
                hint="JPEG or PNG · scan on white background · max 10 MB"
                file={signatureFile}
                onFile={onSignatureFile}
                onClear={() => onSignatureFile(null)}
              />
            )}
          </div>
        </section>
      )}

      {}
      <div className={styles.actions}>
        <button
          className={styles.nextBtn}
          disabled={!canProceed}
          onClick={onNext}
        >
          Continue →
        </button>
        {mode && !canProceed && (
          <p className={styles.hint}>
            {needsPhoto && !photoFile && "Upload your photo. "}
            {needsSig && !signatureFile && "Upload your signature."}
          </p>
        )}
      </div>
    </div>
  );
}
