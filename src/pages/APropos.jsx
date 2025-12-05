import React from 'react';
import Header from '../components/Header';

const APropos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-12 text-center tracking-tight drop-shadow-sm">
          À Propos de LYSPI
        </h1>

        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 lg:p-12 rounded-3xl shadow-2xl border border-gray-200 transform transition-all duration-500 hover:shadow-purple-300/40 hover:-translate-y-1">

          {/* ========================== INITIATIVE ========================== */}
          <section className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-5 flex items-center gap-2">
              <span className="text-purple-500 text-3xl">🚀</span> Une Initiative Innovante de KJS.Group
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
              LYSPI est une solution numérique conçue et développée par <strong>KJS.Group</strong> pour révolutionner l’accompagnement universitaire et professionnel en Guinée. Notre écosystème complet — <strong>LYSPI Université</strong>, <strong>LYSPI Entreprise</strong>, <strong>LYSPI App</strong> et <strong>LYSPI Mentorat</strong> — connecte étudiants, jeunes diplômés, institutions et entreprises autour d’outils modernes et intuitifs.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Nous avons pour objectif de rendre l’insertion professionnelle plus fluide, plus accessible et plus performante grâce à une technologie simple, rapide et adaptée aux besoins du terrain.
            </p>
          </section>

          {/* ========================== MISSION ========================== */}
          <section className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-5 flex items-center gap-2">
              <span className="text-purple-500 text-3xl">🎯</span> Notre Mission
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
              À travers ses différentes plateformes connectées, LYSPI accompagne les étudiants et les institutions tout au long de leur parcours, en facilitant l’accès aux opportunités et en renforçant le lien avec les entreprises.
            </p>

            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 space-y-4">
              <li><strong>LYSPI Université</strong> : suivi académique, gestion des étudiants et accompagnement professionnel.</li>
              <li><strong>LYSPI Entreprise</strong> : espace dédié aux employeurs pour publier des offres, gérer les candidatures et rencontrer des talents.</li>
              <li><strong>LYSPI App</strong> : application mobile intuitive permettant aux étudiants de consulter les offres, postuler et suivre leur évolution.</li>
              <li><strong>LYSPI Mentorat</strong> : mise en relation personnalisée entre mentors professionnels et étudiants motivés.</li>
            </ul>
          </section>

          {/* ========================== VISION ========================== */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-5 flex items-center gap-2">
              <span className="text-purple-500 text-3xl">🌍</span> Notre Vision
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
              LYSPI ambitionne de devenir l’écosystème numérique de référence en Guinée, reliant durablement le monde académique et le monde professionnel. Grâce à une plateforme évolutive, performante et accessible à tous, nous donnons aux talents la possibilité de s’exprimer, progresser et réussir.
            </p>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Avec KJS.Group, nous construisons un futur où chaque étudiant peut développer son potentiel, chaque entreprise peut recruter efficacement, et chaque institution peut suivre l’évolution de ses diplômés avec précision.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default APropos;