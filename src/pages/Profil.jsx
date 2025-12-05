import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';

const API_URL = 'http://localhost:3000/api';
const COMPANY_ID =  localStorage.getItem('entrepriseId'); // Replace with dynamic ID from auth or route

const Profil = () => {
  const [profile, setProfile] = useState({});
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [relations, setRelations] = useState({ types: [], secteurs: [], domaines: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchLogo();
    fetchRelations();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/entreprise_get/${COMPANY_ID}`);
      setProfile(res.data.data);
      setFormData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la récupération du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogo = async () => {
    try {
      const res = await axios.get(`${API_URL}/entreprise/logo_get/${COMPANY_ID}`);
      setLogo(res.data.data.logo);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la récupération du logo');
    }
  };

  const fetchRelations = async () => {
    try {
      const res = await axios.get(`${API_URL}/relations/all`);
      setRelations(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la récupération des relations');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/profil_entreprise/${COMPANY_ID}`, formData);
      toast.success('Profil mis à jour avec succès');
      setProfile(formData);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    const formData = new FormData();
    formData.append('logo', logoFile);

    setIsLoading(true);
    try {
      const res = await axios.put(`${API_URL}/entreprise/logo/${COMPANY_ID}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Logo mis à jour avec succès');
      setLogo(res.data.data.logo);
      setLogoFile(null);
      setLogoPreview(null);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du téléchargement du logo');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelLogoUpload = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setIsModalOpen(false);
    fileInputRef.current.value = '';
  };

  return (
     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Profil de l'Entreprise</h1>

        {isLoading && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Logo Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Logo de l'Entreprise</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {logo ? (
              <img
               src={`http://localhost:3000${logo}`}
                alt="Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                Aucun logo
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choisir un nouveau logo
              </label>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Détails de l'Entreprise</h2>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom Complet</label>
                <input
                  type="text"
                  name="nom_complet_user"
                  value={formData.nom_complet_user || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Sigle</label>
                <input
                  type="text"
                  name="sigle"
                  value={formData.sigle || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom de l'Entreprise</label>
                <input
                  type="text"
                  name="nom_entreprise"
                  value={formData.nom_entreprise || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  name="mail"
                  value={formData.mail || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Utilisateur</label>
                <input
                  type="text"
                  name="user"
                  value={formData.user || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Mot de Passe</label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Téléphone</label>
                <input
                  type="text"
                  name="tel"
                  value={formData.tel || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Site Web</label>
                <input
                  type="text"
                  name="site_web"
                  value={formData.site_web || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600">Domaine d'Intervention</label>
                <textarea
                  name="domaine_intervention"
                  value={formData.domaine_intervention || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Type d'Entreprise</label>
                <select
                  name="id_type_entreprise"
                  value={formData.id_type_entreprise || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un type</option>
                  {relations.types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Secteur Géographique</label>
                <select
                  name="id_secteur_geographique"
                  value={formData.id_secteur_geographique || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un secteur</option>
                  {relations.secteurs.map((secteur) => (
                    <option key={secteur.id} value={secteur.id}>
                      {secteur.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Domaine d'Entreprise</label>
                <select
                  name="id_domaine_entreprise"
                  value={formData.id_domaine_entreprise || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un domaine</option>
                  {relations.domaines.map((domaine) => (
                    <option key={domaine.id} value={domaine.id}>
                      {domaine.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Nom Complet</p>
                <p className="mt-1 text-gray-800">{profile.nom_complet_user || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sigle</p>
                <p className="mt-1 text-gray-800">{profile.sigle || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Nom de l'Entreprise</p>
                <p className="mt-1 text-gray-800">{profile.nom_entreprise || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="mt-1 text-gray-800">{profile.mail || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateur</p>
                <p className="mt-1 text-gray-800">{profile.user || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Téléphone</p>
                <p className="mt-1 text-gray-800">{profile.tel || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Site Web</p>
                <p className="mt-1 text-gray-800">
                  {profile.site_web ? (
                    <a href={profile.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile.site_web}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="mt-1 text-gray-800">{profile.description || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-600">Domaine d'Intervention</p>
                <p className="mt-1 text-gray-800">{profile.domaine_intervention || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Type d'Entreprise</p>
                <p className="mt-1 text-gray-800">
                  {relations.types.find((t) => t.id === profile.id_type_entreprise)?.nom || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Secteur Géographique</p>
                <p className="mt-1 text-gray-800">
                  {relations.secteurs.find((s) => s.id === profile.id_secteur_geographique)?.nom || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Domaine d'Entreprise</p>
                <p className="mt-1 text-gray-800">
                  {relations.domaines.find((d) => d.id === profile.id_domaine_entreprise)?.nom || '-'}
                </p>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logo Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Prévisualisation du Logo</h3>
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Prévisualisation"
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                />
              )}
              <p className="text-gray-600 mb-6">Voulez-vous utiliser ce logo ?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelLogoUpload}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLogoUpload}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {isLoading ? 'Téléchargement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
        </div>
      </div></div>
    
  );
};


export default Profil;