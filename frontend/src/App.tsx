
import { useState } from "react";
import StepIndicator    from "./components/StepIndicator";
import Step1Upload      from "./components/Step1Upload";
import Step2Crop        from "./components/Step2Crop";
import Step3Background  from "./components/Step3Background";
import Step4Resize      from "./components/Step4Resize";
import Step5Results     from "./components/Step5Results";
import { resizeImage, getImageDimensions } from "./utils/resizeImage";
import { fetchTemplates }                  from "./utils/api";
import type {
  AppStep,
  BackgroundConfig,
  ManualConfig,
  ProcessedFile,
  ResizeMethod,
  ResizeMode,
} from "./types";
import styles from "./App.module.css";

const DEFAULT_BG_CFG: BackgroundConfig = {
  removeBackground: false,
  bgColor:          "white",
  customColor:      "#ffffff",
  resultDataUrl:    null,
  compositeDataUrl: null,
  processing:       false,
  error:            null,
};

const DEFAULT_PHOTO_MANUAL: ManualConfig = {
  widthPx: 413, heightPx: 531, dpi: 300, maxSizeKB: 300, format: "jpg",
};
const DEFAULT_SIG_MANUAL: ManualConfig = {
  widthPx: 413, heightPx: 177, dpi: 300, maxSizeKB: 100, format: "jpg",
};

