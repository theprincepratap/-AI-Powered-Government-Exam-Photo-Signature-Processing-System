import { useState } from "react";
import type { ResizeMode, ResizeMethod, ManualConfig } from "../types";
import FileDropZone from "./FileDropZone";
import ManualResizePanel from "./ManualResizePanel";
import TemplatePanel from "./TemplatePanel";
import styles from "./Step2Configure.module.css";

interface Props {
  mode: ResizeMode;
  photoFile: File | null;
  signatureFile: File | null;
  onPhotoFile: (f: File) => void;
  onSignatureFile: (f: File) => void;
  onClearPhoto: () => void;
  onClearSignature: () => void;
  resizeMethod: ResizeMethod;
  onResizeMethod: (m: ResizeMethod) => void;
  photoManual: ManualConfig;
  signatureManual: ManualConfig;
  onPhotoManual: (c: ManualConfig) => void;
  onSignatureManual: (c: ManualConfig) => void;
  templateId: string;
  onTemplateId: (id: string) => void;
  processing: boolean;
  onProcess: () => void;
  onBack: () => void;
}

export default function Step2Configure({
  mode, photoFile, signatureFile,
  onPhotoFile, onSignatureFile, onClearPhoto, onClearSignature,
  resizeMethod, onResizeMethod,
  photoManual, signatureManual, onPhotoManual, onSignatureManual,
  templateId, onTemplateId,
  processing, onProcess, onBack,
}: Props) {
  const needsPhoto = mode === "photo" || mode === "both";
  const needsSig   = mode === "signature" || mode === "both";

  const filesReady =
    (!needsPhoto || !!photoFile) && (!needsSig || !!signatureFile);

  const templateReady = resizeMethod === "template" ? !!templateId : true;
  const canProcess = filesReady && templateReady;

  return (
    <div className={styles.wrapper}>
      {}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.badge}>1</span> Upload Your File{mode === "both" ? "s" : ""}
        </h3>

        <div className={styles.uploadGrid} data-cols={mode === "both" ? "2" : "1"}>
          {needsPhoto && (
            <FileDropZone
              label="Photograph"
              icon="📷"
              file={photoFile}
              onFile={onPhotoFile}
              onClear={onClearPhoto}
              hint="Passport-style front-facing photo"
              maxSizeMB={10}
            />
          )}
          {needsSig && (
            <FileDropZone
              label="Signature"
              icon="✍️"
              file={signatureFile}
              onFile={onSignatureFile}
              onClear={onClearSignature}
              hint="Black ink signature on white background"
              maxSizeMB={5}
            />
          )}
        </div>
      </section>

      {}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.badge}>2</span> Choose Resize Method
        </h3>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${resizeMethod === "template" ? styles.tabActive : ""}`}
            onClick={() => onResizeMethod("template")}
          >
            <span className={styles.tabIcon}>📋</span>
            <div>
              <p>Predefined Template</p>
              <small>Choose from SSC, UPSC, SBI, Railway &amp; more</small>
            </div>
          </button>
          <button
            className={`${styles.tab} ${resizeMethod === "manual" ? styles.tabActive : ""}`}
            onClick={() => onResizeMethod("manual")}
          >
            <span className={styles.tabIcon}>🛠</span>
            <div>
              <p>Manual Resize</p>
              <small>Set custom width, height, DPI &amp; format</small>
            </div>
          </button>
        </div>

        {}
        <div className={styles.methodPanel}>
          {resizeMethod === "template" && (
            <TemplatePanel
              mode={mode}
              selectedId={templateId}
              onSelect={onTemplateId}
            />
          )}

          {resizeMethod === "manual" && (
            <div className={styles.manualPanels}>
              {needsPhoto && (
                <ManualResizePanel
                  kind="photo"
                  config={photoManual}
                  onChange={onPhotoManual}
                />
              )}
              {needsSig && (
                <ManualResizePanel
                  kind="signature"
                  config={signatureManual}
                  onChange={onSignatureManual}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {}
      {!filesReady && (
        <p className={styles.warn}>
          ⚠ Please upload {needsPhoto && !photoFile ? "your photo" : ""}
          {needsPhoto && !photoFile && needsSig && !signatureFile ? " and " : ""}
          {needsSig && !signatureFile ? "your signature" : ""} to continue.
        </p>
      )}
      {resizeMethod === "template" && !templateId && filesReady && (
        <p className={styles.warn}>⚠ Please select a template above.</p>
      )}

      {}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={onBack} disabled={processing}>
          ← Back
        </button>
        <button
          className={styles.processBtn}
          disabled={!canProcess || processing}
          onClick={onProcess}
        >
          {processing ? (
            <>
              <span className={styles.spinner} /> Processing…
            </>
          ) : (
            "✓ Process &amp; Generate Preview →"
          )}
        </button>
      </div>
    </div>
  );
}
