import { useRef, useState, DragEvent, ChangeEvent } from "react";
import styles from "./FileDropZone.module.css";

interface Props {
  label: string;
  icon: string;
  accept?: string;
  maxSizeMB?: number;
  file: File | null;
  onFile: (file: File) => void;
  onClear: () => void;

  hint?: string;
}

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp";
const DEFAULT_MAX_MB = 10;

export default function FileDropZone({
  label, icon, file, onFile, onClear,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_MB,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(f: File): boolean {
    const ok = accept.split(",").some((a) => {
      const t = a.trim();
      return t === f.type || (t.endsWith("/*") && f.type.startsWith(t.slice(0, -2)));
    });
    if (!ok) { setError(`File type not allowed. Accepted: ${accept}`); return false; }
    if (f.size > maxSizeMB * 1024 * 1024) { setError(`File too large. Max ${maxSizeMB} MB.`); return false; }
    setError(null);
    return true;
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const f = files[0];
    if (validate(f)) onFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  function fileSizeLabel(f: File) {
    return f.size < 1024 * 1024
      ? `${Math.round(f.size / 1024)} KB`
      : `${(f.size / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.fieldLabel}>{icon} {label}</p>

      {file ? (

        <div className={styles.fileChosen}>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className={styles.thumb}
          />
          <div className={styles.fileMeta}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{fileSizeLabel(file)}</span>
          </div>
          <button className={styles.clearBtn} onClick={onClear} aria-label="Remove file">
            ✕
          </button>
        </div>
      ) : (

        <div
          className={`${styles.zone} ${dragging ? styles.dragging : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <span className={styles.zoneIcon}>⬆️</span>
          <span className={styles.zonePrimary}>Click or drag to upload {label}</span>
          {hint && <span className={styles.zoneHint}>{hint}</span>}
          <span className={styles.zoneHint}>JPEG / PNG / WebP · max {maxSizeMB} MB</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        style={{ display: "none" }}
        aria-label={`${label} file input`}
      />

      {error && <p className={styles.error}>⚠ {error}</p>}
    </div>
  );
}
