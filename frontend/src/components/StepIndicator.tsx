import type { AppStep } from "../types";
import styles from "./StepIndicator.module.css";

const STEPS: { n: AppStep; label: string; icon: string }[] = [
  { n: 1, label: "Upload",     icon: "⬆" },
  { n: 2, label: "Crop",       icon: "✂" },
  { n: 3, label: "Background", icon: "🎨" },
  { n: 4, label: "Resize",     icon: "⚙" },
  { n: 5, label: "Download",   icon: "⬇" },
];

interface Props {
  current: AppStep;

  skipped?: AppStep[];
}

export default function StepIndicator({ current, skipped = [] }: Props) {
  return (
    <nav className={styles.nav} aria-label="Progress">
      {STEPS.map((step, idx) => {
        const isSkipped = skipped.includes(step.n);
        const state = isSkipped
          ? "skipped"
          : step.n < current
          ? "done"
          : step.n === current
          ? "active"
          : "future";

        return (
          <div key={step.n} className={styles.item}>
            {idx > 0 && (
              <div
                className={`${styles.line} ${
                  STEPS[idx - 1].n < current ? styles.lineDone : styles.linePending
                }`}
              />
            )}
            <div className={`${styles.circle} ${styles[state]}`}>
              {state === "done" ? (
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
                </svg>
              ) : state === "skipped" ? (
                <span style={{ fontSize: "0.7rem" }}>–</span>
              ) : (
                <span>{step.n}</span>
              )}
            </div>
            <p className={`${styles.label} ${styles[state + "Label"] ?? ""}`}>
              <span className={styles.stepIcon}>{step.icon}</span>
              {step.label}
            </p>
          </div>
        );
      })}
    </nav>
  );
}
