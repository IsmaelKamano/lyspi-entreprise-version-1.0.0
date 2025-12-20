import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Startup = () => {
  const [startups, setStartups] = useState([]);
  const [partenariats, setPartenariats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const entrepriseId = localStorage.getItem('entrepriseId');

  useEffect(() => {
    if (!entrepriseId) {
      navigate('/');
      return;
    }

    const fetchStartups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/list/startups`);
        const data = response.data.data || response.data;
        if (!data || data.message === 'Aucune startup trouvée') {
          toast.info('Aucune startup trouvée', { theme: 'colored' });
          setStartups([]);
        } else {
          setStartups(data);
        }
      } catch {
        toast.error('Impossible de charger les startups.', { theme: 'colored' });
      } finally {
        setLoading(false);
      }
    };

    const fetchPartenariats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API}/entreprise/${entrepriseId}/partenariats-complets`
        );
        const startupIds = response.data.map((p) => p.startup_id);
        setPartenariats(startupIds);
      } catch {
        setError('Erreur lors de la récupération des partenariats');
        toast.error('Impossible de charger les partenariats.', { theme: 'colored' });
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
    fetchPartenariats();
  }, [navigate, entrepriseId]);

  const handlePartenariat = async (startupId) => {
    try {
      setLoading(true);
          const partnershipResponse = await axios.post(`${API}/startup/partenaire`, {
        startup_id: startupId,
        entreprise_id: parseInt(entrepriseId),
      });

      if (partnershipResponse.status === 201) {
        setShowSuccessModal(true);
        setPartenariats([...partenariats, startupId]);
      } else if (partnershipResponse.status === 409) {
        toast.info('Cette startup est déjà partenaire.', { theme: 'colored' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors de la création du partenariat';
      setError(errorMessage);
      toast.error(errorMessage, { theme: 'colored' });
    } finally {
      setLoading(false);
    }
  };

  const filteredStartups = startups.filter((item) => {
    const matchesSearch = item.startup?.nom
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain
      ? item.startup?.domaine === selectedDomain
      : true;
    return matchesSearch && matchesDomain;
  });

  const domains = [...new Set(startups.map((item) => item.startup?.domaine).filter(Boolean))];

  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded-lg"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
          Explorez les Startups
        </h1>

        <div className="mb-10 bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-300">
          <div className="relative w-full sm:w-1/2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une startup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
              aria-label="Rechercher une startup par nom"
            />
          </div>
          <div className="relative w-full sm:w-1/4">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full pl-10 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200 bg-gray-50 text-gray-800"
              aria-label="Filtrer par domaine"
            >
              <option value="">Tous les domaines</option>
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDomain('');
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
            aria-label="Réinitialiser les filtres"
          >
            <XMarkIcon className="h-5 w-5" />
            Réinitialiser
          </button>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 text-red-700 rounded-lg shadow-md text-center border-gray-200 max-w-2xl mx-auto">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {!loading && filteredStartups.length === 0 ? (
          <p className="text-lg text-gray-700 text-center py-12">
            Aucune startup ne correspond à vos critères.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStartups.map((item) => (
              <div
                key={item.startup?.id || Math.random()}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
                aria-labelledby={`startup-${item.startup?.id}`}
              >
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/details/${item.startup?.id}`, {
                      state: { startup: item.startup, etudiant: item.etudiant },
                    })
                  }
                >
                  <h3 id={`startup-${item.startup?.id}`} className="text-xl font-bold text-gray-900 mb-3 truncate">
                    {item.startup?.nom || 'Nom inconnu'}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {item.startup?.description || 'Aucune description disponible.'}
                  </p>
                  <div className="text-gray-500 text-sm mb-2 mb-1">
                    <strong className="font-medium">Domaine : </strong>
                    <span>{item.startup?.domaine || 'Non spécifié'}</span>
                  </div>
                  <div className="text-gray-500 text-sm mb-2">
                    <strong className="font-medium">Équipe : </strong>
                    <span>{item.etudiant?.nom || 'Inconnu'} {item.etudiant?.prenom || ''}</span>
                  </div>
                  <div className="text-gray-500 text-sm mb-4">
                    <strong className="font-medium">Contact :</strong> {item.etudiant?.contact?.email || 'Non spécifié'}
                  </div>
                </div>
                {partenariats.includes(item.startup?.id) ? (
                  <span className="absolute top-4 right-4 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Partenaire
                  </span>
                ) : (
                  <button
                    onClick={() => handlePartenariat(item.startup?.id)}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    aria-label={`Devenir partenaire avec ${item.startup?.nom || 'cette startup'}`}
                  >
                    Devenir Partenaire
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Fermer le modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Partenariat créé !</h3>
              <p className="text-gray-600 mb-6">Le partenariat a été établi avec succès. Vous pouvez maintenant collaborer avec cette startup.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Startup;