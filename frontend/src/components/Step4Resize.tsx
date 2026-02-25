import { useEffect, useMemo, useState } from "react";
import { fetchTemplates } from "../utils/api";
import type {
  GovtTemplate,
  ManualConfig,
  ResizeMethod,
  ResizeMode,
} from "../types";
import styles from "./Step4Resize.module.css";

interface Props {
  mode: ResizeMode;
  resizeMethod: ResizeMethod;
  onResizeMethod: (m: ResizeMethod) => void;
  photoManual: ManualConfig;
  signatureManual: ManualConfig;
  onPhotoManual: (c: ManualConfig) => void;
  onSignatureManual: (c: ManualConfig) => void;
  templateId: string;
  onTemplateId: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const DPI_PRESETS = [72, 96, 150, 200, 300];

function ManualForm({
  kind,
  config,
  onChange,
}: {
  kind: "photo" | "signature";
  config: ManualConfig;
  onChange: (c: ManualConfig) => void;
}) {
  const widthMM  = ((config.widthPx  / config.dpi) * 25.4).toFixed(1);
  const heightMM = ((config.heightPx / config.dpi) * 25.4).toFixed(1);

  const upd = (patch: Partial<ManualConfig>) => onChange({ ...config, ...patch });

  return (
    <div className={styles.manualForm}>
      <p className={styles.manualKind}>
        {kind === "photo" ? "📷 Photo" : "✍ Signature"}
      </p>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label>Width (px)</label>
          <input
            type="number" min={1} max={4000}
            value={config.widthPx}
            onChange={(e) => upd({ widthPx: Number(e.target.value) || 1 })}
          />
        </div>
        <div className={styles.field}>
          <label>Height (px)</label>
          <input
            type="number" min={1} max={4000}
            value={config.heightPx}
            onChange={(e) => upd({ heightPx: Number(e.target.value) || 1 })}
          />
        </div>
        <div className={styles.field}>
          <label>Max size (KB)</label>
          <input
            type="number" min={1} max={10240}
            value={config.maxSizeKB}
            onChange={(e) => upd({ maxSizeKB: Number(e.target.value) || 1 })}
          />
        </div>
        <div className={styles.field}>
          <label>Format</label>
          <select
            value={config.format}
            onChange={(e) => upd({ format: e.target.value as "jpg" | "png" })}
          >
            <option value="jpg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>

      {}
      <div className={styles.field}>
        <label>DPI</label>
        <div className={styles.dpiRow}>
          {DPI_PRESETS.map((d) => (
            <button
              key={d}
              className={`${styles.dpiPill} ${config.dpi === d ? styles.dpiActive : ""}`}
              onClick={() => upd({ dpi: d })}
            >
              {d}
            </button>
          ))}
          <input
            type="number" min={1} max={600}
            value={config.dpi}
            onChange={(e) => upd({ dpi: Number(e.target.value) || 72 })}
            className={styles.dpiInput}
            title="Custom DPI"
          />
        </div>
      </div>

      <p className={styles.mmHint}>
        ≈ {widthMM} × {heightMM} mm @ {config.dpi} DPI
      </p>
    </div>
  );
}

function TemplateSpecCard({
  template,
  mode,
}: {
  template: GovtTemplate;
  mode: ResizeMode;
}) {
  const rows: { label: string; spec: import("../types").DimensionSpec }[] = [];
  if (mode !== "signature") rows.push({ label: "Photo", spec: template.photo });
  if (mode !== "photo")     rows.push({ label: "Signature", spec: template.signature });

  return (
    <div className={styles.specCard}>
      <p className={styles.specTitle}>{template.name}</p>
      <p className={styles.specDesc}>{template.description}</p>
      {rows.map((r) => (
        <div key={r.label} className={styles.specRow}>
          <strong>{r.label}:</strong>{" "}
          {r.spec.widthPx} × {r.spec.heightPx} px
          &nbsp;({r.spec.widthMM}×{r.spec.heightMM} mm)
          &nbsp;·&nbsp; {r.spec.dpi} DPI
          &nbsp;·&nbsp; max {r.spec.maxSizeKB} KB
          &nbsp;·&nbsp; {r.spec.format.toUpperCase()}
          {r.spec.notes && (
            <p className={styles.specNote}>💡 {r.spec.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Step4Resize({
  mode,
  resizeMethod,
  onResizeMethod,
  photoManual,
  signatureManual,
  onPhotoManual,
  onSignatureManual,
  templateId,
  onTemplateId,
  onNext,
  onBack,
}: Props) {
  const [templates, setTemplates]  = useState<GovtTemplate[]>([]);
  const [loadErr,   setLoadErr]    = useState<string | null>(null);
  const [loading,   setLoading]    = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTemplates()
      .then((data) => {
        setTemplates(data.templates);
        if (!templateId && data.templates.length > 0) {
          onTemplateId(data.templates[0].id);
        }
      })
      .catch((err: unknown) => {
        setLoadErr(err instanceof Error ? err.message : "Failed to load templates.");
      })
      .finally(() => setLoading(false));

  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId],
  );

  const groups = useMemo(() => {
    const map = new Map<string, GovtTemplate[]>();
    for (const t of templates) {
      const arr = map.get(t.group) ?? [];
      arr.push(t);
      map.set(t.group, arr);
    }
    return [...map.entries()];
  }, [templates]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>⚙ Resize Configuration</h2>
        <p className={styles.subtitle}>
          Choose an exam template or set custom dimensions manually.
        </p>
      </div>

      {}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${resizeMethod === "template" ? styles.tabActive : ""}`}
          onClick={() => onResizeMethod("template")}
        >
          🏛 Exam Template
        </button>
        <button
          className={`${styles.tab} ${resizeMethod === "manual" ? styles.tabActive : ""}`}
          onClick={() => onResizeMethod("manual")}
        >
          🔧 Manual
        </button>
      </div>

      {}
      {resizeMethod === "template" && (
        <div className={styles.panel}>
          {loading && <p className={styles.loadMsg}>Loading templates…</p>}
          {loadErr && (
            <div className={styles.errorBox}>⚠ {loadErr}</div>
          )}
          {!loading && !loadErr && (
            <>
              <label className={styles.dropLabel}>Select exam / organisation:</label>
              <select
                className={styles.templateSelect}
                value={templateId}
                onChange={(e) => onTemplateId(e.target.value)}
              >
                {groups.map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {}
              <div className={styles.quickTiles}>
                {templates.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    className={`${styles.tile} ${templateId === t.id ? styles.tileActive : ""}`}
                    onClick={() => onTemplateId(t.id)}
                  >
                    {t.name.split(" ")[0]}
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <TemplateSpecCard template={selectedTemplate} mode={mode} />
              )}
            </>
          )}
        </div>
      )}

      {}
      {resizeMethod === "manual" && (
        <div className={styles.panel}>
          {(mode === "photo" || mode === "both") && (
            <ManualForm kind="photo" config={photoManual} onChange={onPhotoManual} />
          )}
          {(mode === "signature" || mode === "both") && (
            <ManualForm kind="signature" config={signatureManual} onChange={onSignatureManual} />
          )}
        </div>
      )}

      {}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <button className={styles.nextBtn} onClick={onNext}>
          Process &amp; Preview →
        </button>
      </div>
    </div>
  );
}
