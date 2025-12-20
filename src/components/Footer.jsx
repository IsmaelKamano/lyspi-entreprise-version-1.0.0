import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-10 sm:py-14 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ==== SECTIONS GRID ==== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mt-8">

          {/* ==== DESCRIPTION LYSPI ==== */}
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center drop-shadow-lg">
              <span className="mr-2 text-3xl">📌</span> LYSPI
            </h3>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              LYSPI est une plateforme numérique nationale développée par KJS.Group, dédiée à
              l'accompagnement professionnel des étudiants, jeunes diplômés et talents à travers la Guinée.
              Accédez à des offres d'emploi, stages, formations, événements, success stories et au réseau des startups.
            </p>
          </div>

          {/* ==== LIENS UTILES ==== */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white tracking-wide">
              Liens Utiles
            </h3>
            <ul className="space-y-3 text-sm sm:text-base">
              {[
                { to: "/accueil-entreprise", label: "Accueil" },
                { to: "/profil", label: "Profil" },
                { to: "/candidature", label: "Candidatures" },
                { to: "/publier/offre", label: "Offres d’emploi" },
                { to: "/publier/formation", label: "Formations" },
                { to: "/publier/evenement", label: "Événements" },
                { to: "/startup", label: "Startups" },
                { to: "/publier/success-story", label: "Success Stories" }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.to}
                    className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-300 ease-in-out inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ==== OBJECTIFS ==== */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center tracking-wide">
              <span className="mr-2 text-2xl">🎯</span> Objectifs
            </h3>
            <ul className="space-y-3 text-sm sm:text-base text-white/85">
              <li>Centraliser toutes les opportunités professionnelles en Guinée</li>
              <li>Connecter talents, étudiants et entreprises sur un espace unique</li>
              <li>Valoriser les projets innovants et initiatives des startups</li>
              <li>Simplifier la gestion des candidatures et recrutements</li>
              <li>Faciliter les échanges via une messagerie intégrée</li>
              <li>Promouvoir les réussites grâce aux success stories</li>
            </ul>
          </div>

          {/* ==== CONTACT ==== */}
          <div>
            <h3 className="text-xl font-semibold mb-4 tracking-wide">
              Contact
            </h3>
            <ul className="space-y-3 text-sm sm:text-base text-white/85">
              <li>
                Email :{" "}
                <a
                  href="mailto:kjs.group2025@gmail.com"
                  className="hover:text-white transition duration-300"
                >
                  kjs.group2025@gmail.com
                </a>
              </li>
              <li>
                Téléphone :{" "}
                <a
                  href="tel:+224612374585"
                  className="hover:text-white transition duration-300"
                >
                  +224 612 37 45 85
                </a>
              </li>
              <li>
                Adresse : Nongo Carrefour Conteyah, Commune de Ratoma
              </li>
            </ul>
          </div>

        </div>

        {/* ==== COPYRIGHT ==== */}
          <div className="mt-10 border-t border-blue-700/50 pt-4 text-center">
          <p className="text-white/70 text-xs sm:text-sm tracking-wider">
            © 2025 KJS.GROUP – Tous droits réservés.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
