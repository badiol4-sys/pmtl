import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FileUploadZone from '../../components/FileUploadZone';

export default function AnimatorUploadPDF() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setError('Erreur lors du chargement des classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedClass) {
      setError('Veuillez sélectionner une classe et un fichier');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('classId', selectedClass);

      const response = await fetch('/api/pdf/upload-class-list', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      setUploadResult(data);
      setSelectedFile(null);
      setSelectedClass('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/animator')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Upload Liste Classe</h1>
            <p className="text-sm text-gray-500">
              Importez un PDF avec la liste des enfants de la classe
            </p>
          </div>
        </div>

        {/* Success Message */}
        {uploadResult && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Succès!</h3>
              <p className="text-sm text-green-700">{uploadResult.message}</p>
              <button
                onClick={() => setUploadResult(null)}
                className="mt-3 text-sm text-green-700 hover:text-green-900 underline"
              >
                Uploader un autre PDF
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Erreur</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!uploadResult && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sélectionnez la classe
              </label>
              {loadingClasses ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              ) : (
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Choisir une classe --</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-2">
                La classe doit exister dans le système avant d'importer la liste
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Fichier PDF (liste des enfants)
              </label>
              <FileUploadZone
                onFileSelected={setSelectedFile}
                accept=".pdf"
                maxSizeMB={10}
                label="Glissez le PDF ou cliquez pour sélectionner"
              />
              <p className="text-xs text-gray-500 mt-2">
                Le PDF doit contenir 2 colonnes: <strong>Élève</strong> et <strong>Tél Parent</strong>
              </p>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedClass || isUploading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {isUploading && <Loader className="w-5 h-5 animate-spin" />}
              {isUploading ? 'Traitement...' : 'Uploader et importer'}
            </button>

            {/* Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
              <h4 className="font-semibold text-blue-900 text-sm">Comment ça marche?</h4>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Sélectionnez la classe correspondante</li>
                <li>Uploadez le PDF avec la liste des enfants</li>
                <li>L'IA extrait automatiquement les noms et numéros de téléphone</li>
                <li>Les enfants sont créés et associés aux parents</li>
                <li>Un code parent unique est généré par numéro de téléphone</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
