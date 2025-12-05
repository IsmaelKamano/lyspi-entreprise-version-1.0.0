import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../components/Header';

const Startup = () => {
  const [startups, setStartups] = useState([]);
  const [partenariats, setPartenariats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
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
        const response = await axios.get('http://localhost:3000/api/list/startups');
        const data = response.data.data || response.data;
        if (!data || data.message === 'Aucune startup trouvée') {
          toast.info('Aucune startup trouvée');
          setStartups([]);
        } else {
          setStartups(data);
        }
      } catch {
       
        toast.error('Impossible de charger les startups.');
      } finally {
        setLoading(false);
      }
    };

    const fetchPartenariats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/entreprise/${entrepriseId}/partenariats-complets`
        );
        const startupIds = response.data.map((p) => p.startup_id);
        setPartenariats(startupIds);
      } catch {
        setError('Erreur lors de la récupération des partenariats');
        toast.error('Impossible de charger les partenariats.');
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
      const response = await axios.post('http://localhost:3000/api/startup/partenaire', {
        startup_id: startupId,
        entreprise_id: parseInt(entrepriseId),
      });
      if (response.status === 201) {
        toast.success('Partenariat créé avec succès');
        setPartenariats([...partenariats, startupId]);
      } else if (response.status === 409) {
        toast.info('Cette startup est déjà partenaire.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du partenariat');
      toast.error(err.response?.data?.message || 'Une erreur est survenue.');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          Découvrez les Startups
        </h1>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <input
            type="text"
            placeholder="Rechercher une startup..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full sm:w-1/4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Tous les domaines</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg text-center border border-red-200 shadow-sm max-w-2xl mx-auto">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600 text-lg">Chargement...</span>
          </div>
        )}

        {filteredStartups.length === 0 && !loading ? (
          <p className="text-lg text-gray-500 text-center py-8">
            Aucune startup ne correspond à vos critères.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStartups.map((item) => (
              <div
                key={item.startup?.id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/details/${item.startup?.id}`, {
                      state: { startup: item.startup, etudiant: item.etudiant },
                    })
                  }
                >
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3 truncate">
                    {item.startup?.nom || 'Nom inconnu'}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {item.startup?.description || 'Non spécifiée'}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <strong>Domaine :</strong> {item.startup?.domaine || 'Non spécifié'}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <strong>Équipe :</strong> {item.etudiant?.nom || 'Inconnu'}{' '}
                    {item.etudiant?.prenom || ''}
                  </p>
                </div>

                {!partenariats.includes(item.startup?.id) && (
                  <button
                    onClick={() => handlePartenariat(item.startup?.id)}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
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
    </div>
  );
};

export default Startup;
