import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaBriefcase,
  FaUsers,
  FaHandshake,
  FaBookOpen,
  FaRocket,
  FaArrowRight,
  FaStar,
  FaCalendarAlt,
} from 'react-icons/fa';

const MainContent = () => {
  const [stats, setStats] = useState({
    offres: 0,
    candidatsEmbauches: 0,
    partenariats: 0,
    formations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const entrepriseId = localStorage.getItem('entrepriseId');

  // === TEXTES QUI ALTERNENT ===
  const texts = [
    `Bienvenue sur votre Espace Entreprise
Gérez efficacement vos recrutements, suivez vos candidatures et publiez vos offres d’emploi, de stage ou de formation.
Analysez vos performances, valorisez vos succès et développez votre réseau en collaborant avec les startups et partenaires de l’écosystème.`,

    `Bienvenue sur votre Espace Entreprise
Recrutez les meilleurs talents, publiez vos offres d’emploi, de stage ou de formation, et suivez vos performances en temps réel.
Partagez vos réussites, inspirez la communauté et créez des synergies avec les startups et partenaires de l’écosystème.`
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev === 0 ? 1 : 0));
    }, 15000); // 15 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!entrepriseId) {
      setError("ID de l'entreprise non trouvé. Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const [offresRes, embauchesRes, partenariatsRes, formationsRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/offres/count/${entrepriseId}`),
          axios.get(`http://localhost:3000/api/candidats/embauches/count/${entrepriseId}`),
          axios.get(`http://localhost:3000/api/partenariats/count/${entrepriseId}`),
          axios.get(`http://localhost:3000/api/formations/count/${entrepriseId}`),
        ]);

        setStats({
          offres: offresRes.data?.count || 0,
          candidatsEmbauches: embauchesRes.data?.count || 0,
          partenariats: partenariatsRes.data?.count || 0,
          formations: formationsRes.data?.count || 0,
        });
      } catch (err) {
        console.error('Erreur lors du chargement des stats:', err);
        setError('Impossible de charger les statistiques. Veuillez réessayer.');
        // Initialiser avec des valeurs par défaut en cas d'erreur
        setStats({
          offres: 0,
          candidatsEmbauches: 0,
          partenariats: 0,
          formations: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Rafraîchir les statistiques toutes les 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [entrepriseId]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');

        body {
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
          background-color: transparent;
        }

        /* Boutons */
        .btn-gradient-blue, .btn-gradient-orange, .btn-gradient-green,
        .btn-gradient-purple, .btn-gradient-teal {
          color: white;
          font-weight: 600;
          transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
          border-radius: 9999px;
        }

        .btn-gradient-blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
        .btn-gradient-blue:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3); background: linear-gradient(135deg, #2563eb, #3b82f6); }

        .btn-gradient-orange { background: linear-gradient(135deg, #ea580c, #f97316); }
        .btn-gradient-orange:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 12px rgba(234, 88, 12, 0.3); background: linear-gradient(135deg, #c2410c, #ea580c); }

        .btn-gradient-green { background: linear-gradient(135deg, #16a34a, #22c55e); }
        .btn-gradient-green:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 12px rgba(22, 163, 74, 0.3); background: linear-gradient(135deg, #15803d, #16a34a); }

        .btn-gradient-purple { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
        .btn-gradient-purple:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 12px rgba(139, 92, 246, 0.3); background: linear-gradient(135deg, #7c3aed, #8b5cf6); }

        .btn-gradient-teal { background: linear-gradient(135deg, #0d9488, #14b8a6); }
        .btn-gradient-teal:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 12px rgba(13, 148, 136, 0.3); background: linear-gradient(135deg, #0f766e, #0d9488); }

        /* Cartes */
        .card-blue, .card-orange, .card-green, .card-purple, .card-teal {
          border-radius: 1.5rem;
          border: 1px solid transparent;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card-blue { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-color: rgba(59, 130, 246, 0.2); }
        .card-blue:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2); }

        .card-orange { background: linear-gradient(135deg, #fff7ed, #ffedd5); border-color: rgba(234, 88, 12, 0.2); }
        .card-orange:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(234, 88, 12, 0.2); }

        .card-green { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: rgba(22, 163, 74, 0.2); }
        .card-green:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(22, 163, 74, 0.2); }

        .card-purple { background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-color: rgba(139, 92, 246, 0.2); }
        .card-purple:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(139, 92, 246, 0.2); }

        .card-teal { background: linear-gradient(135deg, #ecfeff, #cffafe); border-color: rgba(13, 148, 136, 0.2); }
        .card-teal:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(13, 148, 136, 0.2); }

        /* Icônes */
        .icon-blue { color: #3b82f6; }
        .icon-orange { color: #ea580c; }
        .icon-green { color: #16a34a; }
        .icon-purple { color: #8b5cf6; }
        .icon-teal { color: #0d9488; }

        /* Animation texte */
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }

        .animate-text {
          animation: fadeInOut 15s infinite;
          white-space: pre-line;
          line-height: 1.8;
        }

        /* Hero avec fond translucide comme les cartes */
        .hero-bg {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
          padding: 4rem 2rem;
          color: white;
          text-align: center;
        }

        .hero-bg h1 {
          font-size: 2.8rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .hero-bg p {
          font-size: 1.1rem;
          max-width: 800px;
          margin: 1.5rem auto;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        @media (min-width: 768px) {
          .hero-bg h1 { font-size: 3.5rem; }
          .hero-bg p { font-size: 1.25rem; }
        }
      `}</style>

      <main className="p-6 md:p-10 space-y-12">

        {/* === HERO SANS CARTE (plein écran épuré) === */}
        <section className="space-y-6 text-center text-white pt-16 md:pt-24 pb-10">
          <h1 className="text-3xl md:text-5xl font-bold drop-shadow">Bienvenue sur votre Espace Entreprise</h1>
          <p className="animate-text text-base md:text-lg max-w-4xl mx-auto">
            {texts[currentTextIndex]}
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Link to="/publier/offre" className="btn-gradient-blue px-6 py-3 text-base inline-flex items-center justify-center">
              <FaBriefcase className="mr-2" /> Publier une Offre
            </Link>
            <Link to="/analyse/offre" className="btn-gradient-orange px-8 py-4 text-lg inline-flex items-center justify-center">
              Voir les Offres <FaArrowRight className="ml-2" />
            </Link>
            <Link to="/candidature" className="btn-gradient-green px-8 py-4 text-lg inline-flex items-center justify-center">
              Gérer les Candidatures <FaArrowRight className="ml-2" />
            </Link>
            <Link to="/startup" className="btn-gradient-purple px-8 py-4 text-lg inline-flex items-center justify-center">
              Découvrir les Startups <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </section>

        {/* === 3 CARTES RÉDUITES EN HAUT === */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link to="/publier/offre" className="card-blue p-4 space-y-2 flex flex-col justify-between block hover:no-underline max-w-sm w-full mx-auto">
            <div className="space-y-1">
              <FaRocket className="icon-blue text-3xl" />
              <h3 className="text-lg font-semibold text-gray-800">Publiez Vos Offres</h3>
              <p className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.offres}</p>
            </div>
            <div className="btn-gradient-blue px-5 py-2 inline-flex items-center justify-center text-sm font-medium">
              Publier une Offre <FaArrowRight className="ml-2" />
            </div>
          </Link>

          <Link to="/candidature" className="card-purple p-4 space-y-2 flex flex-col justify-between block hover:no-underline max-w-sm w-full mx-auto">
            <div className="space-y-1">
              <FaUsers className="icon-purple text-3xl" />
              <h3 className="text-lg font-semibold text-gray-800">Gérez Vos Candidatures</h3>
              <p className="text-2xl font-bold text-purple-700">{loading ? '...' : stats.candidatsEmbauches}</p>
            </div>
            <div className="btn-gradient-purple px-5 py-2 inline-flex items-center justify-center text-sm font-medium">
              Gérer les Candidatures <FaArrowRight className="ml-2" />
            </div>
          </Link>

          <Link to="/publier/evenement" className="card-teal p-4 space-y-2 flex flex-col justify-between block hover:no-underline max-w-sm w-full mx-auto">
            <div className="space-y-1">
              <FaCalendarAlt className="icon-teal text-3xl" />
              <h3 className="text-lg font-semibold text-gray-800">Publier vos Événements</h3>
              <p className="text-sm text-gray-600">Faites connaître vos salons, conférences et ateliers.</p>
            </div>
            <div className="btn-gradient-teal px-5 py-2 inline-flex items-center justify-center text-sm font-medium">
              Publier un Événement <FaArrowRight className="ml-2" />
            </div>
          </Link>
        </section>

        {/* === SECTIONS STATISTIQUES HARMONISÉES === */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-blue p-6 space-y-2">
            <FaBriefcase className="icon-blue text-4xl" />
            <h3 className="text-xl font-semibold text-gray-800">Offres d'Emploi</h3>
            <p className="text-3xl font-bold text-blue-600">{loading ? '...' : stats.offres}</p>
          </div>
          <div className="card-teal p-6 space-y-2">
            <FaUsers className="icon-teal text-4xl" />
            <h3 className="text-xl font-semibold text-gray-800">Candidats Embauchés</h3>
            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.candidatsEmbauches}</p>
          </div>
          <div className="card-purple p-6 space-y-2">
            <FaHandshake className="icon-purple text-4xl" />
            <h3 className="text-xl font-semibold text-gray-800">Partenariats Actifs</h3>
            <p className="text-3xl font-bold text-purple-700">{loading ? '...' : stats.partenariats}</p>
          </div>
          <div className="card-blue p-6 space-y-2">
            <FaBookOpen className="icon-blue text-4xl" />
            <h3 className="text-xl font-semibold text-gray-800">Formations Complétées</h3>
            <p className="text-3xl font-bold text-blue-500">{loading ? '...' : stats.formations}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-orange p-8 space-y-4">
            <FaRocket className="icon-orange text-5xl" />
            <h2 className="text-2xl font-bold text-gray-800">Publiez Vos Offres</h2>
            <p className="text-gray-600">Attirez les meilleurs talents en publiant vos offres d'emploi sur notre plateforme.</p>
            <Link to="/publier/offre" className="btn-gradient-orange px-6 py-3 inline-block">
              Publier une Offre
            </Link>
          </div>
          <div className="card-teal p-8 space-y-4">
            <FaUsers className="icon-teal text-5xl" />
            <h2 className="text-2xl font-bold text-gray-800">Gérez Vos Candidatures</h2>
            <p className="text-gray-600">Suivez et gérez facilement les candidatures reçues pour vos offres.</p>
            <Link to="/candidature" className="btn-gradient-teal px-6 py-3 inline-block">
              Voir les Candidatures
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center">Nos Partenaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-blue p-6 space-y-2">
              <FaHandshake className="icon-blue text-4xl" />
              <h3 className="text-xl font-semibold text-gray-800">Partenaire 1</h3>
              <p className="text-gray-600">Description du partenaire et bénéfices.</p>
              <button className="btn-gradient-blue px-4 py-2">Contacter</button>
            </div>
            <div className="card-purple p-6 space-y-2">
              <FaHandshake className="icon-purple text-4xl" />
              <h3 className="text-xl font-semibold text-gray-800">Partenaire 2</h3>
              <p className="text-gray-600">Description du partenaire et bénéfices.</p>
              <button className="btn-gradient-purple px-4 py-2">Contacter</button>
            </div>
            <div className="card-teal p-6 space-y-2">
              <FaHandshake className="icon-teal text-4xl" />
              <h3 className="text-xl font-semibold text-gray-800">Partenaire 3</h3>
              <p className="text-gray-600">Description du partenaire et bénéfices.</p>
              <button className="btn-gradient-teal px-4 py-2">Contacter</button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center">Ce Que Disent Nos Utilisateurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Une plateforme incroyable pour gérer nos recrutements !", author: "Entreprise A" },
              { quote: "Les partenariats nous ont ouvert de nouvelles portes.", author: "Entreprise B" },
              { quote: "Analyses précises et faciles à utiliser.", author: "Entreprise C" },
            ].map((t, index) => (
              <div key={index} className={`card-${['blue', 'teal', 'purple'][index % 3]} p-6 space-y-4 text-center`}>
                <FaStar className={`icon-${['blue', 'teal', 'purple'][index % 3]} text-3xl mx-auto`} />
                <p className="text-gray-600 italic">"{t.quote}"</p>
                <p className="font-semibold text-gray-800">{t.author}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default MainContent;