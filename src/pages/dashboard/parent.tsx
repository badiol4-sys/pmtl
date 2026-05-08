import { useState, useEffect } from 'react';
import { LogOut, MessageSquare, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardParent() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParentChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildUploads(selectedChild);
    }
  }, [selectedChild]);

  const fetchParentChildren = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/parent/children', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChild(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildUploads = async (childId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/parent/child/${childId}/uploads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUploads(data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
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
            <p className="text-sm text-gray-500">Suivi de vos enfants</p>
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
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enfants */}
            <div className="lg:col-span-1">
              <h2 className="font-bold text-gray-800 mb-4">Vos enfants</h2>
              <div className="space-y-2">
                {children.length > 0 ? (
                  children.map((child: any) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChild(child.id)}
                      className={`w-full p-3 rounded-lg border transition text-left ${
                        selectedChild === child.id
                          ? 'bg-blue-50 border-blue-600 text-blue-900'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold">
                        {child.first_name} {child.last_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{child.class_name}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun enfant associé
                  </p>
                )}
              </div>
            </div>

            {/* Créations et infos */}
            <div className="lg:col-span-2">
              {selectedChild ? (
                <>
                  <h2 className="font-bold text-gray-800 mb-4">Créations et infos</h2>

                  {uploads.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploads.map((upload: any) => (
                        <a
                          key={upload.id}
                          href={upload.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition"
                        >
                          <FileText className="w-6 h-6 text-orange-500 mb-2" />
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {upload.title || 'Création'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {upload.uploader_role === 'animator' ? '📚 Pause' : '✏️ Classe'}
                          </p>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune création partagée encore</p>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
                    <button className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 hover:bg-blue-50 rounded transition">
                      <MessageSquare className="w-5 h-5" />
                      Envoyer un message
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Sélectionnez un enfant pour voir ses infos
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
