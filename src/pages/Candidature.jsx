import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaFileDownload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Candidature = () => {
  const [postulations, setPostulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entrepriseId = localStorage.getItem('entrepriseId');

  useEffect(() => {
    if (!entrepriseId) {
      setError("ID entreprise manquant.");
      setLoading(false);
      return;
    }

    const fetchPostulations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/entreprise/postulations', {
          params: { id_entreprise: entrepriseId },
        });
        if (response.data.status === 'success') {
          setPostulations(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Erreur lors de la récupération des postulations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostulations();
  }, [entrepriseId]);

  const handleHire = async (idPostulation) => {
    if (!window.confirm("Confirmez-vous l'embauche de cet étudiant ?")) return;

    try {
      const response = await axios.put(
        'http://localhost:3000/api/entreprise/embaucher',
        { id_postulation: idPostulation, id_entreprise: entrepriseId }
      );
      if (response.data.status === 'success') {
        setPostulations(
          postulations.map((p) =>
            p.id_postulation === idPostulation ? { ...p, statut_embauche: 'Embauché' } : p
          )
        );
        alert('Étudiant embauché avec succès.');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Erreur lors de l'embauche.");
      console.error(err);
    }
  };

  const handleNotHired = async (idPostulation) => {
    if (!window.confirm("Confirmez-vous que cet étudiant n'est pas embauché ?")) return;

    try {
      const response = await axios.put(
        'http://localhost:3000/api/entreprise/non_embaucher',
        { id_postulation: idPostulation, id_entreprise: entrepriseId }
      );
      if (response.data.status === 'success') {
        setPostulations(
          postulations.map((p) =>
            p.id_postulation === idPostulation ? { ...p, statut_embauche: 'Non embauché' } : p
          )
        );
        alert('Statut mis à jour : Non embauché.');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center text-red-600 text-xl font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <Header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md" />
      <main className="flex-grow container mx-auto pt-24 p-6 max-w-7xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800">
          Postulations Acceptées
        </h1>
        {postulations.length === 0 ? (
          <p className="text-center text-gray-600 text-xl">Aucune postulation acceptée.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {postulations.map((postulation) => (
              <div
                key={postulation.id_postulation}
                className="border rounded-xl p-6 shadow-lg bg-white hover:shadow-2xl transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-blue-700 mb-4">{postulation.titre_poste}</h2>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Informations de l'étudiant</h3>
                  <div className="mt-2 space-y-2 text-gray-700">
                    <p>
                      <span className="font-medium">Nom:</span> {postulation.nom} {postulation.prenom}
                    </p>
                    <p>
                      <span className="font-medium">Département:</span> {postulation.departement || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {postulation.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
                  <div className="flex space-x-4 mt-2">
                    <a
                      href={`http://localhost:3000/${postulation.cv}`}
                      className="flex items-center text- blue-600 hover:text-blue-800 font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFileDownload className="mr-2 text-lg" /> Télécharger CV
                    </a>
                    <a
                      href={`http://localhost:3000/${postulation.lettre_motivation}`}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFileDownload className="mr-2 text-lg" /> Télécharger Lettre
                    </a>
                  </div>
                </div>
                <div className="text-gray-700">
                  <p>
                    <span className="font-medium">Date de postulation:</span>{' '}
                    {new Date(postulation.date_postule).toLocaleDateString('fr-FR')}
                  </p>
                  <p>
                    <span className="font-medium">Statut d'embauche:</span>{' '}
                    <span
                      className={`font-semibold ${
                        postulation.statut_embauche === 'Embauché'
                          ? 'text-green-600'
                          : postulation.statut_embauche === 'Non embauché'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {postulation.statut_embauche}
                    </span>
                  </p>
                  {postulation.statut_embauche === 'En attente' && (
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => handleHire(postulation.id_postulation)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaCheckCircle className="mr-2" /> Embaucher
                      </button>
                      <button
                        onClick={() => handleNotHired(postulation.id_postulation)}
                        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FaTimesCircle className="mr-2" /> Non embauché
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Candidature;