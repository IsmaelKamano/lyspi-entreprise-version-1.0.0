import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';
import Header from '../components/Header';
import { X, FileText, User, Tag, MapPin, Calendar, Camera, Film, CheckCircle } from 'lucide-react';

const PublierSuccessStory = () => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    description: '',
    date: '',
    lieu: '',
    impact: '',
    videoId: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const navigate = useNavigate();
  const entrepriseId = localStorage.getItem('entrepriseId');

  useEffect(() => {
    if (!entrepriseId) {
      navigate('/');
      return;
    }

    axios
      .get(`${API}/entreprise/${entrepriseId}/publications`)
      .then((response) => {
        const companyStories = response.data.data.filter((pub) => pub.type === 'success_story');
        setStories(companyStories);
      })
      .catch((err) => {
        console.error('Erreur success stories:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des success stories');
      });

    if (isModalOpen || isSuccessModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [navigate, entrepriseId, isModalOpen, isSuccessModalOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };
  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!avatarFile && !videoFile && !formData.videoId) {
      setError("Ajoutez un avatar, une vidéo à uploader, ou un identifiant de vidéo YouTube");
      return;
    }

    if (avatarFile) {
      const validFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxFileSize = 5 * 1024 * 1024;
      if (!validFileTypes.includes(avatarFile.type)) {
        setError('Type de fichier non supporté. Utilisez PNG, JPEG ou JPG.');
        return;
      }
      if (avatarFile.size > maxFileSize) {
        setError('Image trop volumineuse (max 5 Mo).');
        return;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.date && formData.date > today) {
      // date de publication peut être passée, on autorise futur aussi; pas de blocage strict
    }

    // Video validation (if provided)
    if (videoFile) {
      const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      const maxVideoSize = 50 * 1024 * 1024; // 50MB
      if (!validVideoTypes.includes(videoFile.type)) {
        setError('Type de vidéo non supporté. Utilisez MP4, MOV, AVI ou MKV.');
        return;
      }
      if (videoFile.size > maxVideoSize) {
        setError('Vidéo trop volumineuse (max 50 Mo).');
        return;
      }
    }

    setIsLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('specialty', formData.specialty);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('lieu', formData.lieu);
    data.append('impact', formData.impact);
    data.append('videoId', formData.videoId);
    if (avatarFile) data.append('avatar', avatarFile);
    if (videoFile) data.append('video', videoFile);
    data.append('id_entreprise', entrepriseId);

    try {
      const publishRes = await axios.post(`${API}/publier/success-story`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Publication success story OK:', publishRes.data);
      const response = await axios.get(`${API}/entreprise/${entrepriseId}/publications`);
      const companyStories = response.data.data.filter((pub) => pub.type === 'success_story');
      setStories(companyStories);
      setFormData({ name: '', specialty: '', description: '', date: '', lieu: '', impact: '', videoId: '' });
      setAvatarFile(null);
      setVideoFile(null);
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Erreur publication success story:', err.response || err);
      setError(err.response?.data?.message || 'Erreur lors de la publication de la success story');
    } finally {
      setIsLoading(false);
    }
  };

  const isImageFile = (url) => /\.(png|jpeg|jpg)$/i.test(url);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-16 pt-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">Success Stories</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <div className="mb-8 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            <FileText className="w-5 h-5 mr-2" />
            Publier une Success Story
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-8 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Publier une Success Story</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-800" aria-label="Fermer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <User className="w-5 h-5 mr-2 text-indigo-600" />
                        Nom
                      </label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Nom" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                        Spécialité
                      </label>
                      <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Spécialité" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                      Description
                    </label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Décrivez la success story" rows="5" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                        Date
                      </label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                        Lieu
                      </label>
                      <input type="text" name="lieu" value={formData.lieu} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ville / Pays" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                      Impact
                    </label>
                    <input type="text" name="impact" value={formData.impact} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: A aidé 500 jeunes" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Camera className="w-5 h-5 mr-2 text-indigo-600" />
                        Avatar (PNG, JPEG, JPG)
                      </label>
                      <input type="file" accept=".jpeg,.png,.jpg" onChange={handleFileChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Film className="w-5 h-5 mr-2 text-indigo-600" />
                        Vidéo (MP4, MOV, AVI, MKV) ou ID YouTube
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <input type="file" accept=".mp4,.mov,.avi,.mkv" onChange={handleVideoChange} className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        <input type="text" name="videoId" value={formData.videoId} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="ou entrez un ID YouTube (ex: Ke90Tje7VS0)" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    {isLoading ? 'Publication...' : 'Publier'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Succès</h2>
                <p className="text-gray-600 text-center mb-6">Votre success story a été publiée avec succès !</p>
                <button onClick={() => setIsSuccessModalOpen(false)} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300">Fermer</button>
              </div>
            </div>
          </div>
        )}

        <div className="max-h-[80vh] overflow-y-auto pr-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Success Stories Publiées</h2>
          {stories.length === 0 ? (
            <p className="text-center text-gray-500">Aucune success story publiée pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stories.map((s) => (
                <div key={s.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
                  <div className="flex items-center mb-4">
                    {s.avatar_url && (
                      <img src={s.avatar_url} alt={s.name} className="w-12 h-12 rounded-full object-cover mr-3" />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{s.name}</h3>
                      <p className="text-gray-600 text-sm">{s.specialty}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{s.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date :</span>
                      <p className="text-gray-600">{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Lieu :</span>
                      <p className="text-gray-600">{s.lieu}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-sm font-medium text-gray-700">Impact :</span>
                      <p className="text-gray-600">{s.impact}</p>
                    </div>
                  </div>
                  {s.video_url ? (
                    <video src={s.video_url} controls className="w-full rounded-lg mb-3 max-h-[360px]" />
                  ) : s.videoId ? (
                    <a
                      href={`https://www.youtube.com/watch?v=${s.videoId}`}
                      className="inline-block text-indigo-600 hover:underline mb-3"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Voir la vidéo
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublierSuccessStory;
