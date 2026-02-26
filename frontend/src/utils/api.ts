const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch (_) {}
    throw new Error(`API ${path} → ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

import type { TemplatesApiResponse } from "../types";

export async function fetchTemplates(): Promise<TemplatesApiResponse> {
  return apiFetch<TemplatesApiResponse>("/templates/");
}

export interface BgRemoveResponse {
  result_b64: string;
  mime: string;
}

export async function removeBackground(imageFile: Blob | File): Promise<string> {
  const formData = new FormData();
  formData.append("image", imageFile, "input.png");

  const resp = await apiFetch<BgRemoveResponse>("/remove-background/", {
    method: "POST",
    body: formData,
  });

  return `data:${resp.mime};base64,${resp.result_b64}`;
}
