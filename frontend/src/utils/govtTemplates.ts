export interface DimensionSpec {
  widthPx: number;
  heightPx: number;
  dpi: number;
  maxSizeKB: number;
  format: "jpg" | "png";
  notes?: string;
}

export interface GovtTemplate {
  id: string;
  label: string;
  category: string;
  photo: DimensionSpec;
  signature: DimensionSpec;
}

export const GOVT_TEMPLATES: GovtTemplate[] = [
  {
    id: "ssc_cgl",
    label: "SSC CGL / CHSL / MTS",
    category: "Central Govt",
    photo:     { widthPx: 100,  heightPx: 120,  dpi: 100, maxSizeKB: 20,  format: "jpg", notes: "White background, front-facing" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 100, maxSizeKB: 12,  format: "jpg", notes: "Black ink on white" },
  },
  {
    id: "upsc",
    label: "UPSC Civil Services",
    category: "Central Govt",
    photo:     { widthPx: 413,  heightPx: 531,  dpi: 300, maxSizeKB: 300, format: "jpg", notes: "3.5×4.5 cm @ 300 DPI" },
    signature: { widthPx: 413,  heightPx: 177,  dpi: 300, maxSizeKB: 300, format: "jpg", notes: "3.5×1.5 cm @ 300 DPI" },
  },
  {
    id: "ibps_sbi",
    label: "SBI / IBPS Bank PO & Clerk",
    category: "Banking",
    photo:     { widthPx: 200,  heightPx: 230,  dpi: 200, maxSizeKB: 50,  format: "jpg", notes: "Light / white background" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 200, maxSizeKB: 30,  format: "jpg", notes: "Black / dark blue ink" },
  },
  {
    id: "rrb_railway",
    label: "Railway RRB (NTPC / Group D)",
    category: "Central Govt",
    photo:     { widthPx: 200,  heightPx: 230,  dpi: 100, maxSizeKB: 40,  format: "jpg" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 100, maxSizeKB: 20,  format: "jpg" },
  },
  {
    id: "bihar_police",
    label: "Bihar Police Constable / SI",
    category: "State Police",
    photo:     { widthPx: 120,  heightPx: 150,  dpi: 100, maxSizeKB: 30,  format: "jpg" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 100, maxSizeKB: 12,  format: "jpg" },
  },
  {
    id: "up_police",
    label: "UP Police SI / Constable",
    category: "State Police",
    photo:     { widthPx: 120,  heightPx: 150,  dpi: 100, maxSizeKB: 50,  format: "jpg" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 100, maxSizeKB: 30,  format: "jpg" },
  },
  {
    id: "nta_jee_neet",
    label: "NTA – JEE / NEET / CUET",
    category: "Education",
    photo:     { widthPx: 200,  heightPx: 230,  dpi: 200, maxSizeKB: 100, format: "jpg", notes: "White background" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 200, maxSizeKB: 30,  format: "jpg" },
  },
  {
    id: "cat_mba",
    label: "CAT / MAT / MBA Entrance",
    category: "Education",
    photo:     { widthPx: 150,  heightPx: 200,  dpi: 200, maxSizeKB: 80,  format: "jpg" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 200, maxSizeKB: 30,  format: "jpg" },
  },
  {
    id: "passport",
    label: "Indian Passport / Visa",
    category: "Govt Document",
    photo:     { widthPx: 413,  heightPx: 531,  dpi: 300, maxSizeKB: 500, format: "jpg", notes: "White background, no glasses" },
    signature: { widthPx: 413,  heightPx: 177,  dpi: 300, maxSizeKB: 200, format: "jpg" },
  },
  {
    id: "aadhaar_uid",
    label: "Aadhaar / UID Enrolment",
    category: "Govt Document",
    photo:     { widthPx: 200,  heightPx: 200,  dpi: 200, maxSizeKB: 200, format: "jpg" },
    signature: { widthPx: 200,  heightPx: 100,  dpi: 200, maxSizeKB: 100, format: "jpg" },
  },
  {
    id: "mpsc_maha",
    label: "MPSC Maharashtra",
    category: "State PSC",
    photo:     { widthPx: 150,  heightPx: 200,  dpi: 200, maxSizeKB: 100, format: "jpg" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 200, maxSizeKB: 50,  format: "jpg" },
  },
  {
    id: "custom",
    label: "Custom / Other",
    category: "Custom",
    photo:     { widthPx: 200,  heightPx: 230,  dpi: 200, maxSizeKB: 100, format: "jpg" },
    signature: { widthPx: 140,  heightPx: 60,   dpi: 200, maxSizeKB: 30,  format: "jpg" },
  },
];

export function groupedTemplates(): Record<string, GovtTemplate[]> {
  return GOVT_TEMPLATES.reduce<Record<string, GovtTemplate[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
}

export function getTemplate(id: string): GovtTemplate | undefined {
  return GOVT_TEMPLATES.find((t) => t.id === id);
}
