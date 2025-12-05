import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { X, Calendar, FileText, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';

const PublierEvenement = () => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    contact: '',
    lieu: ''
  });
  const [fichier, setFichier] = useState(null);
  const [events, setEvents] = useState([]);
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
      .get(`http://localhost:3000/api/entreprise/${entrepriseId}/publications`)
      .then((response) => {
        const companyEvents = response.data.data.filter((pub) => pub.type === 'evenement');
        setEvents(companyEvents);
      })
      .catch((err) => {
        console.error('Erreur événements:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des événements');
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
    setFichier(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fichier) {
      setError("Veuillez sélectionner un fichier (PNG, JPEG, JPG)");
      return;
    }

    const validFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxFileSize = 5 * 1024 * 1024;
    if (!validFileTypes.includes(fichier.type)) {
      setError('Type de fichier non supporté. Utilisez PNG, JPEG ou JPG.');
      return;
    }
    if (fichier.size > maxFileSize) {
      setError('Image trop volumineuse (max 5 Mo).');
      return;
    }

    if (formData.date_fin && formData.date_debut && new Date(formData.date_fin) < new Date(formData.date_debut)) {
      setError('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('description', formData.description);
    data.append('date_debut', formData.date_debut);
    data.append('date_fin', formData.date_fin);
    data.append('contact', formData.contact);
    data.append('lieu', formData.lieu);
    data.append('fichier', fichier);
    data.append('id_entreprise', entrepriseId);

    try {
      await axios.post('http://localhost:3000/api/publier/evenement', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const response = await axios.get(`http://localhost:3000/api/entreprise/${entrepriseId}/publications`);
      const companyEvents = response.data.data.filter((pub) => pub.type === 'evenement');
      setEvents(companyEvents);
      setFormData({ titre: '', description: '', date_debut: '', date_fin: '', contact: '', lieu: '' });
      setFichier(null);
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Erreur publication événement:', err.response || err);
      setError(err.response?.data?.message || "Erreur lors de la publication de l'événement");
    } finally {
      setIsLoading(false);
    }
  };

  const isImageFile = (url) => /\.(png|jpeg|jpg)$/i.test(url);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-16 pt-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">Événements</h1>
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
            Publier un Nouvel Événement
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-8 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Publier un Événement</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-800" aria-label="Fermer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                      Titre
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Titre de l'événement"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Décrivez l'événement"
                      rows="5"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                        Date de début
                      </label>
                      <input
                        type="date"
                        name="date_debut"
                        value={formData.date_debut}
                        onChange={handleChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                        Date de fin
                      </label>
                      <input
                        type="date"
                        name="date_fin"
                        value={formData.date_fin}
                        onChange={handleChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                        Contact
                      </label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Contact"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                        Lieu
                      </label>
                      <input
                        type="text"
                        name="lieu"
                        value={formData.lieu}
                        onChange={handleChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Lieu de l'événement"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2 text-indigo-600" />
                      Fichier (PNG, JPEG, JPG)
                      Image (PNG, JPEG, JPG)
                    </label>
                    <input
                      type="file"
                      accept=".jpeg,.png,.jpg"
                      onChange={handleFileChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${
                      isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
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
                <p className="text-gray-600 text-center mb-6">Votre événement a été publié avec succès !</p>
                <button onClick={() => setIsSuccessModalOpen(false)} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-h-[80vh] overflow-y-auto pr-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Événements Publiés</h2>
          {events.length === 0 ? (
            <p className="text-center text-gray-500">Aucun événement publié pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((evt) => (
                <div key={evt.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{evt.title}</h3>
                  <p className="text-gray-600 mb-4">{evt.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date :</span>
                      <p className="text-gray-600">{new Date(evt.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {isImageFile(evt.image_url) && (
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-full max-w-md mx-auto rounded-lg mb-4 object-contain"
                      style={{ maxHeight: '400px' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublierEvenement;
