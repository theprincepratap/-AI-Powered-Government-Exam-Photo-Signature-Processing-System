import axios from "axios";
import type {
  PhotoSubmission,
  SignatureSubmission,
  AggregateResult,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: { Accept: "application/json" },
});

export async function uploadPhoto(
  applicantId: string,
  file: File
): Promise<PhotoSubmission> {
  const form = new FormData();
  form.append("applicant_id", applicantId);
  form.append("source", file);
  const { data } = await api.post<PhotoSubmission>("/photos/", form);
  return data;
}

export async function processPhoto(id: number): Promise<PhotoSubmission> {
  const { data } = await api.post<PhotoSubmission>(`/photos/${id}/process/`);
  return data;
}

export async function getPhoto(id: number): Promise<PhotoSubmission> {
  const { data } = await api.get<PhotoSubmission>(`/photos/${id}/`);
  return data;
}

export async function uploadSignature(
  applicantId: string,
  file: File
): Promise<SignatureSubmission> {
  const form = new FormData();
  form.append("applicant_id", applicantId);
  form.append("source", file);
  const { data } = await api.post<SignatureSubmission>("/signatures/", form);
  return data;
}

export async function processSignature(
  id: number
): Promise<SignatureSubmission> {
  const { data } = await api.post<SignatureSubmission>(
    `/signatures/${id}/process/`
  );
  return data;
}

export async function getSignature(id: number): Promise<SignatureSubmission> {
  const { data } = await api.get<SignatureSubmission>(`/signatures/${id}/`);
  return data;
}

export async function aggregateResults(
  applicantId: string
): Promise<AggregateResult> {
  const { data } = await api.post<AggregateResult>("/results/aggregate/", {
    applicant_id: applicantId,
  });
  return data;
}
