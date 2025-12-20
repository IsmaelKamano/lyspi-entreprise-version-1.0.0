import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';
import { toast } from 'react-toastify';
import Header from '../components/Header';

const StartupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [etudiant, setEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    const fetchStartupDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/startup/${id}`);
        const { startup: startupData, etudiant: etudiantData } = response.data;
        if (!startupData || !etudiantData) {
          throw new Error('Données manquantes');
        }
        setStartup(startupData);
        setEtudiant(etudiantData);

        // Determine file type for preview
        if (startupData.fichier_url) {
          const extension = startupData.fichier_url.split('.').pop().toLowerCase();
          setFileType(['png', 'jpg', 'jpeg', 'gif'].includes(extension) ? 'image' : extension === 'pdf' ? 'pdf' : 'unsupported');
        }
      } catch (error) {
        console.error('Erreur récupération détails startup:', error);
        setError('Impossible de charger les détails de la startup.');
        toast.error('Impossible de charger les détails de la startup.', {
          position: 'top-right',
          autoClose: 3000,
        });
        navigate('/accueil-entreprise');
      } finally {
        setLoading(false);
      }
    };
    fetchStartupDetails();
  }, [id, navigate]);

  const renderFilePreview = () => {
    if (!startup.fichier_url) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-200 rounded-2xl">
          <p className="text-gray-600 text-base font-medium">Aucun fichier disponible</p>
        </div>
      );
    }

    if (fileType === 'image') {
      return (
        <img
          src={startup.fichier_url}
          alt="Aperçu du fichier"
          className="w-full h-full object-contain rounded-2xl transition-transform duration-300 hover:scale-105"
          onError={() => setFileType('unsupported')}
        />
      );
    }

    if (fileType === 'pdf') {
      return (
        <embed
          src={`${startup.fichier_url}#toolbar=0&navpanes=0&scrollbar=0`}
          type="application/pdf"
          className="w-full h-full rounded-2xl"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-200 rounded-2xl p-6">
        <p className="text-gray-600 text-base font-medium text-center">Aperçu non disponible pour ce type de fichier</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-600"></div>
      </div>
    );
  }

  if (error || !startup || !etudiant) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <p className="text-red-600 text-lg font-semibold">Erreur : données manquantes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Back Button */}
  

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-12 tracking-tight bg-white/90 backdrop-blur-md inline-block px-8 py-4 rounded-xl shadow-md">
          {startup.nom || 'Nom inconnu'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Preview */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-[600px] flex flex-col transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Aperçu du fichier</h2>
            <div className="flex-1 overflow-hidden rounded-2xl">{renderFilePreview()}</div>
            {startup.fichier_url && (
              <a
                href={startup.fichier_url}
                download
                className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-black text-sm font-semibold rounded-lg hover:bg-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Télécharger le fichier associé"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Télécharger
              </a>
            )}
          </div>

          {/* Startup and Student Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Startup Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Détails de la Startup</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div className="group">
                  <p className="text-sm font-medium text-gray-500">Domaine</p>
                  <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{startup.domaine || 'Non spécifié'}</p>
                </div>
                <div className="sm:col-span-2 group">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-900 group-hover:text-teal-600 transition-colors duration-200">{startup.description || 'Non spécifiée'}</p>
                </div>
                <div className="sm:col-span-2 group">
                  <p className="text-sm font-medium text-gray-500">Problématique</p>
                  <p className="text-gray-900 group-hover:text-teal-600 transition-colors duration-200">{startup.problematique || 'Non spécifiée'}</p>
                </div>
                <div className="sm:col-span-2 group">
                  <p className="text-sm font-medium text-gray-500">Solution</p>
                  <p className="text-gray-900 group-hover:text-teal-600 transition-colors duration-200">{startup.solution || 'Non spécifiée'}</p>
                </div>
                <div className="group">
                  <p className="text-sm font-medium text-gray-500">Site web</p>
                  {startup.site_web ? (
                    <a
                      href={startup.site_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-800 underline font-medium transition-colors duration-300"
                    >
                      {startup.site_web}
                    </a>
                  ) : (
                    <p className="text-gray-900 group-hover:text-teal-600 transition-colors duration-200">Non spécifié</p>
                  )}
                </div>
                <div className="group">
                  <p className="text-sm font-medium text-gray-500">Date de création</p>
                  <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{startup.date_creation || 'Non spécifiée'}</p>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Détails de l'Étudiant</h2>
              <div className="flex flex-col sm:flex-row sm:gap-8">
                <div className="flex-shrink-0 mb-6 sm:mb-0">
                          <img
                    src={etudiant.photo_profil_url || 'https://via.placeholder.com/150?text=Profil'}
                    alt={`${etudiant.nom || 'Étudiant'} ${etudiant.prenom || ''}`}
                    className="w-40 h-40 rounded-full object-cover border-4 border-teal-200 shadow-lg transition-transform duration-300 hover:scale-105"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=Profil')}
                  />

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.nom || 'Non spécifié'}</p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Prénom</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.prenom || 'Non spécifié'}</p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Sexe</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.sexe || 'Non spécifié'}</p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Matricule</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.matricule || 'Non spécifié'}</p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Date d'inscription</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.date_inscription || 'Non spécifiée'}</p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Licence</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.licence || 'Non spécifiée'}</p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Faculté</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.faculte || 'Non spécifiée'}</p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.contact?.tel || 'Non spécifié'}</p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium group-hover:text-teal-600 transition-colors duration-200">{etudiant.contact?.email || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDetails;