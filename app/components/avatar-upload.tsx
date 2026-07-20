'use client';

import { useState, useRef } from 'react';
import { User, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
  currentAvatar?: string;
  onFileSelect: (file: File) => void;
  previewUrl?: string;
}

export function AvatarUpload({ currentAvatar, onFileSelect, previewUrl }: AvatarUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const displayAvatar = previewUrl || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div
        className={`relative w-32 h-32 rounded-full border-4 transition-colors ${
          dragActive ? 'border-primary' : 'border-border'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt="Avatar preview"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Change Avatar
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG or WebP. Max 5MB.
        </p>
      </div>
    </div>
  );
}
