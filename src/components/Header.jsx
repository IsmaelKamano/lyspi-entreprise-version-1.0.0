import React, { useState, useEffect, useRef } from 'react';
import logoSrc from '../../images/premiere.jpg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOffresDropdownOpen, setIsOffresDropdownOpen] = useState(false);
  const [isAnalyseDropdownOpen, setIsAnalyseDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, subscribeToPush } = useNotification();

  const navigate = useNavigate();
  const location = useLocation();

  const offresRef = useRef(null);
  const analyseRef = useRef(null);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  const isAuthed = Boolean(localStorage.getItem('entrepriseId'));
  const isOnPublicHome = location.pathname === '/' || location.pathname === '';

  // === Navigation intelligente (scroll direct sur accueil publique) ===
  const handleSmartNav = (e, realPath, targetId) => {
    e.preventDefault();

    if (!isAuthed) {
      if (isOnPublicHome) {
        // Déjà sur la page d'accueil → scroll fluide direct
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Effet highlight (assure-toi que la classe existe dans ton CSS global)
          element.classList.add('highlight-glow');
          setTimeout(() => element.classList.remove('highlight-glow'), 3000);

          // Mise à jour du hash sans ajouter d'entrée dans l'historique
          if (location.hash !== `#${targetId}`) {
            navigate(`#${targetId}`, { replace: true });
          }
        }
      } else {
        // Depuis une autre page → navigation vers accueil + ancre
        navigate(`/#${targetId}`);
      }
    } else {
      // Connecté → navigation normale
      navigate(realPath);
    }

    // Fermer le menu mobile dans tous les cas
    setIsMenuOpen(false);
  };

  const handleMouseEnter = (setDropdown) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdown(true);
  };

  const handleMouseLeave = (setDropdown) => {
    timeoutRef.current = setTimeout(() => setDropdown(false), 300);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsOffresDropdownOpen(false);
    setIsAnalyseDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('entrepriseId');
    navigate('/');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        offresRef.current && !offresRef.current.contains(event.target) &&
        analyseRef.current && !analyseRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOffresDropdownOpen(false);
        setIsAnalyseDropdownOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-blue-900 text-white fixed top-0 left-0 right-0 z-50 shadow-lg backdrop-blur-sm border-b border-white/10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <img src={logoSrc} alt="LYSPI Logo" className="h-10 w-10 object-cover rounded-full ring-2 ring-white/20 transition-all duration-300 group-hover:ring-blue-400 group-hover:scale-110" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 to-emerald-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
          </div>
          <Link
            to="/"
            onClick={(e) => handleSmartNav(e, '/accueil-entreprise', 'cockpit')}
            className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 hover:from-blue-300 hover:to-white transition-all duration-300"
          >
            LYSPI
          </Link>
        </div>

        {/* Hamburger Button */}
        <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-white/10">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>

        {/* Mobile Menu - AMÉLIORÉ : Centré au milieu + Design premium */}
        {isMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsMenuOpen(false);
            }}
          >
            <div 
              ref={menuRef}
              className="bg-blue-900 w-[90%] max-w-md rounded-3xl shadow-2xl border border-blue-800/60 p-6 relative overflow-hidden"
            >
              {/* Bouton fermer */}
              <button 
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo centré */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img src={logoSrc} alt="LYSPI Logo" className="h-16 w-16 rounded-full ring-4 ring-blue-400/30 mx-auto" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400/30 to-emerald-500/30 blur-xl opacity-50"></div>
                </div>
                <h3 className="text-2xl font-extrabold text-white mt-3">LYSPI</h3>
              </div>

              {/* Onglets en grille 2 colonnes, parfaitement centrés */}
                  <div className="grid grid-cols-2 gap-4">
                {[
                  { path: '/accueil-entreprise', label: 'Accueil', id: 'cockpit', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                  { path: '/candidature', label: 'Candidatures', id: 'candidatures', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { path: '/startup', label: 'Startups', id: 'startups', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                  { path: '/messagerie', label: 'Messagerie', id: 'messagerie', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { path: '/publier/offre', label: 'Offres d’Emploi', id: 'offres', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { path: '/publier/formation', label: 'Formations', id: 'formation', icon: 'M12 14l9-5-9-5-9 5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
                  { path: '/publier/evenement', label: 'Événements', id: 'evenement', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { path: '/publier/success-story', label: 'Success Stories', id: 'success-story', icon: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' },
                  { path: '/analyse', label: 'Analyse', id: 'analyse', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2M9 19' },
                ].map(link => (
                  <button
                      key={link.id}
                      onClick={(e) => handleSmartNav(e, link.path, link.id)}
                      className="flex flex-col items-center justify-center p-5 bg-blue-800/90 rounded-2xl hover:bg-blue-700/95 transition-all duration-300 group"
                    >
                      <svg className="w-8 h-8 mb-3 text-white group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                    </svg>
                      <span className="text-sm font-medium text-white text-center">{link.label}</span>
                  </button>
                ))}
              </div>

              {/* Séparateur */}
              <div className="h-px bg-blue-700/50 my-6"></div>

              {/* À propos */}
              <Link
                to="/apropos"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center py-3 text-white/90 hover:text-white font-medium transition-colors"
              >
                À propos
              </Link>

              {/* Déconnexion si connecté */}
              {isAuthed && (
                <button
                  onClick={handleLogout}
                  className="block w-full mt-4 py-3 bg-red-600/80 hover:bg-red-700 rounded-2xl text-white font-medium transition-colors"
                >
                  Se déconnecter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Desktop Navigation - INCHANGÉ (tout le reste reste exactement comme avant) */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex items-center space-x-8">

            {/* Onglets simples */}
            {[
              { real: '/accueil-entreprise', id: 'cockpit', label: 'Accueil', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { real: '/candidature', id: 'candidatures', label: 'Candidatures', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { real: '/startup', id: 'startups', label: 'Startups', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { real: '/messagerie', id: 'messagerie', label: 'Messagerie', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            ].map((item) => (
              <li key={item.id}>
                <Link
                  to={isOnPublicHome && !isAuthed ? `/#${item.id}` : item.real}
                  onClick={(e) => handleSmartNav(e, item.real, item.id)}
                  className="flex items-center text-sm font-medium text-white/90 hover:text-blue-400 transition-colors duration-200 group"
                >
                  <svg className="w-4 h-4 mr-1.5 text-white/70 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              </li>
            ))}

            {/* OFFRES Dropdown */}
            <li className="relative" ref={offresRef}>
              <button
                onMouseEnter={() => handleMouseEnter(setIsOffresDropdownOpen)}
                onMouseLeave={() => handleMouseLeave(setIsOffresDropdownOpen)}
                className="flex items-center text-sm font-medium text-white/90 hover:text-blue-400 transition-all duration-200 group"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Offres
                <svg className={`ml-1 h-4 w-4 transition-transform ${isOffresDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOffresDropdownOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-xl shadow-2xl py-3 z-50 border border-gray-100"
                  onMouseEnter={() => handleMouseEnter(setIsOffresDropdownOpen)}
                  onMouseLeave={() => handleMouseLeave(setIsOffresDropdownOpen)}
                >
                  {[
                    { real: '/publier/offre', target: 'offres', label: 'Offre d’emploi', icon: 'M21 13.255...' },
                    { real: '/publier/stage', target: 'offres', label: 'Offre de stage', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                    { real: '/publier/formation', target: 'formation', label: 'Formation', icon: 'M12 14l9-5-9-5...' },
                    { real: '/publier/evenement', target: 'evenement', label: 'Événement & Afterwork', icon: 'M8 7V3m8 4V3...' },
                    { real: '/publier/success-story', target: 'success-story', label: 'Success Story', icon: 'M12 17.27L18.18...' },
                  ].map((item) => (
                    <Link
                      key={item.real}
                      to={isOnPublicHome && !isAuthed ? `/#${item.target}` : item.real}
                      onClick={(e) => {
                        setIsOffresDropdownOpen(false);
                        handleSmartNav(e, item.real, item.target);
                      }}
                      className="flex items-center px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-sm transition-all duration-150"
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      {item.label}
                      {item.label === 'Offre de stage' && (
                        <span className="ml-auto bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          NOUVEAU
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {/* ANALYSE Dropdown */}
            <li className="relative" ref={analyseRef}>
              <button
                onMouseEnter={() => handleMouseEnter(setIsAnalyseDropdownOpen)}
                onMouseLeave={() => handleMouseLeave(setIsAnalyseDropdownOpen)}
                className="flex items-center text-sm font-medium text-white/90 hover:text-blue-400 transition-all duration-200 group"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2M9 19" />
                </svg>
                Analyse
                <svg className={`ml-1 h-4 w-4 transition-transform ${isAnalyseDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAnalyseDropdownOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-xl shadow-2xl py-3 z-50 border border-gray-100"
                  onMouseEnter={() => handleMouseEnter(setIsAnalyseDropdownOpen)}
                  onMouseLeave={() => handleMouseLeave(setIsAnalyseDropdownOpen)}
                >
                  {[
                    { real: '/analyse', label: 'Toutes les analyses', icon: 'M9 19v-6a2 2 0 00-2-2H5...' },
                    { real: '/analyse/offre', label: 'Analyse Offres', icon: 'M13 10h7.99M13 14h7.99' },
                    { real: '/analyse/startup', label: 'Analyse Startups', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    { real: '/analyse/formation', label: 'Analyse Formations', icon: 'M12 14l9-5-9-5...' },
                  ].map((item) => (
                    <Link
                      key={item.real}
                      to={isOnPublicHome && !isAuthed ? '/#analyse' : item.real}
                      onClick={(e) => {
                        setIsAnalyseDropdownOpen(false);
                        handleSmartNav(e, item.real, 'analyse');
                      }}
                      className="flex items-center px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-sm transition-all duration-150"
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>

          </ul>

          {/* Notification Bell + Profil + Menu Desktop */}
          <div className="flex items-center space-x-4 pl-6 border-l border-white/10 ml-4">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors"
              >
                <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-blue-900"></div>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{unreadCount} nouvelles</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif._id || Math.random()}
                          onClick={() => markAsRead(notif._id)}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <p className="text-sm text-gray-800 font-medium">{notif.title || 'Notification'}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-2 block">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-400 text-sm">
                        Aucune notification pour le moment.
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <Link to="/notifications" className="text-xs font-semibold text-blue-600 hover:text-blue-700 w-full text-center block">
                      Voir toutes les notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            {isAuthed ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center text-red-300 hover:text-white transition-colors"
                  title="Se déconnecter"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-400 to-emerald-400 p-[2px]">
                      <div className="h-full w-full rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-xs">
                        ENT
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Profil */}
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 hidden group-hover:block">
                    <Link to="/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                      Mon Profil
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                      Paramètres
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>

            ) : (
              <Link to="/connexion" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/50">
                Connexion
              </Link>
            )}

            {/* À propos Link (Right side) */}
            <Link
              to="/apropos"
              className="hidden md:flex items-center text-sm font-medium text-white/90 hover:text-blue-400 transition-colors duration-200 ml-4 border-l border-white/10 pl-4"
            >
              <svg className="w-5 h-5 mr-1.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              À propos
            </Link>

          </div>
        </div>
      </nav>
    </header >
  );
};

export default Header;