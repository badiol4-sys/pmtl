import { useState, useEffect } from 'react';
import { LogOut, Upload, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardTeacher() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'enfants' | 'uploads' | 'messages'>('enfants');
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/teacher/children', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Tony Lainé</h1>
            <p className="text-sm text-gray-500">Tableau de bord Enseignant</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {[
            { id: 'enfants', label: 'Mes Élèves', icon: Users },
            { id: 'uploads', label: 'Uploader Créations', icon: Upload },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <>
            {activeTab === 'enfants' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {children.length > 0 ? (
                  children.map((child: any) => (
                    <div
                      key={child.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                    >
                      <h3 className="font-bold text-gray-800">
                        {child.first_name} {child.last_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{child.parent_code}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full text-center py-8">
                    Aucun élève trouvé
                  </p>
                )}
              </div>
            )}

            {activeTab === 'uploads' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-bold text-gray-800 mb-2">Uploader les créations</h3>
                <p className="text-gray-500 mb-4">
                  Partagez les créations scolaires de vos élèves avec leurs parents
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Choisir fichiers
                </button>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-bold text-gray-800 mb-2">Messagerie</h3>
                <p className="text-gray-500">Aucun message</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
