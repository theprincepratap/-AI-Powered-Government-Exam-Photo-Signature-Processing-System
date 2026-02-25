import styles from "./ProcessingStatus.module.css";
import type { ProcessingStep } from "../types";

const STEP_LABELS: Record<ProcessingStep, string> = {
  idle: "Waiting for upload",
  uploading: "Uploading…",
  processing: "Processing with AI…",
  done: "Done",
  error: "Error",
};

interface Props {
  step: ProcessingStep;
  message?: string;
}

export default function ProcessingStatus({ step, message }: Props) {
  if (step === "idle") return null;

  return (
    <div className={`${styles.status} ${styles[step]}`} role="status" aria-live="polite">
      {(step === "uploading" || step === "processing") && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
      {step === "done" && <span className={styles.icon}>✓</span>}
      {step === "error" && <span className={styles.icon}>✗</span>}
      <span>{message ?? STEP_LABELS[step]}</span>
    </div>
  );
}
