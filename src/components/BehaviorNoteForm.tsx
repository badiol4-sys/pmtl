import { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface BehaviorNoteFormProps {
  childId: string;
  childName: string;
  onSubmit?: () => void;
}

type Category = 'positive' | 'neutral' | 'concern';

export default function BehaviorNoteForm({
  childId,
  childName,
  onSubmit,
}: BehaviorNoteFormProps) {
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<Category>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!note.trim()) {
      setError('Veuillez entrer une observation');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notes/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          note: note.trim(),
          category,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSuccess(true);
      setNote('');
      setCategory('neutral');

      // Reset success message after 3s
      setTimeout(() => setSuccess(false), 3000);

      // Call parent callback
      onSubmit?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-bold text-gray-800 mb-4">
        Ajouter une observation pour {childName}
      </h3>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 text-sm">Note enregistrée avec succès!</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Catégorie
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['positive', 'neutral', 'concern'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                  category === cat
                    ? cat === 'positive'
                      ? 'bg-green-600 text-white'
                      : cat === 'neutral'
                        ? 'bg-blue-600 text-white'
                        : 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'positive'
                  ? '✨ Positif'
                  : cat === 'neutral'
                    ? '➡️ Neutre'
                    : '⚠️ Concern'}
              </button>
            ))}
          </div>
        </div>

        {/* Note Textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Observation
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Très coopératif aujourd'hui, aidé un camarade..."
            disabled={isSubmitting}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-2">
            {note.length} caractères
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !note.trim()}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enregistrer la note
            </>
          )}
        </button>
      </form>

      {/* Category Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        <p className="text-xs font-semibold text-gray-700">Catégories:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
            <strong>Positif:</strong> Comportement exemplaire
          </li>
          <li>
            <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
            <strong>Neutre:</strong> Observation factuelle
          </li>
          <li>
            <span className="inline-block w-3 h-3 bg-orange-500 rounded mr-2"></span>
            <strong>Concern:</strong> Point d'attention
          </li>
        </ul>
      </div>
    </div>
  );
}
