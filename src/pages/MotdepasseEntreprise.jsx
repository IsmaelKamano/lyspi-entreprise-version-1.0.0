import React, { useState } from 'react';

const MotdepasseEntreprise = () => {
  const [mail, setMail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Base d'API normalisée (sans slash final)
  const RAW_API_BASE = import.meta.env.VITE_API_URL || 'https://backend-entreprise.onrender.com/api';
  const API_BASE = (RAW_API_BASE || '').replace(/[“”]/g, '"').replace(/\/+$/, '');
  const endpoint = (path) => {
    // Retire guillemets typographiques et espaces parasites
    const cleanPath = String(path || '').replace(/[“”]/g, '"').replace(/[\s\u200B-\u200D\uFEFF]+$/g, '').replace(/^\/+/, '');
    return `${API_BASE}/${cleanPath}`;
  };
  const apiBaseUrl = endpoint('entreprise');
  console.log('[FORGOT][CONFIG]', { API_BASE, apiBaseUrl });

  const handleVerifyEmail = async () => {
    const safeMail = (mail || '').replace(/[“”]/g, '"').trim();
    if (!safeMail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeMail)) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }

    setIsLoading(true);
    try {
      const url = endpoint('entreprise/sendcode');
      console.log('[FORGOT][SENDCODE] Request →', url, { mail: safeMail });
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: safeMail }),
      });

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      console.log('[FORGOT][SENDCODE] Response ←', { status: response.status, contentType, preview: text.slice(0, 120) });
      let data = {};
      try { data = JSON.parse(text); } catch {
        console.error('[FORGOT][SENDCODE] Réponse non JSON:', text.slice(0, 200));
        throw new Error('Réponse invalide du serveur (non JSON)');
      }
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l’envoi du code.');
      }

      setError('');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateCode = async () => {
    const safeMail = (mail || '').replace(/[“”]/g, '"').trim();
    if (!code || code.length < 4) {
      setError('Veuillez entrer un code de vérification valide.');
      return;
    }

    setIsLoading(true);
    try {
      const url = endpoint(`entreprise/verifycode?mail=${encodeURIComponent(safeMail)}&code=${encodeURIComponent(code)}`);
      console.log('[FORGOT][VERIFYCODE] Request →', url);
      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      console.log('[FORGOT][VERIFYCODE] Response ←', { status: response.status, contentType, preview: text.slice(0, 120) });
      let data = {};
      try { data = JSON.parse(text); } catch {
        console.error('[FORGOT][VERIFYCODE] Réponse non JSON:', text.slice(0, 200));
        throw new Error('Réponse invalide du serveur (non JSON)');
      }
      if (!response.ok) {
        throw new Error(data.message || 'Code invalide.');
      }

      setError('');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidatePasswords = async () => {
    const safeMail = (mail || '').replace(/[“”]/g, '"').trim();
    if (!password || !confirmPassword) {
      setError('Veuillez remplir les deux champs de mot de passe.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      const url = endpoint('entreprise/updatepassword');
      console.log('[FORGOT][UPDATEPWD] Request →', url, { mail: safeMail });
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: safeMail, code, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      console.log('[FORGOT][UPDATEPWD] Response ←', { status: response.status, contentType, preview: text.slice(0, 120) });
      let data = {};
      try { data = JSON.parse(text); } catch {
        console.error('[FORGOT][UPDATEPWD] Réponse non JSON:', text.slice(0, 200));
        throw new Error('Réponse invalide du serveur (non JSON)');
      }
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erreur lors de la mise à jour du mot de passe.');
      }

      setError('');
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    window.location.href = '/'; // Redirect to homepage
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-lg transform transition-all hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          Réinitialisation du mot de passe entreprise
        </h2>

        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-md text-center mb-6 animate-pulse">
            {error}
          </p>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse Email
              </label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Entrez votre email"
                value={mail}
                onChange={(e) => setMail(e.target.value.trim())}
              />
            </div>
            <button
              onClick={handleVerifyEmail}
              disabled={isLoading}
              className={`w-full p-3 text-white font-semibold rounded-lg transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Entrez le code reçu"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
              />
            </div>
            <button
              onClick={handleValidateCode}
              disabled={isLoading}
              className={`w-full p-3 text-white font-semibold rounded-lg transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {isLoading ? 'Validation en cours...' : 'Valider le code'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              onClick={handleValidatePasswords}
              disabled={isLoading}
              className={`w-full p-3 text-white font-semibold rounded-lg transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </button>
          </div>
        )}

        {step !== 1 && (
          <button
            onClick={() => setStep(1)}
            className="block text-blue-600 text-sm hover:underline text-center mt-6"
          >
            ← Retour à l'email
          </button>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center animate-fade-in">
            <h3 className="text-2xl font-bold text-green-600 mb-4">
              Mot de passe mis à jour !
            </h3>
            <p className="text-gray-600 mb-6">
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <button
              onClick={handleCloseModal}
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotdepasseEntreprise;