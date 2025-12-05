import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  HomeModernIcon,
  DocumentMagnifyingGlassIcon,
  LightBulbIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  TrophyIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function AccueilPublic() {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRefs = useRef({});

const features = [
  {
    id: 'accueil',
    icon: HomeModernIcon,
    title: "Cockpit Ultra-Puissant",
    desc: "Tableau de bord complet et alertes en temps réel.",
    highlight: "Pilotez vos recrutements et restez toujours maître de la situation.",
  },
  {
    id: 'candidatures',
    icon: DocumentMagnifyingGlassIcon,
    title: "Candidatures Automatisées",
    desc: "Suivi rapide des candidatures et gestion collaborative fluide.",
    highlight: "Trouvez et sécurisez les talents rares avant vos concurrents.",
  },
  {
    id: 'startups',
    icon: LightBulbIcon,
    title: "Partenariats Startups",
    desc: "Accès exclusif à +500 startups deeptech, greentech et IA prêtes à collaborer.",
    highlight: "Injectez l’innovation directement dans vos équipes.",
  },
  {
    id: 'offres',
    icon: BriefcaseIcon,
    title: "Offres d’Emploi",
    desc: "Diffusez vos offres sur plusieurs canaux pour une visibilité maximale.",
    highlight: "Attirez les top 1 % des profils en moins de 48 h.",
  },
  {
    id: 'formation',
    icon: AcademicCapIcon,
    title: "Formations Internes & Externes",
    desc: "Publiez vos programmes et recevez des milliers de candidatures qualifiées d’étudiants et jeunes diplômés.",
    highlight: "Construisez dès aujourd’hui les leaders de demain.",
  },
  {
    id: 'evenement',
    icon: CalendarDaysIcon,
    title: "Événements & Afterworks",
    desc: "Salons privés, conférences, workshops, team buildings – tout en un clic.",
    highlight: "Devenez l’entreprise où tous les talents veulent être vus.",
  },
  {
    id: 'success-story',
    icon: TrophyIcon,
    title: "Success Stories Virales",
    desc: "Mettez en lumière vos recrutements gagnants, promotions et projets phares.",
    highlight: "Transformez chaque victoire en aimant à talents.",
  },
  {
    id: 'analyse',
    icon: ChartBarIcon,
    title: "Pilotage & Analytics",
    desc: "Visualisez vos données et analyses en graphiques : performances, canaux et suivi de vos actions.",
    highlight: "Suivez et optimisez vos recrutements comme un leader.",
  },
  {
    id: 'messagerie',
    icon: ChatBubbleLeftRightIcon,
    title: "Messagerie Intelligente",
    desc: "Envoyez facilement des messages ciblés à vos candidats et contacts, avec suivi multi-canal et relances efficaces.",
    highlight: "Communiquez et convertissez vos contacts rapidement.",
  },
];
  // Scroll sur hash au chargement (ex: lien direct #candidatures)
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && cardRefs.current[hash]) {
      setTimeout(() => {
        cardRefs.current[hash].scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardRefs.current[hash].classList.add('highlight-glow');
        setTimeout(() => cardRefs.current[hash].classList.remove('highlight-glow'), 4000);
      }, 400);
    }
  }, [location]);

  // Action du bouton "Découvrir la plateforme" → scroll vers les cartes
  const scrollToFeatures = () => {
    navigate('#accueil'); // change #accueil par une autre carte si tu veux
  };

  return (
    <>
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50 text-slate-900">
        <div className="fixed inset-0 -z-10 bg-white"></div>

        <Header />

        <main className="flex-1 pt-20 lg:pt-24 relative z-10 bg-white">

          {/* HERO */}
          <section className="px-6 lg:px-8 pt-10 pb-20 lg:pt-16 lg:pb-32">
            <div className="max-w-7xl mx-auto text-center">

              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-50 border border-blue-100 shadow-sm mb-8">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-blue-800 font-medium text-sm tracking-wide uppercase">Nouvelle Version 2.0</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] text-slate-900 tracking-tight">
                Recrutez l’excellence et
                <br className="hidden lg:block" />
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10 text-blue-600">propulsez vos talents</span>
                  <svg className="absolute -bottom-3 left-0 w-full h-4 text-blue-100 -z-10" viewBox="0 0 100 15" preserveAspectRatio="none">
                    <path d="M0 8 Q 50 15 100 8" stroke="currentColor" strokeWidth="12" fill="none" />
                  </svg>
                </span>
                <br />
                {/* ←←← VERS LE SUCCÈS ! EN PLUS PETIT */}
                <span className="block text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 mt-4">
                  vers le succès !
                </span>
              </h1>

              <div className="mt-10 space-y-6 text-lg md:text-xl lg:text-2xl text-slate-600 max-w-5xl mx-auto leading-relaxed font-medium">
                <p>
                  Faites de vos équipes de véritables <span className="text-blue-600 font-bold">moteurs de performance stratégique</span>.
                </p>
                <p className="text-slate-700">
                  Publiez vos offres d’emploi, stages, formations et événements, partagez vos succès,
                  recrutez les talents les plus brillants et explorez un univers d’innovation avec les startups les plus prometteuses.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Link
                  to="/connexion"
                  className="w-full sm:w-auto group px-8 py-4 rounded-xl font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/40 flex items-center justify-center gap-3"
                >
                  Commencer maintenant
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                {/* ←←← BOUTON QUI SCROLLE VERS LES CARTES */}
                <button
                  onClick={scrollToFeatures}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg text-slate-700 bg-slate-50 border border-slate-200 hover:border-blue-200 hover:text-blue-600 hover:bg-white transition-all shadow-sm hover:shadow-md"
                >
                  Découvrir la plateforme
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 9 CARTES */}
          <section className="px-6 lg:px-8 py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-5xl md:text-6xl font-black mb-6 text-slate-900">
                  <span className="text-blue-600">9 fonctionnalités. 1 seule plateforme.</span>
                </h2>
                <p className="text-2xl text-slate-500">Tout ce dont une grande entreprise a besoin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    id={feature.id}
                    ref={el => cardRefs.current[feature.id] = el}
                    className="group relative p-10 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-blue-900/5 overflow-hidden"
                  >
                    <div className="relative z-20">
                      <div className="w-20 h-20 rounded-2xl bg-blue-50 p-5 mb-8 shadow-sm ring-1 ring-blue-100 group-hover:bg-blue-600 group-hover:ring-blue-600 transition-all duration-500">
                        <feature.icon className="w-full h-full text-blue-600 group-hover:text-white transition-colors duration-500" />
                      </div>

                      <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>

                      <p className="text-base text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700">
                        {feature.desc}
                      </p>

                      <p className="text-lg font-semibold text-blue-500 italic">
                        {feature.highlight}
                      </p>

                      <Link
                        to="/connexion"
                        className="mt-8 inline-flex items-center gap-2 text-slate-400 font-semibold hover:text-blue-600 hover:gap-4 transition-all"
                      >
                        Découvrir
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <div className="relative z-10">
          <Footer />
        </div>

        {/* ANIMATIONS */}
        <style jsx>{`
          @keyframes highlight-glow {
            0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.5)}
            50%{box-shadow:0 0 60px 30px rgba(59,130,246,0)}
          }
          .highlight-glow {
            animation: highlight-glow 3s ease-out;
            border: 4px solid #3b82f6 !important;
          }
        `}</style>
      </div>
    </>
  );
}