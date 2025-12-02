import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLogoUpload } from '@/hooks/useLogoUpload';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoUploaderProps {
  currentLogoUrl?: string;
  onLogoChange: (url: string | null) => void;
  disabled?: boolean;
}

export function LogoUploader({ currentLogoUrl, onLogoChange, disabled }: LogoUploaderProps) {
  const { uploadLogo, deleteLogo, isUploading } = useLogoUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload to storage
    const uploadedUrl = await uploadLogo(file);
    
    if (uploadedUrl) {
      // Clean up local preview
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(uploadedUrl);
      onLogoChange(uploadedUrl);
    } else {
      // Revert on failure
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(currentLogoUrl || null);
    }
  }, [uploadLogo, onLogoChange, currentLogoUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    },
    maxFiles: 1,
    disabled: disabled || isUploading
  });

  const handleRemove = async () => {
    if (currentLogoUrl && currentLogoUrl.includes('company-logos')) {
      await deleteLogo(currentLogoUrl);
    }
    setPreviewUrl(null);
    onLogoChange(null);
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative inline-block">
          <div className="border rounded-lg p-4 bg-muted/30">
            <img
              src={previewUrl}
              alt="Logo preview"
              className="max-h-20 max-w-[200px] object-contain"
              onError={() => {
                setPreviewUrl(null);
                onLogoChange(null);
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
            "flex flex-col items-center justify-center gap-2 text-center",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Subiendo logo...</p>
            </>
          ) : (
            <>
              {isDragActive ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra el logo o haz clic'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP o SVG (máx. 2MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
