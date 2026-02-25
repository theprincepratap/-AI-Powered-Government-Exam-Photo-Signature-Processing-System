import { useState } from "react";
import { GOVT_TEMPLATES, groupedTemplates, getTemplate } from "../utils/govtTemplates";
import type { GovtTemplate, DimensionSpec } from "../utils/govtTemplates";
import type { ResizeMode } from "../types";
import styles from "./TemplatePanel.module.css";

interface Props {
  mode: ResizeMode;
  selectedId: string;
  onSelect: (id: string) => void;
}

function SpecCard({
  spec, label, icon,
}: { spec: DimensionSpec; label: string; icon: string }) {
  const widthCm  = ((spec.widthPx  / spec.dpi) * 2.54).toFixed(2);
  const heightCm = ((spec.heightPx / spec.dpi) * 2.54).toFixed(2);
  return (
    <div className={styles.specCard}>
      <p className={styles.specTitle}>{icon} {label}</p>
      <div className={styles.specRows}>
        <div className={styles.specRow}><span>Dimensions</span><span>{spec.widthPx} × {spec.heightPx} px</span></div>
        <div className={styles.specRow}><span>Print size</span><span>{widthCm} × {heightCm} cm</span></div>
        <div className={styles.specRow}><span>DPI</span><span>{spec.dpi}</span></div>
        <div className={styles.specRow}><span>Max size</span><span>{spec.maxSizeKB} KB</span></div>
        <div className={styles.specRow}><span>Format</span><span>{spec.format.toUpperCase()}</span></div>
        {spec.notes && <div className={`${styles.specRow} ${styles.specNote}`}><span>Note</span><span>{spec.notes}</span></div>}
      </div>
    </div>
  );
}

export default function TemplatePanel({ mode, selectedId, onSelect }: Props) {
  const grouped = groupedTemplates();
  const selected = getTemplate(selectedId);

  return (
    <div className={styles.panel}>
      <h4 className={styles.title}>📋 Select Government Exam Template</h4>

      {}
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          aria-label="Government exam template"
        >
          <option value="">— Choose an exam / portal —</option>
          {Object.entries(grouped).map(([category, templates]) => (
            <optgroup key={category} label={category}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className={styles.selectArrow}>▾</span>
      </div>

      {}
      <div className={styles.quickGrid}>
        {GOVT_TEMPLATES.slice(0, 6).map((t) => (
          <button
            key={t.id}
            className={`${styles.quickTile} ${selectedId === t.id ? styles.quickActive : ""}`}
            onClick={() => onSelect(t.id)}
          >
            {t.label.split("(")[0].trim()}
          </button>
        ))}
      </div>

      {}
      {selected && (
        <div className={styles.specGrid}>
          {(mode === "photo" || mode === "both") && (
            <SpecCard spec={selected.photo} label="Photo Spec" icon="📷" />
          )}
          {(mode === "signature" || mode === "both") && (
            <SpecCard spec={selected.signature} label="Signature Spec" icon="✍️" />
          )}
        </div>
      )}
    </div>
  );
}
