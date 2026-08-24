import apiClient from "@/lib/api-client";
import { API_ORIGIN } from "@/config/constants";

export interface UploadedFile {
  secure_url: string;
  public_id: string;
  format: string;
}

export async function uploadFiles(files: File[], endpoint = "/upload/kyc", fieldName = "files") {
  const formData = new FormData();
  files.forEach((file) => formData.append(fieldName, file));
  const res = await apiClient.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data as UploadedFile[];
}

export async function uploadFile(file: File, endpoint = "/upload/kyc", fieldName = "files") {
  const uploaded = await uploadFiles([file], endpoint, fieldName);
  return uploaded[0];
}

export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return url;
}
