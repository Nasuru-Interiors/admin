'use client';

import { useState } from 'react';
import { uploadToCloudinary } from '@/lib/upload';

interface Props {
  value: string | null;
  onUploaded: (url: string, publicId: string) => void;
  folder?: string;
  label?: string;
  height?: number;
}

export default function ImageUpload({ value, onUploaded, folder, label, height = 180 }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url, publicId } = await uploadToCloudinary(file, folder);
      onUploaded(url, publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div
        className="flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50"
        style={{ minHeight: height }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="preview" className="max-h-[260px] w-full object-cover" />
        ) : (
          <span className="px-4 py-8 text-center text-sm text-gray-400">No image uploaded</span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <label className="btn btn-ghost cursor-pointer">
          {busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={busy} />
        </label>
        {value && (
          <button type="button" className="text-sm text-gray-400 hover:text-red-600" onClick={() => onUploaded('', '')}>
            Remove
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
