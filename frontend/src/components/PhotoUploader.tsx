import { useRef, useState, ChangeEvent, DragEvent } from "react";
import { uploadPhoto, processPhoto } from "../api/client";
import type { PhotoSubmission, ProcessingStep } from "../types";
import ImagePreview from "./ImagePreview";
import ProcessingStatus from "./ProcessingStatus";
import styles from "./Uploader.module.css";

interface Props {
  applicantId: string;
  onProcessed: (submission: PhotoSubmission) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

const SPEC = { width: 413, height: 531, label: "35 × 45 mm @ 300 DPI" };

export default function PhotoUploader({ applicantId, onProcessed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ProcessingStep>("idle");
  const [message, setMessage] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submission, setSubmission] = useState<PhotoSubmission | null>(null);

  function pickFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      setStep("error");
      setMessage("Only JPEG, PNG or WebP images are accepted.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setStep("error");
      setMessage(`File must be ≤ ${MAX_SIZE_MB} MB.`);
      return;
    }
    setPreview(URL.createObjectURL(file));
    handleUploadAndProcess(file);
  }

  async function handleUploadAndProcess(file: File) {
    if (!applicantId.trim()) {
      setStep("error");
      setMessage("Please enter an Applicant ID first.");
      return;
    }
    try {
      setStep("uploading");
      setMessage("Uploading photo…");
      const uploaded = await uploadPhoto(applicantId, file);
      setSubmission(uploaded);

      setStep("processing");
      setMessage("Running AI pipeline (face detection → background removal → resize)…");
      const processed = await processPhoto(uploaded.id);
      setSubmission(processed);
      setStep("done");
      setMessage(`Processed — resized to ${SPEC.width}×${SPEC.height} px (${SPEC.label})`);
      onProcessed(processed);
    } catch (err: unknown) {
      setStep("error");
      const msg = err instanceof Error ? err.message : "Upload or processing failed.";
      setMessage(msg);
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  }

  return (
    <div className={styles.card}>
      {}
      <div className={styles.cardHeader}>
        <span className={styles.iconBox}>📷</span>
        <div>
          <h3>Passport-Style Photograph</h3>
          <p className={styles.spec}>
            Output: {SPEC.width} × {SPEC.height} px &nbsp;|&nbsp; {SPEC.label}
          </p>
        </div>
      </div>

      {}
      <div
        className={`${styles.dropZone} ${dragging ? styles.dragging : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload photo by clicking or dragging"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        {preview ? (
          <ImagePreview src={preview} kind="photo" label="Preview" />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.uploadIcon}>⬆</span>
            <span>Click or drag a photo here</span>
            <span className={styles.hint}>JPEG / PNG / WebP · max {MAX_SIZE_MB} MB</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={onInputChange}
        className="sr-only"
        aria-label="Photo file input"
      />

      {}
      {step === "done" && (
        <button
          className={styles.secondaryBtn}
          onClick={() => {
            setPreview(null);
            setStep("idle");
            setMessage("");
            setSubmission(null);
            inputRef.current?.value && (inputRef.current.value = "");
          }}
        >
          Replace Photo
        </button>
      )}

      {}
      <ProcessingStatus step={step} message={message} />

      {}
      {submission?.metadata?.rules && (
        <div className={`${styles.badge} ${submission.metadata.rules.is_valid ? styles.valid : styles.invalid}`}>
          {submission.metadata.rules.is_valid ? "✓ Photo Valid" : `✗ ${submission.metadata.rules.reason}`}
        </div>
      )}
    </div>
  );
}
