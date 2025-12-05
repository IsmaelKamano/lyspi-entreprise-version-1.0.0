import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { X, FileText, MapPin, Calendar, Tag, Mail, Upload, CheckCircle } from 'lucide-react';

const PublierFormation = () => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    localisation: '',
    date_debut: '',
    date_fin: '',
    prerequis: '',
    email_contact: ''
  });
  const [fichier, setFichier] = useState(null);
  const [formations, setFormations] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [totalParticipations, setTotalParticipations] = useState(0);
  const navigate = useNavigate();

  const entrepriseId = localStorage.getItem('entrepriseId');

  useEffect(() => {
    if (!entrepriseId) {
      navigate('/');
      return;
    }

    // Fetch company formations
    axios.get(`http://localhost:3000/api/entreprise/${entrepriseId}/publications`)
      .then(response => {
        const companyFormations = response.data.data.filter(pub => pub.type === 'formation');
        setFormations(companyFormations);
      })
      .catch(err => {
        console.error('Erreur formations:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des formations');
      });
axios.get(`http://localhost:3000/api/participations/count/${entrepriseId}`)
    .then(response => {
      setTotalParticipations(response.data.data);
    })
    .catch(err => {
      console.error('Erreur nb participations:', err);
      setError('Erreur lors de la récupération du nombre de participations');
    });
    // Prevent background scrolling when modals are open
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

    // File validation
    const validFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (!fichier) {
      setError('Veuillez sélectionner un fichier (PDF, DOC, DOCX, PNG, JPEG, JPG)');
      return;
    }
    if (!validFileTypes.includes(fichier.type)) {
      setError('Type de fichier non supporté. Veuillez utiliser PDF, DOC, DOCX, PNG, JPEG ou JPG.');
      return;
    }
    if (fichier.size > maxFileSize) {
      setError('Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
      return;
    }

    // Date validation
    const today = new Date().toISOString().split('T')[0];
    if (formData.date_debut < today) {
      setError('La date de début ne peut pas être antérieure à aujourd\'hui.');
      return;
    }
    if (formData.date_fin && formData.date_debut && new Date(formData.date_fin) < new Date(formData.date_debut)) {
      setError('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    setIsLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('fichier', fichier);
    data.append('id_entreprise', entrepriseId);

    try {
      console.log('Soumission formulaire:', Object.fromEntries(data));
      const publishRes = await axios.post('http://localhost:3000/api/publier/formation', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Publication formation OK:', publishRes.data);
      // Refresh formations
      const response = await axios.get(`http://localhost:3000/api/entreprise/${entrepriseId}/publications`);
      const companyFormations = response.data.data.filter(pub => pub.type === 'formation');
      setFormations(companyFormations);
      // Reset form
      setFormData({
        titre: '',
        description: '',
        localisation: '',
        date_debut: '',
        date_fin: '',
        prerequis: '',
        email_contact: ''
      });
      setFichier(null);
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Erreur soumission formulaire:', err.response || err);
      setError(err.response?.data?.message || 'Erreur lors de la publication de la formation');
    } finally {
      setIsLoading(false);
    }
  };

  const isImageFile = (url) => {
    return /\.(png|jpeg|jpg)$/i.test(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-16 pt-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">Formations</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Statistiques des Formations */}
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
  <div className="flex justify-between gap-6">
    <div className="flex items-center">
      <FileText className="w-8 h-8 text-blue-600 mr-3" />
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Total des formations</h3>
        <p className="text-gray-600">{formations.length} formation{formations.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
    <div className="flex items-center">
      <FileText className="w-8 h-8 text-green-600 mr-3" />
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Total des participations</h3>
        <p className="text-gray-600">{totalParticipations} participation{totalParticipations !== 1 ? 's' : ''}</p>
      </div>
    </div>
  </div>
</div>

        {/* Button to Open Modal */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
            aria-label="Publier une nouvelle formation"
          >
            <FileText className="w-5 h-5 mr-2" />
            Publier une Nouvelle Formation
          </button>
        </div>

        {/* Modal for New Formation Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-8 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Publier une Nouvelle Formation</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                  aria-label="Fermer le modal"
                >
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
                      placeholder="Titre de la formation"
                      required
                      aria-required="true"
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
                      placeholder="Décrivez la formation"
                      rows="5"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                      Localisation
                    </label>
                    <input
                      type="text"
                      name="localisation"
                      value={formData.localisation}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Lieu de la formation"
                      required
                      aria-required="true"
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
                        aria-required="true"
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
                        aria-required="true"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                      Prérequis
                    </label>
                    <input
                      type="text"
                      name="prerequis"
                      value={formData.prerequis}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Prérequis pour la formation"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-indigo-600" />
                      Email de contact
                    </label>
                    <input
                      type="email"
                      name="email_contact"
                      value={formData.email_contact}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Email de contact"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                      Fichier (PDF, DOC, DOCX, PNG, JPEG, JPG)
                    </label>
                    <input
                      type="file"
                      accept=".jpeg,.png,.jpg,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      required
                      aria-required="true"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${
                      isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    aria-disabled={isLoading}
                  >
                    {isLoading ? 'Publication...' : 'Publier'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Succès</h2>
                <p className="text-gray-600 text-center mb-6">Votre formation a été publiée avec succès !</p>
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
                  aria-label="Fermer le modal de succès"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Published Formations */}
        <div className="max-h-[80vh] overflow-y-auto pr-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Formations Publiées</h2>
          {formations.length === 0 ? (
            <p className="text-center text-gray-500">Aucune formation publiée pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formations.map(formation => (
                <div key={formation.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{formation.titre}</h3>
                  <p className="text-gray-600 mb-4">{formation.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Localisation :</span>
                      <p className="text-gray-600">{formation.localisation}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Prérequis :</span>
                      <p className="text-gray-600">{formation.prerequis}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date de début :</span>
                      <p className="text-gray-600">{new Date(formation.date_debut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date de fin :</span>
                      <p className="text-gray-600">{new Date(formation.date_fin).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Contact :</span>
                      <p className="text-gray-600">{formation.email_contact}</p>
                    </div>
                  </div>
                  {isImageFile(formation.fichier_url) ? (
                    <img
                      src={formation.fichier_url}
                      alt={formation.titre}
                      className="w-full max-w-md mx-auto rounded-lg mb-4 object-contain"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : (
                    <a
                      href={formation.fichier_url}
                      download
                      className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
                    >
                      Télécharger le document
                    </a>
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

export default PublierFormation;