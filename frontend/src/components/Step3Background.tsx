import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { removeBackground } from "../utils/api";
import { applyBackground, urlToFile } from "../utils/cropImage";
import type { BgColor, BackgroundConfig } from "../types";
import styles from "./Step3Background.module.css";

interface Props {
  croppedDataUrl: string;
  bgConfig: BackgroundConfig;
  onBgConfig: Dispatch<SetStateAction<BackgroundConfig>>;
  onNext: (processedUrl: string) => void;
  onBack: () => void;
}

const BG_OPTIONS: { id: BgColor; label: string; color: string; emoji: string }[] = [
  { id: "white",       label: "White",       color: "#ffffff", emoji: "⬜" },
  { id: "blue",        label: "Sky Blue",    color: "#4a90d9", emoji: "🟦" },
  { id: "black",       label: "Black",       color: "#000000", emoji: "⬛" },
  { id: "transparent", label: "Transparent", color: "transparent", emoji: "🔲" },
  { id: "custom",      label: "Custom",      color: "",        emoji: "🎨" },
];

export default function Step3Background({
  croppedDataUrl,
  bgConfig,
  onBgConfig,
  onNext,
  onBack,
}: Props) {
  const [compositeUrl, setCompositeUrl] = useState<string | null>(
    bgConfig.compositeDataUrl,
  );

  const effectiveColor =
    bgConfig.bgColor === "custom"
      ? bgConfig.customColor
      : BG_OPTIONS.find((o) => o.id === bgConfig.bgColor)?.color ?? "#ffffff";

  useEffect(() => {
    if (!bgConfig.removeBackground || !bgConfig.resultDataUrl) return;

    let cancelled = false;
    applyBackground(bgConfig.resultDataUrl, effectiveColor).then((url) => {
      if (!cancelled) {
        setCompositeUrl(url);

        onBgConfig((prev) => ({ ...prev, compositeDataUrl: url }));
      }
    });
    return () => { cancelled = true; };

  }, [bgConfig.resultDataUrl, effectiveColor, bgConfig.removeBackground]);

  const runRemoveBg = useCallback(async () => {
    onBgConfig((prev) => ({
      ...prev,
      processing: true,
      error: null,
      resultDataUrl: null,
      compositeDataUrl: null,
    }));
    setCompositeUrl(null);
    try {
      const file      = await urlToFile(croppedDataUrl, "crop.jpg");
      const resultUrl = await removeBackground(file);
      onBgConfig((prev) => ({
        ...prev,
        processing: false,
        resultDataUrl: resultUrl,
        compositeDataUrl: null,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Background removal failed.";
      onBgConfig((prev) => ({
        ...prev,
        processing: false,
        error: msg,
        resultDataUrl: null,
        compositeDataUrl: null,
      }));
    }

  }, [croppedDataUrl, onBgConfig]);

  function handleToggle(checked: boolean) {
    if (!checked) {
      onBgConfig((prev) => ({
        ...prev,
        removeBackground: false,
        resultDataUrl: null,
        compositeDataUrl: null,
        error: null,
      }));
      setCompositeUrl(null);
    } else {
      onBgConfig((prev) => ({ ...prev, removeBackground: true }));
    }
  }

  const previewUrl = bgConfig.removeBackground
    ? (compositeUrl ?? bgConfig.resultDataUrl ?? croppedDataUrl)
    : croppedDataUrl;

  const canProceed =
    !bgConfig.processing &&
    (!bgConfig.removeBackground || (bgConfig.resultDataUrl !== null && !bgConfig.error));

  function handleNext() {
    onNext(previewUrl!);
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>🎨 Background Removal</h2>
        <p className={styles.subtitle}>
          Optionally remove the background from your photo and replace it with a solid color.
        </p>
      </div>

      {}
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={bgConfig.removeBackground}
          onChange={(e) => handleToggle(e.target.checked)}
          className={styles.toggleInput}
        />
        <span className={styles.toggleSlider} />
        <span className={styles.toggleText}>
          {bgConfig.removeBackground ? "🟢 Background removal ON" : "⚪ Skip background removal"}
        </span>
      </label>

      {bgConfig.removeBackground && (
        <>
          {}
          {!bgConfig.resultDataUrl && !bgConfig.processing && (
            <div className={styles.runBox}>
              <p className={styles.runDesc}>
                Click below to run AI segmentation (U2-Net model via rembg).
                <br />
                <span>Processing usually takes 1–3 seconds.</span>
              </p>
              <button className={styles.runBtn} onClick={runRemoveBg}>
                🤖 Remove Background
              </button>
            </div>
          )}

          {}
          {bgConfig.processing && (
            <div className={styles.processingBox}>
              <div className={styles.bigSpinner} />
              <p>Running AI segmentation…</p>
            </div>
          )}

          {}
          {bgConfig.error && (
            <div className={styles.errorBox}>
              <p>⚠ {bgConfig.error}</p>
              <button className={styles.retryBtn} onClick={runRemoveBg}>
                Retry
              </button>
            </div>
          )}

          {}
          {bgConfig.resultDataUrl && !bgConfig.processing && (
            <div className={styles.colorSection}>
              <p className={styles.colorLabel}>Select background color:</p>
              <div className={styles.colorGrid}>
                {BG_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`${styles.colorBtn} ${bgConfig.bgColor === opt.id ? styles.colorActive : ""}`}
                    onClick={() => onBgConfig({ ...bgConfig, bgColor: opt.id })}
                    title={opt.label}
                  >
                    <span
                      className={styles.colorSwatch}
                      style={{
                        background: opt.id === "transparent"
                          ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 12px 12px"
                          : opt.id === "custom"
                          ? bgConfig.customColor
                          : opt.color,
                        border: opt.color === "#ffffff" ? "1px solid #d1d5db" : undefined,
                      }}
                    />
                    <span>{opt.emoji} {opt.label}</span>
                  </button>
                ))}
              </div>

              {}
              {bgConfig.bgColor === "custom" && (
                <div className={styles.customRow}>
                  <label className={styles.customLabel}>Custom color:</label>
                  <input
                    type="color"
                    value={bgConfig.customColor}
                    onChange={(e) =>
                      onBgConfig({ ...bgConfig, customColor: e.target.value })
                    }
                    className={styles.colorInput}
                  />
                  <input
                    type="text"
                    value={bgConfig.customColor}
                    maxLength={7}
                    onChange={(e) =>
                      onBgConfig({ ...bgConfig, customColor: e.target.value })
                    }
                    className={styles.hexInput}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {}
      <div className={styles.previewRow}>
        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>Original crop</p>
          <img src={croppedDataUrl} alt="Cropped" className={styles.previewImg} />
        </div>
        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>
            {bgConfig.removeBackground ? "With AI background" : "No changes"}
          </p>
          <img
            src={previewUrl}
            alt="Processed"
            className={styles.previewImg}
            style={{
              background:
                bgConfig.bgColor === "transparent"
                  ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 16px 16px"
                  : undefined,
            }}
          />
        </div>
      </div>

      {}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <button
          className={styles.nextBtn}
          disabled={!canProceed}
          onClick={handleNext}
        >
          {bgConfig.removeBackground && !bgConfig.resultDataUrl
            ? "Run AI first"
            : "Continue to Resize →"}
        </button>
      </div>
    </div>
  );
}
