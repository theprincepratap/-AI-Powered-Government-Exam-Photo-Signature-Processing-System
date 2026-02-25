import type { ProcessedFile, ResizeMode } from "../types";
import styles from "./Step3Results.module.css";

interface Props {
  mode: ResizeMode;
  photo: ProcessedFile | null;
  signature: ProcessedFile | null;
  onReEdit: () => void;
  onStartOver: () => void;
}

function CompareCard({ result, label }: { result: ProcessedFile; label: string }) {
  function download() {
    const a = document.createElement("a");
    a.href = result.resizedUrl;
    a.download = `resized_${label.toLowerCase().replace(/\s+/g, "_")}.${result.format}`;
    a.click();
  }

  const compressionPct =
    result.originalSizeKB > 0
      ? Math.round((1 - result.resizedSizeKB / result.originalSizeKB) * 100)
      : 0;

  return (
    <div className={styles.compareCard}>
      <h3 className={styles.compareTitle}>{label}</h3>

      {}
      <div className={styles.imageRow}>
        <div className={styles.imgBox}>
          <span className={styles.imgLabel}>Original</span>
          <img
            src={result.originalUrl}
            alt="Original"
            className={styles.img}
          />
          <div className={styles.imgMeta}>
            {result.originalWidth} × {result.originalHeight} px
            &nbsp;·&nbsp;
            {result.originalSizeKB} KB
          </div>
        </div>

        <div className={styles.arrowBox}>
          <span>→</span>
        </div>

        <div className={`${styles.imgBox} ${styles.imgBoxResult}`}>
          <span className={styles.imgLabel}>Resized</span>
          <img
            src={result.resizedUrl}
            alt="Resized"
            className={styles.img}
          />
          <div className={styles.imgMeta}>
            {result.resizedWidth} × {result.resizedHeight} px
            &nbsp;·&nbsp;
            {result.resizedSizeKB} KB
          </div>
        </div>
      </div>

      {}
      <table className={styles.statsTable}>
        <tbody>
          <tr>
            <td>Dimensions</td>
            <td>{result.originalWidth} × {result.originalHeight} px</td>
            <td>→</td>
            <td className={styles.highlight}>{result.resizedWidth} × {result.resizedHeight} px</td>
          </tr>
          <tr>
            <td>File Size</td>
            <td>{result.originalSizeKB} KB</td>
            <td>→</td>
            <td className={styles.highlight}>
              {result.resizedSizeKB} KB
              {compressionPct > 0 && (
                <span className={styles.compressionTag}>-{compressionPct}%</span>
              )}
            </td>
          </tr>
          <tr>
            <td>Format</td>
            <td colSpan={3} className={styles.highlight}>{result.format.toUpperCase()} · {result.dpi} DPI</td>
          </tr>
          {result.quality && (
            <tr>
              <td>JPEG Quality</td>
              <td colSpan={3}>{Math.round(result.quality * 100)}%</td>
            </tr>
          )}
        </tbody>
      </table>

      {}
      <button className={styles.downloadBtn} onClick={download}>
        ⬇ Download {label}
      </button>
    </div>
  );
}

export default function Step3Results({
  mode, photo, signature, onReEdit, onStartOver,
}: Props) {
  const showPhoto = (mode === "photo" || mode === "both") && photo;
  const showSig   = (mode === "signature" || mode === "both") && signature;

  function downloadAll() {
    if (showPhoto && photo) {
      const a = document.createElement("a");
      a.href = photo.resizedUrl;
      a.download = `resized_photo.${photo.format}`;
      a.click();
    }

    if (showSig && signature) {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = signature.resizedUrl;
        a.download = `resized_signature.${signature.format}`;
        a.click();
      }, 300);
    }
  }

  return (
    <div className={styles.wrapper}>
      {}
      <div className={styles.successBanner}>
        <span className={styles.successIcon}>✓</span>
        <div>
          <p className={styles.successTitle}>Processing Complete!</p>
          <p className={styles.successSub}>
            Your image{mode === "both" ? "s have" : " has"} been resized successfully.
            Review the preview below and download.
          </p>
        </div>
      </div>

      {}
      <div className={styles.cardsGrid} data-cols={mode === "both" ? "2" : "1"}>
        {showPhoto && photo && (
          <CompareCard result={photo} label="📷 Photo" />
        )}
        {showSig && signature && (
          <CompareCard result={signature} label="✍️ Signature" />
        )}
      </div>

      {}
      <div className={styles.actions}>
        <div className={styles.actionsLeft}>
          <button className={styles.reEditBtn} onClick={onReEdit}>
            🔄 Re-edit (keep files)
          </button>
          <button className={styles.startOverBtn} onClick={onStartOver}>
            ✕ Start Over
          </button>
        </div>
        {mode === "both" && showPhoto && showSig && (
          <button className={styles.downloadAllBtn} onClick={downloadAll}>
            ⬇ Download All
          </button>
        )}
      </div>
    </div>
  );
}
