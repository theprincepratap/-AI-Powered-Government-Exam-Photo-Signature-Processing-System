import type { ResizeMode } from "../types";
import styles from "./Step1SelectMode.module.css";

const OPTIONS: { mode: ResizeMode; icon: string; title: string; desc: string }[] = [
  {
    mode: "photo",
    icon: "📷",
    title: "Resize Photo Only",
    desc: "Upload & resize your passport-style photograph to any government or exam specification.",
  },
  {
    mode: "signature",
    icon: "✍️",
    title: "Resize Signature Only",
    desc: "Upload & resize your handwritten signature image to match official portal requirements.",
  },
  {
    mode: "both",
    icon: "📄",
    title: "Resize Both Photo & Signature",
    desc: "Process both at once — ideal for applications that require uploading photo and signature together.",
  },
];

interface Props {
  selected: ResizeMode | null;
  onSelect: (mode: ResizeMode) => void;
  onNext: () => void;
}

export default function Step1SelectMode({ selected, onSelect, onNext }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>
        <h2>What do you want to resize?</h2>
        <p>Choose one option to get started. You can change this later.</p>
      </div>

      <div className={styles.grid}>
        {OPTIONS.map(({ mode, icon, title, desc }) => (
          <button
            key={mode}
            className={`${styles.card} ${selected === mode ? styles.selected : ""}`}
            onClick={() => onSelect(mode)}
            aria-pressed={selected === mode}
          >
            <span className={styles.icon}>{icon}</span>
            <div className={styles.cardBody}>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
            <span className={`${styles.check} ${selected === mode ? styles.checkVisible : ""}`}>
              ✓
            </span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <p className={styles.hint}>{selected ? `"${OPTIONS.find(o => o.mode === selected)!.title}" selected` : "Select an option above to continue"}</p>
        <button
          className={styles.nextBtn}
          disabled={!selected}
          onClick={onNext}
        >
          Continue to Upload &amp; Configure →
        </button>
      </div>
    </div>
  );
}
