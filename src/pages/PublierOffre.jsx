import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { X, FileText, Briefcase, Calendar, Tag, Mail, Upload, CheckCircle } from 'lucide-react';

const PublierOffre = () => {
  const [formData, setFormData] = useState({
    poste: '',
    description: '',
    competences: '',
    date_debut: '',
    date_limite: '',
    contact: '',
    tags: '',
    id_type_offre: ''
  });
  const [fichier, setFichier] = useState(null);
  const [typesOffres, setTypesOffres] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersByType, setOffersByType] = useState([]);
  const [totalOffers, setTotalStartups] = useState(0);
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

  // Fetch offer types
  axios.get('http://localhost:3000/api/types-offres')
    .then(response => {
      console.log('Types d\'offres chargés:', response.data.data);
      setTypesOffres(response.data.data);
    })
    .catch(err => {
      console.error('Erreur types offres:', err);
      setError('Erreur lors de la récupération des types d\'offres');
    });

  // Fetch company offers
  axios.get(`http://localhost:3000/api/entreprise/${entrepriseId}/publications`)
    .then(response => {
      const companyOffers = response.data.data.filter(pub => pub.type === 'offre');
      setOffers(companyOffers);
    })
    .catch(err => {
      console.error('Erreur offres entreprise:', err);
      setError('Erreur lors de la récupération des offres');
    });

  // Fetch offers count by type
  axios.get(`http://localhost:3000/api/offres/nbtype/${entrepriseId}`)
    .then(response => setOffersByType(response.data.data))
    .catch(err => {
      console.error('Erreur nb offres par type:', err);
      setError('Erreur lors de la récupération du nombre d\'offres par type');
    });

  // Fetch total startups (corrected endpoint)
  axios.get(`http://localhost:3000/api/offres/count/${entrepriseId}`)
    .then(response => {
      setTotalStartups(response.data.data);
    })
    .catch(err => {
      console.error('Erreur nb offres:', err);
      setError('Erreur lors de la récupération du nombre d\'offres');
    });
}, [navigate, entrepriseId]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFichier(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fichier) {
      setError('Veuillez sélectionner un fichier (PDF, DOC, DOCX, PNG, JPEG, JPG)');
      return;
    }

    // Validation des dates
    if (formData.date_limite && formData.date_debut && new Date(formData.date_limite) < new Date(formData.date_debut)) {
      setError('La date limite ne peut pas être antérieure à la date de début');
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
      const publishRes = await axios.post('http://localhost:3000/api/publier/offres', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Publication offre OK:', publishRes.data);
      // Refresh offers
      const response = await axios.get(`http://localhost:3000/api/entreprise/${entrepriseId}/publications`);
      const companyOffers = response.data.data.filter(pub => pub.type === 'offre');
      setOffers(companyOffers);
      // Refresh offers by type
      const typeResponse = await axios.get(`http://localhost:3000/api/offres/nbtype/${entrepriseId}`);
      setOffersByType(typeResponse.data.data);
      // Reset form
      setFormData({
        poste: '',
        description: '',
        competences: '',
        date_debut: '',
        date_limite: '',
        contact: '',
        tags: '',
        id_type_offre: ''
      });
      setFichier(null);
      setIsModalOpen(false);
      setIsSuccessModalOpen(true); // Afficher le modal de succès
    } catch (err) {
      console.error('Erreur soumission formulaire:', err.response || err);
      setError(err.response?.data?.message || 'Erreur lors de la publication');
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">Offres d'Emploi</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 max-w-2xl mx-auto">
            {error}
          </div>
        )}
        
        {/* Offers Count by Type and Total Startups */}
  <div className="mb-12">

  <h3 className="text-xl font-semibold text-gray-800 mb-4">Nombre d'Offres par Type</h3>

  <div className="flex flex-wrap gap-6">
    {offersByType.map((type) => (
      <div
        key={type.id_type_offre}
        className="flex items-center bg-white rounded-xl shadow-md p-4 w-full sm:w-auto hover:shadow-lg transition duration-300"
      >
        <Briefcase className="w-8 h-8 text-indigo-600 mr-3" />
        <div>
          <h3 className="text-md font-semibold text-gray-800">{type.type_offre}</h3>
          <p className="text-gray-600">
            {type.nombre_offres} offre{type.nombre_offres !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    ))}

    {/* Bloc total des offres */}
    <div className="flex items-center bg-white rounded-xl shadow-md p-4 w-full sm:w-auto hover:shadow-lg transition duration-300">
      <Briefcase className="w-8 h-8 text-green-600 mr-3" />
      <div>
        <h3 className="text-md font-semibold text-gray-800">Total des offres</h3>
        <p className="text-gray-600">
          {totalOffers} offre{totalOffers !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  </div>
</div>


        {/* Button to Open Modal */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            <FileText className="w-5 h-5 mr-2" />
            Publier une Nouvelle Offre
          </button>
        </div>

        {/* Modal for New Offer Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-8 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Publier une Nouvelle Offre</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                      Poste
                    </label>
                    <input
                      type="text"
                      name="poste"
                      value={formData.poste}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Titre du poste"
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
                      placeholder="Décrivez l'offre"
                      rows="5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                      Compétences
                    </label>
                    <input
                      type="text"
                      name="competences"
                      value={formData.competences}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Compétences requises"
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
                        Date limite
                      </label>
                      <input
                        type="date"
                        name="date_limite"
                        value={formData.date_limite}
                        onChange={handleChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-indigo-600" />
                      Contact
                    </label>
                    <input
                      type="email"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Email de contact"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Tags (séparés par des virgules)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                      Type d'offre
                    </label>
                    <select
                      name="id_type_offre"
                      value={formData.id_type_offre}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      {typesOffres.map(type => (
                        <option key={type.id} value={type.id}>{type.nom}</option>
                      ))}
                    </select>
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

        {/* Success Modal */}
        {isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Succès</h2>
                <p className="text-gray-600 text-center mb-6">Votre offre a été publiée avec succès !</p>
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Published Offers */}
        <div className="max-h-[80vh] overflow-y-auto pr-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Offres Publiées</h2>
          {offers.length === 0 ? (
            <p className="text-center text-gray-500">Aucune offre publiée pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map(offer => (
                <div key={offer.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{offer.poste}</h3>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Compétences :</span>
                      <p className="text-gray-600">{offer.competences}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Tags :</span>
                      <p className="text-gray-600">{offer.tags}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date de début :</span>
                      <p className="text-gray-600">{new Date(offer.date_debut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date limite :</span>
                      <p className="text-gray-600">{new Date(offer.date_limite).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Contact :</span>
                      <p className="text-gray-600">{offer.contact}</p>
                    </div>
                  </div>
                  {isImageFile(offer.fichier_url) ? (
                    <img
                      src={offer.fichier_url}
                      alt={offer.poste}
                      className="w-full max-w-md mx-auto rounded-lg mb-4 object-contain"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : (
                    <a
                      href={offer.fichier_url}
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

export default PublierOffre;