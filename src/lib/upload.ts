'use client';

import { api } from './api';

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * 1. Ask the backend for a Cloudinary signature (keeps the API secret server-side)
 * 2. Upload the file straight to Cloudinary from the browser
 * 3. Return the secure URL + public_id to store in Postgres via the backend
 */
export async function uploadToCloudinary(file: File, folder?: string): Promise<UploadResult> {
  const sign = await api.post<{
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
  }>('/media/sign', { folder });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return { url: data.secure_url as string, publicId: data.public_id as string };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  await api.del('/media', { public_id: publicId });
}
