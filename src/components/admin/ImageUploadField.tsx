
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  folder: string;
  placeholder?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  folder,
  placeholder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, isUploading } = useImageUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadImage(file, folder);
    if (uploadedUrl) {
      onChange(uploadedUrl);
    }

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (value) {
      const success = await deleteImage(value);
      if (success) {
        onChange(undefined);
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    onChange(url || undefined);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-black">{label}</label>
      
      <div className="flex gap-2">
        <Input
          type="url"
          value={value || ''}
          onChange={handleUrlChange}
          placeholder={placeholder || "URL de la imagen o sube una nueva"}
          className="border border-gray-300 rounded-lg flex-1"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="border border-gray-300 rounded-lg px-3"
        >
          <Upload className="w-4 h-4" />
        </Button>

        {value && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
            className="border border-red-300 text-red-600 rounded-lg px-3"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-20 h-20 object-cover border border-gray-300 rounded-lg"
          />
        </div>
      )}

      {isUploading && (
        <p className="text-sm text-gray-500">Subiendo imagen...</p>
      )}
    </div>
  );
};

export default ImageUploadField;
