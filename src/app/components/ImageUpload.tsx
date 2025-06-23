'use client';

import { useState } from 'react';

interface ImageUploadProps {
  onImageUpload: (base64Image: string) => void;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous error
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image size should be less than 4MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Pass the base64 image to parent component
      onImageUpload(base64Image);
      
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <div className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors">
            <span className="text-gray-600">
              {isUploading ? 'Uploading...' : 'Click to upload image'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        </label>
      </div>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
} 