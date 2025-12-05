import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function Verification() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const emailQS = params.get('email') || '';
  const createdQS = params.get('created') === '1';

  const [email, setEmail] = useState(emailQS);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreatedOverlay, setShowCreatedOverlay] = useState(createdQS);

  useEffect(() => {
    setEmail(emailQS);
    if (createdQS) {
      setMessage('Compte LYSPi créé avec succès. Un code vous a été envoyé par email.');
      setShowCreatedOverlay(true);
      const t = setTimeout(() => setShowCreatedOverlay(false), 1800);
      return () => clearTimeout(t);
    }
  }, [emailQS]);

  const CreatedOverlay = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${showCreatedOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-live="polite" aria-atomic="true">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 via-emerald-500/80 to-teal-500/80 backdrop-blur-sm"></div>
      <div className="relative flex flex-col items-center text-white px-6">
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center animate-[pulse_1.2s_ease-in-out_infinite] shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-14 h-14 text-white">
              <path strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M20 7L9 18l-5-5" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold drop-shadow-md text-center">Compte créé avec succès</h2>
        <p className="mt-2 text-center text-white/90 max-w-md">Bienvenue sur LYSPi. Vérifie ton email, nous t'avons envoyé un code de vérification.</p>
      </div>
      {/* Particules simples */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`absolute w-2 h-2 bg-white/70 rounded-full animate-bounce`} style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDuration: `${0.9 + Math.random()*0.8}s`, animationDelay: `${Math.random()*0.6}s` }} />
        ))}
      </div>
    </div>
  );

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleSend = async () => {
    setError('');
    setMessage('');
    if (!email) return setError('Email requis');
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {
        console.error('[VERIF][SEND] Réponse non JSON:', text.slice(0, 200));
        throw new Error('Réponse invalide du serveur (non JSON)');
      }
      if (!res.ok) throw new Error(data.message || 'Envoi impossible');
      setMessage('Code envoyé à votre email');
    } catch (e) {
      setError(e.message || "Erreur d'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) return setError('Email requis');
    if (!code || code.length !== 6) return setError('Code à 6 chiffres requis');
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {
        console.error('[VERIF][CHECK] Réponse non JSON:', text.slice(0, 200));
        throw new Error('Réponse invalide du serveur (non JSON)');
      }
      if (!res.ok) throw new Error(data.message || 'Vérification impossible');
      setMessage('Email vérifié, redirection...');
      setTimeout(() => navigate('/connexion'), 1000);
    } catch (e) {
      setError(e.message || 'Erreur de vérification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-center mb-6 text-gray-800">Vérifier votre email</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading || !email}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            Renvoyer le code
          </button>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest text-center"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email || code.length !== 6}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              Valider
            </button>
          </form>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}

          <p className="text-center text-sm text-gray-600">Retour à la <Link className="text-blue-600" to="/connexion">connexion</Link></p>
        </div>
      </div>
    </div>
  );
}
