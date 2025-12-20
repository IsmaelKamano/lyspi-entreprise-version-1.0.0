import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../config/api';

export default function Inscription() {
  const navigate = useNavigate();
  const [entreprise, setEntreprise] = useState('');
  const [email, setEmail] = useState('');
  const [idTypeDomaine, setIdTypeDomaine] = useState(''); // 1=Technologie,2=Sante,3=Education
  const [typeEntreprise, setTypeEntreprise] = useState(''); // id_type_entreprise
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [communes, setCommunes] = useState([]);
  const [idCommune, setIdCommune] = useState('');
  const [quartier, setQuartier] = useState('');

  useEffect(() => {
    const loadCommunes = async () => {
      try {
        const res = await fetch(`${API}/reference/communes`);
        if (!res.ok) throw new Error('Impossible de charger les communes');
        const data = await res.json();
        setCommunes(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        console.error('Erreur chargement communes', e);
      }
    };
    loadCommunes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entreprise.trim()) return setError("Nom de l'entreprise requis");
    if (!email.trim()) return setError('Email requis');
    if (!idTypeDomaine) return setError('Domaine requis');
    if (!password) return setError('Mot de passe requis');
    if (!typeEntreprise) return setError("Type d'entreprise requis");
    if (!idCommune) return setError('Commune requise');
    if (!quartier.trim()) return setError('Quartier requis');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas');

    setError('');
    setIsLoading(true);
    try {
      // use centralized API base
      const API_BASE = API;
      const formData = new FormData();
      formData.append('nom', entreprise);
      formData.append('email', email);
      formData.append('id_type_domaine', idTypeDomaine);
      formData.append('mot_de_passe', password);
      if (logo) formData.append('logo', logo);
      // Map du type d'entreprise: valeurs d'ID fixes 1=SARL, 2=SA, 3=Entreprise individuelle
      formData.append('id_type_entreprise', typeEntreprise);
      // Adresse: on envoie id_commune et quartier pour créer l'adresse si nécessaire
      formData.append('id_commune', idCommune);
      formData.append('quartier', quartier);

      const res = await fetch(`${API_BASE}/inscription/register`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let data = {};
        try { data = await res.json(); } catch {}
        const details = Array.isArray(data.details) ? `: ${data.details.join(', ')}` : '';
        const msg = data.message ? `${data.message}${details}` : `Impossible de créer le compte${details}`;
        console.error('Inscription échouée', { status: res.status, data });
        throw new Error(msg);
      }
      const data = await res.json();
      console.log('Inscription réussie', data);
      navigate(`/verification?email=${encodeURIComponent(email)}&created=1`);
    } catch (err) {
      console.error('Erreur lors de l\'inscription', err);
      setError(err.message || "Impossible de créer le compte. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-center mb-6 text-gray-800">
          Créer un compte Entreprise
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={idTypeDomaine}
              onChange={(e) => setIdTypeDomaine(e.target.value)}
            >
              <option value="">-- Sélectionner un domaine --</option>
              <option value="1">Technologie</option>
              <option value="2">Sante</option>
              <option value="3">Education</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={idCommune}
              onChange={(e) => setIdCommune(e.target.value)}
            >
              <option value="">-- Sélectionner une commune --</option>
              {communes.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'entreprise</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={typeEntreprise}
              onChange={(e) => setTypeEntreprise(e.target.value)}
            >
              <option value="">-- Sélectionner un type --</option>
              <option value="1">SARL</option>
              <option value="2">SA</option>
              <option value="3">Entreprise individuelle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setLogo(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3 rounded-lg text-white font-semibold transition duration-300
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'}`}
          >
            {isLoading ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-blue-600 font-medium hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
