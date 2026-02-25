import type { ManualConfig } from "../types";
import styles from "./ManualResizePanel.module.css";

interface Props {

  kind: "photo" | "signature";
  config: ManualConfig;
  onChange: (config: ManualConfig) => void;
}

const FORMATS = ["jpg", "png"] as const;
const DPI_PRESETS = [72, 96, 100, 150, 200, 300];

export default function ManualResizePanel({ kind, config, onChange }: Props) {
  function set<K extends keyof ManualConfig>(key: K, value: ManualConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  const widthCm  = ((config.widthPx  / config.dpi) * 2.54).toFixed(2);
  const heightCm = ((config.heightPx / config.dpi) * 2.54).toFixed(2);

  return (
    <div className={styles.panel}>
      <h4 className={styles.title}>
        🛠 Manual Resize Options
        {kind === "photo" ? " — Photo" : " — Signature"}
      </h4>

      <div className={styles.grid}>
        {}
        <label className={styles.field}>
          <span>Width (px)</span>
          <input
            type="number"
            min={10} max={4000}
            value={config.widthPx}
            onChange={(e) => set("widthPx", Math.max(10, Number(e.target.value)))}
          />
          <small>{widthCm} cm</small>
        </label>

        {}
        <label className={styles.field}>
          <span>Height (px)</span>
          <input
            type="number"
            min={10} max={4000}
            value={config.heightPx}
            onChange={(e) => set("heightPx", Math.max(10, Number(e.target.value)))}
          />
          <small>{heightCm} cm</small>
        </label>

        {}
        <label className={styles.field}>
          <span>DPI / Resolution</span>
          <div className={styles.dpiRow}>
            <input
              type="number"
              min={72} max={600}
              value={config.dpi}
              onChange={(e) => set("dpi", Math.max(72, Number(e.target.value)))}
            />
            <div className={styles.dpiPresets}>
              {DPI_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`${styles.pill} ${config.dpi === d ? styles.pillActive : ""}`}
                  onClick={() => set("dpi", d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </label>

        {}
        <label className={styles.field}>
          <span>Max File Size (KB)</span>
          <input
            type="number"
            min={1}
            value={config.maxSizeKB}
            onChange={(e) => set("maxSizeKB", Math.max(1, Number(e.target.value)))}
          />
          <small>Leave high (e.g. 5000) for no limit</small>
        </label>

        {}
        <label className={styles.field} style={{ gridColumn: "1 / -1" }}>
          <span>Output Format</span>
          <div className={styles.formatRow}>
            {FORMATS.map((fmt) => (
              <button
                key={fmt}
                type="button"
                className={`${styles.fmtBtn} ${config.format === fmt ? styles.fmtActive : ""}`}
                onClick={() => set("format", fmt)}
              >
                {fmt.toUpperCase()}
                {fmt === "jpg" && <small>smaller size</small>}
                {fmt === "png" && <small>lossless</small>}
              </button>
            ))}
          </div>
        </label>
      </div>

      {}
      <div className={styles.summary}>
        <span>→</span>
        <span>
          {config.widthPx} × {config.heightPx} px &nbsp;|&nbsp;
          {widthCm} × {heightCm} cm &nbsp;|&nbsp;
          {config.dpi} DPI &nbsp;|&nbsp;
          {config.format.toUpperCase()} &nbsp;|&nbsp;
          Max {config.maxSizeKB} KB
        </span>
      </div>
    </div>
  );
}
