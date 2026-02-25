import styles from "./Step5Results.module.css";
import type { ProcessedFile, ResizeMode } from "../types";

interface Props {
  mode: ResizeMode;
  photo: ProcessedFile | null;
  signature: ProcessedFile | null;
  onReEdit: () => void;
  onStartOver: () => void;
}

function downloadUrl(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? styles.statHighlight : ""}>
      <td className={styles.statLabel}>{label}</td>
      <td className={styles.statValue}>{value}</td>
    </tr>
  );
}

function SizeReduction({ before, after }: { before: number; after: number }) {
  const pct = Math.round(((before - after) / before) * 100);
  const positive = pct > 0;
  return (
    <span
      className={styles.sizeBadge}
      style={{
        background: positive ? "#dcfce7" : "#fee2e2",
        color: positive ? "#15803d" : "#b91c1c",
      }}
    >
      {positive ? `▼ ${pct}%` : `▲ ${Math.abs(pct)}%`}
    </span>
  );
}

function ResultCard({
  title,
  item,
  filename,
}: {
  title: string;
  item: ProcessedFile;
  filename: string;
}) {
  const compressionPct =
    item.originalSizeKB > 0
      ? Math.round(
          ((item.originalSizeKB - item.resizedSizeKB) / item.originalSizeKB) * 100,
        )
      : 0;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>

      {}
      <div className={styles.stageStrip}>
        {}
        <div className={styles.stage}>
          <p className={styles.stageLabel}>Original upload</p>
          <div className={styles.stageImgWrap}>
            <img
              src={item.originalUrl}
              alt="Original"
              className={styles.stageImg}
            />
          </div>
          <p className={styles.stageStat}>
            {item.originalWidth}×{item.originalHeight} px
            &nbsp;·&nbsp;{item.originalSizeKB.toFixed(0)} KB
          </p>
        </div>

        <div className={styles.arrow}>→</div>

        {}
        {item.croppedDataUrl && (
          <>
            <div className={styles.stage}>
              <p className={styles.stageLabel}>
                {item.bgProcessedDataUrl ? "After bg removal" : "Cropped"}
              </p>
              <div className={styles.stageImgWrap}>
                <img
                  src={item.bgProcessedDataUrl ?? item.croppedDataUrl}
                  alt="Cropped"
                  className={styles.stageImg}
                />
              </div>
              {item.bgColorApplied && (
                <p className={styles.bgBadge}>
                  BG: {item.bgColorApplied}
                </p>
              )}
            </div>
            <div className={styles.arrow}>→</div>
          </>
        )}

        {}
        <div className={styles.stage}>
          <p className={styles.stageLabel}>
            Final output
            {compressionPct > 0 && (
              <SizeReduction before={item.originalSizeKB} after={item.resizedSizeKB} />
            )}
          </p>
          <div className={styles.stageImgWrap + " " + styles.finalImgWrap}>
            <img
              src={item.resizedUrl}
              alt="Final"
              className={styles.stageImg}
            />
          </div>
          <p className={styles.stageStat}>
            {item.resizedWidth}×{item.resizedHeight} px
            &nbsp;·&nbsp;{item.resizedSizeKB.toFixed(0)} KB
          </p>
        </div>
      </div>

      {}
      <table className={styles.statsTable}>
        <tbody>
          <StatRow label="Original size" value={`${item.originalWidth}×${item.originalHeight} px`} />
          <StatRow label="Output size"   value={`${item.resizedWidth}×${item.resizedHeight} px`} highlight />
          <StatRow label="File size"     value={`${item.resizedSizeKB.toFixed(0)} KB (was ${item.originalSizeKB.toFixed(0)} KB)`} highlight />
          <StatRow label="DPI"           value={`${item.dpi}`} />
          <StatRow label="Format"        value={item.format.toUpperCase()} />
          {item.quality !== undefined && (
            <StatRow label="Quality" value={`${Math.round(item.quality * 100)}%`} />
          )}
          {item.bgColorApplied && (
            <StatRow label="Background" value={item.bgColorApplied} />
          )}
        </tbody>
      </table>

      <button
        className={styles.downloadBtn}
        onClick={() =>
          downloadUrl(item.resizedUrl, `${filename}.${item.format}`)
        }
      >
        ⬇ Download {title}
      </button>
    </div>
  );
}

export default function Step5Results({
  mode,
  photo,
  signature,
  onReEdit,
  onStartOver,
}: Props) {
  function downloadAll() {
    if (photo) downloadUrl(photo.resizedUrl, `photo.${photo.format}`);
    if (signature) downloadUrl(signature.resizedUrl, `signature.${signature.format}`);
  }

  return (
    <div className={styles.root}>
      {}
      <div className={styles.successBanner}>
        <span className={styles.successIcon}>✅</span>
        <div>
          <p className={styles.successTitle}>Processing complete!</p>
          <p className={styles.successSub}>
            Your image{mode === "both" ? "s have" : " has"} been resized and
            are ready to download.
          </p>
        </div>
      </div>

      {}
      <div className={styles.cardsGrid}>
        {photo && (
          <ResultCard title="📷 Photo" item={photo} filename="photo" />
        )}
        {signature && (
          <ResultCard title="✍ Signature" item={signature} filename="signature" />
        )}
      </div>

      {}
      <div className={styles.actionBar}>
        <button className={styles.startOverBtn} onClick={onStartOver}>
          🔁 Start Over
        </button>
        <button className={styles.reEditBtn} onClick={onReEdit}>
          ✏ Re-edit (keep files)
        </button>
        {mode === "both" && (
          <button className={styles.dlAllBtn} onClick={downloadAll}>
            ⬇ Download All
          </button>
        )}
      </div>
    </div>
  );
}
