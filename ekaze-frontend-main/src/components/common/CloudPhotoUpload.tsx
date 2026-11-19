import React, { useRef, useState } from 'react';
import { UploadCloud, Trash2 } from 'lucide-react';

interface CloudPhotoUploadProps {
  label?: string;
  photoPreview: string | null;
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
}

export const CloudPhotoUpload: React.FC<CloudPhotoUploadProps> = ({
  label = "Profile Photo",
  photoPreview,
  onPhotoChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onPhotoChange(null, null);
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && <label className="block text-xs font-bold text-slate-800">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="relative flex items-center justify-between w-full px-3 py-2 rounded-xl border border-slate-300 bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-[#2478b8] font-bold text-xs py-1.5 px-3 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors shrink-0"
        >
          <UploadCloud className="h-4 w-4 text-[#2478b8]" />
          <span>Upload Photo</span>
        </button>

        <span className="flex-1 ml-3 text-xs font-medium text-slate-500 truncate">
          {fileName || (photoPreview ? 'Photo selected' : 'No file chosen')}
        </span>

        {photoPreview && (
          <button
            type="button"
            onClick={handleRemove}
            className="ml-2 text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
            title="Remove Photo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {photoPreview && (
        <div className="mt-2 flex items-center gap-3">
          <img
            src={photoPreview}
            alt="Preview"
            className="h-16 w-16 rounded-full object-cover border border-slate-300 shadow-xs"
          />
          <span className="text-xs text-slate-500 font-semibold">Profile Photo Preview</span>
        </div>
      )}
    </div>
  );
};
