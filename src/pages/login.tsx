import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, AlertCircle } from 'lucide-react';

type UserRole = 'animator' | 'teacher' | 'parent' | 'director' | 'alsh';

export default function LoginPage() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<UserRole>('animator');
  const [formData, setFormData] = useState({
    identifier: '', // email, phone, ou prénom
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teacherStep, setTeacherStep] = useState<'password' | 'name' | 'personal'>(
    'password'
  );
  const [teacherFirstName, setTeacherFirstName] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint =
        activeRole === 'parent' ? '/api/auth/parent-login' : '/api/auth/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
          role: activeRole,
          ...(activeRole === 'teacher' && { firstName: teacherFirstName }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connexion échouée');
      }

      // Store auth token and role
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_id', data.userId);

      // Redirect to dashboard
      navigate(`/dashboard/${activeRole}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher login has 3 steps
  if (activeRole === 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">Tony Lainé</h1>
            <p className="text-gray-500 text-sm mt-1">Gestion d'école</p>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-6">Connexion Enseignant</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {teacherStep === 'password' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (formData.password === 'TL2026') {
                  setTeacherStep('name');
                  setError('');
                } else {
                  setError('Code d\'accès incorrect');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code d'accès général
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Code fourni par la directrice
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Continuer
              </button>
            </form>
          )}

          {teacherStep === 'name' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (teacherFirstName.trim()) {
                  setTeacherStep('personal');
                } else {
                  setError('Veuillez entrer votre prénom');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Votre prénom
                </label>
                <input
                  type="text"
                  value={teacherFirstName}
                  onChange={(e) => setTeacherFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: Marie"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Continuer
              </button>
            </form>
          )}

          {teacherStep === 'personal' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe personnel
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Autre rôle?</p>
            <div className="flex gap-2">
              {(['animator', 'parent'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRole(role);
                    setFormData({ identifier: '', password: '' });
                    setError('');
                    setTeacherStep('password');
                  }}
                  className="flex-1 text-xs py-2 px-3 rounded border border-gray-300 hover:bg-gray-50 transition"
                >
                  {role === 'animator' ? 'Animateur' : 'Parent'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard login for Animator and Parent
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Tony Lainé</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion d'école</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['animator', 'parent'] as const).map((role) => (
            <button
              key={role}
              onClick={() => {
                setActiveRole(role);
                setFormData({ identifier: '', password: '' });
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                activeRole === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role === 'animator' ? 'Animateur' : 'Parent'}
            </button>
          ))}
          <button
            onClick={() => setActiveRole('teacher')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              activeRole === 'teacher'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Enseignant
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {activeRole === 'parent' ? 'Téléphone ou Email' : 'Email'}
            </label>
            <div className="relative">
              {activeRole === 'parent' ? (
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              ) : (
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              )}
              <input
                type={activeRole === 'parent' ? 'text' : 'email'}
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  activeRole === 'parent' ? '+33... ou email@' : 'prenom@exemple.com'
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          {activeRole === 'animator'
            ? 'Première connexion? Contactez votre directrice'
            : activeRole === 'parent'
              ? 'Nouveau parent? Vous recevrez vos identifiants par email'
              : 'Besoin d\'aide? Contactez votre directrice'}
        </p>
      </div>
    </div>
  );
}
