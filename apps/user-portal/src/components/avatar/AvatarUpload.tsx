import { useRef, useState } from 'react';
import { Button } from '@repo/ui';

interface AvatarUploadProps {
  isUploading: boolean;
  error: string;
  onUpload: (file: File) => Promise<void>;
}

export function AvatarUpload({ isUploading, error, onUpload }: AvatarUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (selectedFile: File | null) => {
    setValidationError('');

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl('');
      return;
    }

    const allowedMimeTypes = new Set(['image/jpeg', 'image/png']);
    if (!allowedMimeTypes.has(selectedFile.type)) {
      setValidationError('Only JPG and PNG images are allowed.');
      setFile(null);
      setPreviewUrl('');
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setValidationError('Image must be 2MB or smaller.');
      setFile(null);
      setPreviewUrl('');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async () => {
    if (!file) {
      setValidationError('Please select an image before uploading.');
      return;
    }

    await onUpload(file);
    setFile(null);
    setPreviewUrl('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      data-testid="profile-avatar-upload-section"
      className="mt-4 rounded-lg border border-slate-200 p-4"
    >
      <label
        htmlFor="profile-avatar-input"
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        Upload profile picture
      </label>
      <input
        id="profile-avatar-input"
        ref={inputRef}
        data-testid="profile-avatar-input"
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0] ?? null;
          handleSelectFile(selectedFile);
        }}
        className="block w-full cursor-pointer rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
      />

      {previewUrl && (
        <img
          data-testid="profile-avatar-preview"
          src={previewUrl}
          alt="Selected profile preview"
          className="mt-4 h-24 w-24 rounded-full border border-slate-200 object-cover"
        />
      )}

      {(validationError || error) && (
        <p data-testid="profile-avatar-error" className="mt-3 text-sm text-rose-600">
          {validationError || error}
        </p>
      )}

      <Button
        data-testid="profile-avatar-upload-button"
        isPending={isUploading}
        pendingText="Uploading..."
        onClick={handleSubmit}
        className="btn btn-primary mt-4"
        disabled={!file}
      >
        Upload picture
      </Button>
    </div>
  );
}