export default function App() {
  const [step, setStep]   = useState<AppStep>(1);
  const [mode, setMode]   = useState<ResizeMode | null>(null);

  const [photoFile,     setPhotoFile]     = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState<string | null>(null);

  const [bgConfig,   setBgConfig]   = useState<BackgroundConfig>(DEFAULT_BG_CFG);
  const [bgPhotoUrl, setBgPhotoUrl] = useState<string | null>(null);

  const [resizeMethod, setResizeMethod] = useState<ResizeMethod>("template");
  const [templateId,   setTemplateId]   = useState<string>("ssc_cgl");
  const [photoManual,  setPhotoManual]  = useState<ManualConfig>(DEFAULT_PHOTO_MANUAL);
  const [sigManual,    setSigManual]    = useState<ManualConfig>(DEFAULT_SIG_MANUAL);

  const [photoResult,  setPhotoResult]  = useState<ProcessedFile | null>(null);
  const [sigResult,    setSigResult]    = useState<ProcessedFile | null>(null);
  const [processing,   setProcessing]   = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  const skippedSteps: AppStep[] = mode === "signature" ? [2, 3] : [];

  function onStep1Next() {
    if (mode === "signature") setStep(4);
    else setStep(2);
  }

  function onCropComplete(url: string) {
    setCroppedPhotoUrl(url);
    setBgConfig(DEFAULT_BG_CFG);
    setBgPhotoUrl(null);
    setStep(3);
  }

  function onBgNext(processedUrl: string) {
    setBgPhotoUrl(processedUrl);
    setStep(4);
  }

  async function onProcess() {
    if (!mode) return;
    setProcessing(true);
    setProcessError(null);
    try {
      let photoConfig: ManualConfig;
      let sigConfig:   ManualConfig;

      if (resizeMethod === "template") {
        const { templates } = await fetchTemplates();
        const tmpl = templates.find((t) => t.id === templateId) ?? templates[0];
        photoConfig = { widthPx: tmpl.photo.widthPx, heightPx: tmpl.photo.heightPx, dpi: tmpl.photo.dpi, maxSizeKB: tmpl.photo.maxSizeKB, format: tmpl.photo.format };
        sigConfig   = { widthPx: tmpl.signature.widthPx, heightPx: tmpl.signature.heightPx, dpi: tmpl.signature.dpi, maxSizeKB: tmpl.signature.maxSizeKB, format: tmpl.signature.format };
      } else {
        photoConfig = photoManual;
        sigConfig   = sigManual;
      }

      if (mode !== "signature" && photoFile) {
        const origInfo  = await getImageDimensions(photoFile);
        const sourceUrl = bgPhotoUrl ?? bgConfig.compositeDataUrl ?? bgConfig.resultDataUrl ?? croppedPhotoUrl ?? URL.createObjectURL(photoFile);
        const resized   = await resizeImage(sourceUrl, { widthPx: photoConfig.widthPx, heightPx: photoConfig.heightPx, dpi: photoConfig.dpi, format: photoConfig.format, maxSizeKB: photoConfig.maxSizeKB, preserveAspectRatio: true });
        setPhotoResult({
          originalFile: photoFile, originalUrl: URL.createObjectURL(photoFile),
          originalSizeKB: origInfo.sizeKB, originalWidth: origInfo.width, originalHeight: origInfo.height,
          croppedDataUrl: croppedPhotoUrl ?? undefined,
          bgProcessedDataUrl: bgPhotoUrl ?? bgConfig.compositeDataUrl ?? bgConfig.resultDataUrl ?? undefined,
          bgColorApplied: bgConfig.removeBackground ? (bgConfig.bgColor === "custom" ? bgConfig.customColor : bgConfig.bgColor) : undefined,
          resizedUrl: resized.url, resizedSizeKB: resized.sizeKB, resizedWidth: resized.widthPx, resizedHeight: resized.heightPx,
          format: resized.format, dpi: photoConfig.dpi, quality: resized.quality,
        });
      }

      if (mode !== "photo" && signatureFile) {
        const origInfo = await getImageDimensions(signatureFile);
        const resized  = await resizeImage(signatureFile, { widthPx: sigConfig.widthPx, heightPx: sigConfig.heightPx, dpi: sigConfig.dpi, format: sigConfig.format, maxSizeKB: sigConfig.maxSizeKB, preserveAspectRatio: true });
        setSigResult({
          originalFile: signatureFile, originalUrl: URL.createObjectURL(signatureFile),
          originalSizeKB: origInfo.sizeKB, originalWidth: origInfo.width, originalHeight: origInfo.height,
          resizedUrl: resized.url, resizedSizeKB: resized.sizeKB, resizedWidth: resized.widthPx, resizedHeight: resized.heightPx,
          format: resized.format, dpi: sigConfig.dpi, quality: resized.quality,
        });
      }

      setStep(5);
    } catch (err: unknown) {
      setProcessError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  }

  function onReEdit() {
    setPhotoResult(null);
    setSigResult(null);
    setProcessError(null);
    setStep(4);
  }

  function resetAll() {
    setStep(1); setMode(null);
    setPhotoFile(null); setSignatureFile(null);
    setCroppedPhotoUrl(null);
    setBgConfig(DEFAULT_BG_CFG); setBgPhotoUrl(null);
    setPhotoResult(null); setSigResult(null); setProcessError(null);
    setResizeMethod("template"); setTemplateId("ssc_cgl");
    setPhotoManual(DEFAULT_PHOTO_MANUAL); setSigManual(DEFAULT_SIG_MANUAL);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.tricolour}>
          <span style={{ background: "#FF9933" }} />
          <span style={{ background: "#ffffff" }} />
          <span style={{ background: "#138808" }} />
        </div>
        <div className={styles.headerInner}>
          <div className={styles.headerLogo}>
            <span className={styles.logoIcon}>&#127988;</span>
            <div>
              <h1>GovPhoto AI Processor</h1>
              <p>Professional Crop &middot; AI Background Removal &middot; Government Resize</p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.stepBar}>
        <StepIndicator current={step} skipped={skippedSteps} />
      </div>

      <main className={styles.main}>
        {processError && (
          <div className={styles.errorAlert} role="alert">
            &#9888; {processError}
            <button className={styles.errorClose} onClick={() => setProcessError(null)}>&#10005;</button>
          </div>
        )}

        {step === 1 && (
          <Step1Upload
            mode={mode} onMode={setMode}
            photoFile={photoFile} signatureFile={signatureFile}
            onPhotoFile={setPhotoFile} onSignatureFile={setSignatureFile}
            onNext={onStep1Next}
          />
        )}

        {step === 2 && mode !== "signature" && (
          <Step2Crop
            mode={mode ?? "photo"} photoFile={photoFile}
            onCropComplete={onCropComplete} onBack={() => setStep(1)}
          />
        )}

        {step === 3 && mode !== "signature" && croppedPhotoUrl && (
          <Step3Background
            croppedDataUrl={croppedPhotoUrl}
            bgConfig={bgConfig} onBgConfig={setBgConfig}
            onNext={onBgNext} onBack={() => setStep(2)}
          />
        )}

        {step === 4 && mode && (
          <Step4Resize
            mode={mode}
            resizeMethod={resizeMethod} onResizeMethod={setResizeMethod}
            photoManual={photoManual} signatureManual={sigManual}
            onPhotoManual={setPhotoManual} onSignatureManual={setSigManual}
            templateId={templateId} onTemplateId={setTemplateId}
            onNext={onProcess}
            onBack={() => { if (mode === "signature") setStep(1); else setStep(3); }}
          />
        )}

        {processing && (
          <div className={styles.processingOverlay}>
            <div className={styles.processingCard}>
              <div className={styles.overlaySpinner} />
              <p>Processing your image&hellip;</p>
              <span>Resizing &amp; compressing to government spec</span>
            </div>
          </div>
        )}

        {step === 5 && mode && !processing && (
          <Step5Results
            mode={mode} photo={photoResult} signature={sigResult}
            onReEdit={onReEdit} onStartOver={resetAll}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          All processing is local in your browser &middot; No files uploaded to any server
          &nbsp;&middot;&nbsp; Background AI: rembg (U2-Net)
          &nbsp;&middot;&nbsp; SSC &middot; UPSC &middot; SBI &middot; Railway &middot; Bihar Police &amp; more
        </p>
        <p className={styles.footerCredit}>
          Made with &#10084; by{" "}
          <a href="https://github.com/theprincepratap" target="_blank" rel="noopener noreferrer">
            @theprincepratap
          </a>
        </p>
      </footer>
    </div>
  );
}
