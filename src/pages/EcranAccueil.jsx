import React, { useState } from 'react';
import axios from 'axios';
import { API } from '../config/api';
import { useNavigate } from 'react-router-dom';

export default function EcranAccueil() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!user.trim()) return "Email requis";
    if (!password) return 'Mot de passe requis';
    return '';
  };

  const handleConnexion = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-entreprise.onrender.com/api';
      const response = await axios.post(`${API}/auth/login`, {
        email: user.trim(),
        mot_de_passe: password,
      });

      if (response.status === 200 && response.data.token) {
        // Stocker le token JWT
        localStorage.setItem('authToken', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Décoder le token pour récupérer l'id d'entreprise et le stocker
        try {
          const parts = response.data.token.split('.');
          if (parts.length === 3) {
            const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            const payload = JSON.parse(payloadStr);
            if (payload && payload.id) {
              localStorage.setItem('entrepriseId', String(payload.id));
              console.log('[FRONT][LOGIN] entrepriseId enregistré depuis le token', payload.id);
            }
          }
        } catch (e) {
          console.warn('[FRONT][LOGIN] Impossible de décoder le token JWT pour extraire entrepriseId', e);
        }

        // Redirection immédiate vers l'accueil entreprise
        setSuccess('Connexion réussie ! Bienvenue sur LYSPi.');
        console.log('[FRONT][LOGIN] Connexion OK, redirection vers /accueil-entreprise');
        navigate('/accueil-entreprise', { replace: true });
      } else {
        setError(response.data.message || "Erreur d'identification");
      }
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const errorMessage = err.response?.data?.message || 'Impossible de joindre le serveur';
      if (status === 403) {
        setError("Ton email n'est pas vérifié. Vérifie ta boîte mail ou renvoie un code sur la page de vérification.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnuler = () => {
    setUser('');
    setPassword('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleConnexion();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-[url('/batiment_unc.jpeg')] bg-cover bg-center">
      <div className="relative bg-white bg-opacity-95 p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg transform transition-all duration-300 hover:shadow-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-gray-100/90 rounded-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-8 text-gray-800">
            <span className="text-blue-600">LYSPI</span> Entreprise
          </h1>

          {error && (
            <div 
              className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 animate-slide-down"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <div 
              className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 animate-slide-down"
              role="status"
            >
              {success}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                placeholder="Entrez votre email"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                aria-invalid={error.includes('Email') ? "true" : "false"}
                aria-describedby={error.includes('Email') ? "email-error" : undefined}
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                aria-invalid={error.includes("passe") ? "true" : "false"}
                aria-describedby={error.includes("passe") ? "password-error" : undefined}
              />
            </div>
          </div>

          <button
            onClick={handleConnexion}
            disabled={isLoading}
            className={`w-full mt-8 py-3 rounded-lg text-white font-semibold transition duration-300 flex items-center justify-center
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 active:bg-blue-800'
              }`}
            aria-label="Se connecter"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>

          {/* Bouton 'Annuler' supprimé : inutile sur la page de connexion */}

          <div className="mt-6 text-center">
            <a 
              href="/motdepasse-entreprise" 
              className="text-blue-600 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Mot de passe oublié"
            >
              Mot de passe oublié ?
            </a>
          </div>
          <div className="mt-2 text-center">
            <a 
              href="/inscription" 
              className="text-blue-600 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Créer un compte"
            >
              Pas de compte ? S'inscrire
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}