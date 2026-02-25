export type ResizeMode = "photo" | "signature" | "both";
export type ResizeMethod = "template" | "manual";

export type AppStep = 1 | 2 | 3 | 4 | 5;

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropState {
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  aspect: number | undefined;
  croppedAreaPixels: PixelCrop | null;
}

export type BgColor = "white" | "blue" | "black" | "transparent" | "custom";

export interface BackgroundConfig {
  removeBackground: boolean;
  bgColor: BgColor;
  customColor: string;

  resultDataUrl: string | null;

  compositeDataUrl: string | null;
  processing: boolean;
  error: string | null;
}

export interface ManualConfig {
  widthPx: number;
  heightPx: number;
  dpi: number;
  maxSizeKB: number;
  format: "jpg" | "png";
}

export interface DimensionSpec {
  widthPx: number;
  heightPx: number;
  widthMM: number;
  heightMM: number;
  dpi: number;
  maxSizeKB: number;
  format: "jpg" | "png";
  notes?: string;
}

export interface GovtTemplate {
  id: string;
  name: string;
  group: string;
  description: string;
  photo: DimensionSpec;
  signature: DimensionSpec;
}

export interface TemplatesApiResponse {
  templates: GovtTemplate[];
}

export interface ProcessedFile {

  originalFile: File;
  originalUrl: string;
  originalSizeKB: number;
  originalWidth: number;
  originalHeight: number;

  croppedDataUrl?: string;

  bgProcessedDataUrl?: string;

  resizedUrl: string;
  resizedSizeKB: number;
  resizedWidth: number;
  resizedHeight: number;
  format: "jpg" | "png";
  dpi: number;
  quality?: number;

  bgColorApplied?: string;
}

export interface FaceBBox {
  bbox: [number, number, number, number];
  confidence: number;
  width_px?: number;
  height_px?: number;
  detector?: string;
}

export interface PhotoValidation {
  face_count: number;
  single_face: boolean;
  size_ok: boolean;
  centred: boolean;
  is_valid: boolean;
  reason: string;
}

export interface RulesResult {
  is_valid: boolean;
  reason: string;
  confidence?: number;
  face_count?: number;
  strokes_detected?: number;
  ink_coverage?: number;
}

export interface PhotoMetadata {
  faces?: FaceBBox[];
  photo_validation?: PhotoValidation;
  bg_removed_path?: string;
  resized_path?: string;
  target_size?: [number, number];
  rules?: RulesResult;
}

export interface SignatureAnalysis {
  strokes: number;
  ink_coverage: number;
  has_ink: boolean;
  bounding_box?: [number, number, number, number] | null;
  is_valid: boolean;
  reason: string;
}

export interface SignatureMetadata {
  analysis?: SignatureAnalysis;
  cleaned_path?: string;
  resized_path?: string;
  target_size?: [number, number];
  rules?: RulesResult;
}

export interface PhotoSubmission {
  id: number;
  applicant_id: string;
  source: string;
  source_url: string;
  metadata: PhotoMetadata;
  created_at: string;
  updated_at: string;
}

export interface SignatureSubmission {
  id: number;
  applicant_id: string;
  source: string;
  source_url: string;
  metadata: SignatureMetadata;
  created_at: string;
  updated_at: string;
}

export interface ProcessingResult {
  id: number;
  applicant_id: string;
  photo: PhotoSubmission | null;
  signature: SignatureSubmission | null;
  is_valid: boolean;
  rules_triggered: string[];
  created_at: string;
  updated_at: string;
}

export interface ManualConfig {
  widthPx: number;
  heightPx: number;
  dpi: number;
  maxSizeKB: number;
  format: "jpg" | "png";
}

export interface ProcessedFile {
  originalFile: File;
  originalUrl: string;
  originalSizeKB: number;
  originalWidth: number;
  originalHeight: number;
  resizedUrl: string;
  resizedSizeKB: number;
  resizedWidth: number;
  resizedHeight: number;
  format: "jpg" | "png";
  dpi: number;
  quality?: number;
}

export interface FaceBBox {
  bbox: [number, number, number, number];
  confidence: number;
  width_px?: number;
  height_px?: number;
  detector?: string;
}

export interface PhotoValidation {
  face_count: number;
  single_face: boolean;
  size_ok: boolean;
  centred: boolean;
  is_valid: boolean;
  reason: string;
}

export interface RulesResult {
  is_valid: boolean;
  reason: string;
  confidence?: number;
  face_count?: number;
  strokes_detected?: number;
  ink_coverage?: number;
}

export interface PhotoMetadata {
  faces?: FaceBBox[];
  photo_validation?: PhotoValidation;
  bg_removed_path?: string;
  resized_path?: string;
  target_size?: [number, number];
  rules?: RulesResult;
}

export interface SignatureAnalysis {
  strokes: number;
  ink_coverage: number;
  has_ink: boolean;
  bounding_box?: [number, number, number, number] | null;
  is_valid: boolean;
  reason: string;
}

export interface SignatureMetadata {
  analysis?: SignatureAnalysis;
  cleaned_path?: string;
  resized_path?: string;
  target_size?: [number, number];
  rules?: RulesResult;
}

export interface PhotoSubmission {
  id: number;
  applicant_id: string;
  source: string;
  background_removed: string | null;
  metadata: PhotoMetadata;
  created_at: string;
  updated_at: string;
}

export interface SignatureSubmission {
  id: number;
  applicant_id: string;
  source: string;
  extracted: string | null;
  metadata: SignatureMetadata;
  created_at: string;
  updated_at: string;
}

export interface AggregateResult {
  id: number;
  applicant_id: string;
  photo: PhotoSubmission;
  signature: SignatureSubmission;
  is_valid: boolean;
  rules_triggered: string[];
  created_at: string;
  updated_at: string;
}

export type ProcessingStep = "idle" | "uploading" | "processing" | "done" | "error";
