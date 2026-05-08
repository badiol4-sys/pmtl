import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export default function FileUploadZone({
  onFileSelected,
  accept = '*/*',
  maxSizeMB = 50,
  label = 'Glissez vos fichiers ou cliquez pour sélectionner',
}: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Fichier trop volumineux (max ${maxSizeMB}MB)`);
      return false;
    }
    setError('');
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelected(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelected(file);
      }
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 transition ${
        isDragActive
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
      }`}
    >
      {selectedFile ? (
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-800">{selectedFile.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <button
            onClick={() => {
              setSelectedFile(null);
              setError('');
            }}
            className="mt-3 text-xs text-red-600 hover:text-red-700 flex items-center justify-center gap-1 mx-auto"
          >
            <X className="w-4 h-4" />
            Changer le fichier
          </button>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="text-center pointer-events-none">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">{label}</p>
            <p className="text-xs text-gray-500 mt-2">
              Formats acceptés: {accept === '*/*' ? 'tous' : accept} | Max {maxSizeMB}MB
            </p>
          </div>
        </>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
