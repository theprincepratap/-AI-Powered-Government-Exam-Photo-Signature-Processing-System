import { useState } from "react";
import { aggregateResults } from "../api/client";
import type {
  PhotoSubmission,
  SignatureSubmission,
  AggregateResult,
} from "../types";
import styles from "./ResultsPanel.module.css";

interface Props {
  applicantId: string;
  photo: PhotoSubmission | null;
  signature: SignatureSubmission | null;
}

function MetaRow({ label, value }: { label: string; value: string | number | boolean }) {
  const display =
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{display}</span>
    </div>
  );
}

export default function ResultsPanel({ applicantId, photo, signature }: Props) {
  const [result, setResult] = useState<AggregateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bothReady =
    photo?.metadata?.rules !== undefined &&
    signature?.metadata?.rules !== undefined;

  async function handleAggregate() {
    setLoading(true);
    setError(null);
    try {
      const agg = await aggregateResults(applicantId);
      setResult(agg);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Aggregation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Validation Results</h2>

      {}
      <div className={styles.summaryGrid}>
        {}
        <div className={styles.summaryCard}>
          <h4>📷 Photo</h4>
          {photo?.metadata?.rules ? (
            <>
              <MetaRow label="Valid" value={photo.metadata.rules.is_valid} />
              <MetaRow label="Reason" value={photo.metadata.rules.reason} />
              {photo.metadata.rules.confidence !== undefined && (
                <MetaRow
                  label="Confidence"
                  value={`${(photo.metadata.rules.confidence * 100).toFixed(1)}%`}
                />
              )}
              {photo.metadata.rules.face_count !== undefined && (
                <MetaRow label="Faces detected" value={photo.metadata.rules.face_count} />
              )}
              {photo.metadata.target_size && (
                <MetaRow
                  label="Output size"
                  value={`${photo.metadata.target_size[0]} × ${photo.metadata.target_size[1]} px`}
                />
              )}
            </>
          ) : (
            <p className={styles.pending}>Upload &amp; process a photo first.</p>
          )}
        </div>

        {}
        <div className={styles.summaryCard}>
          <h4>✍ Signature</h4>
          {signature?.metadata?.rules ? (
            <>
              <MetaRow label="Valid" value={signature.metadata.rules.is_valid} />
              <MetaRow label="Reason" value={signature.metadata.rules.reason} />
              {signature.metadata.rules.strokes_detected !== undefined && (
                <MetaRow label="Strokes" value={signature.metadata.rules.strokes_detected} />
              )}
              {signature.metadata.rules.ink_coverage !== undefined && (
                <MetaRow
                  label="Ink coverage"
                  value={`${(signature.metadata.rules.ink_coverage * 100).toFixed(2)}%`}
                />
              )}
              {signature.metadata.target_size && (
                <MetaRow
                  label="Output size"
                  value={`${signature.metadata.target_size[0]} × ${signature.metadata.target_size[1]} px`}
                />
              )}
            </>
          ) : (
            <p className={styles.pending}>Upload &amp; process a signature first.</p>
          )}
        </div>
      </div>

      {}
      <button
        className={styles.aggregateBtn}
        onClick={handleAggregate}
        disabled={!bothReady || loading}
        title={!bothReady ? "Process both photo and signature first." : undefined}
      >
        {loading ? "Aggregating…" : "Generate Final Verdict"}
      </button>

      {error && <p className={styles.error}>⚠ {error}</p>}

      {}
      {result && (
        <div className={`${styles.verdict} ${result.is_valid ? styles.pass : styles.fail}`}>
          <span className={styles.verdictIcon}>{result.is_valid ? "✓" : "✗"}</span>
          <div>
            <p className={styles.verdictTitle}>
              {result.is_valid ? "Application Accepted" : "Application Rejected"}
            </p>
            {result.rules_triggered.length > 0 ? (
              <ul className={styles.rulesList}>
                {result.rules_triggered.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.verdictSub}>All validation checks passed.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
