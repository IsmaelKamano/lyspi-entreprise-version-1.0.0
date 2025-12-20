import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '../config/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import _ from 'lodash';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import Header from '../components/Header';

// Register Chart.js components
Chart.register(...registerables, annotationPlugin);

const A_startup = () => {
  const [stats, setStats] = useState({});
  const [byDomain, setByDomain] = useState([]);
  const [byFaculte, setByFaculte] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [domains, setDomains] = useState([]);
  const [entreprise, setEntreprise] = useState({});
  const [filters, setFilters] = useState({
    domaine: 'all',
    partenaire: 'all', // New filter for partner status
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statsChartRef = useRef(null);
  const deptChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const domainChartRef = useRef(null);
  const faculteChartRef = useRef(null);
  const statsChartInstanceRef = useRef(null);
  const deptChartInstanceRef = useRef(null);
  const trendChartInstanceRef = useRef(null);
  const domainChartInstanceRef = useRef(null);
  const faculteChartInstanceRef = useRef(null);
  const entrepriseId = localStorage.getItem('entrepriseId');

  // Debounced fetch functions
  const fetchStats = _.debounce(async () => {
    if (!entrepriseId || isNaN(parseInt(entrepriseId))) {
      setError('ID d\'entreprise invalide ou manquant. Veuillez vous reconnecter.');
      setLoading(false);
      console.error('ID d\'entreprise invalide', { entrepriseId });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let response;
      if (filters.domaine === 'all') {
        response = await axios.get(`${API}/statis_startup/startup-stats-tout`, {
          params: { entrepriseId, partenaire: filters.partenaire },
        });
      } else {
        response = await axios.get(`${API}/statis_startup/startup-stats`, {
          params: {
            domaine: filters.domaine || undefined,
            entrepriseId,
            partenaire: filters.partenaire,
          },
        });
      }

      if (response.data.success) {
        setStats(response.data.data.stats);
        setByDomain(response.data.data.byDomain || []);
        setByFaculte(response.data.data.byFaculte || []);
        setEntreprise(response.data.data.entreprise);
      } else {
        setError('Échec de la récupération des statistiques');
        console.error('Échec de la récupération des statistiques', { errors: response.data.errors });
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur lors de la récupération des statistiques', { error: err.message, response: err.response?.data });
    } finally {
      setLoading(false);
    }
  }, 500);

  const fetchStudentData = _.debounce(async () => {
    if (!entrepriseId || isNaN(parseInt(entrepriseId))) {
      setError('ID d\'entreprise invalide ou manquant. Veuillez vous reconnecter.');
      console.error('ID d\'entreprise invalide', { entrepriseId });
      return;
    }

    try {
      let response;
      response = await axios.get(`${API}/statis_startup/student-data`, {
        params: {
          domaine: filters.domaine === 'all' ? undefined : filters.domaine,
          entrepriseId,
          partenaire: filters.partenaire,
        },
      });

      if (response.data.success) {
        setStudentData(response.data.data.students);
        setEntreprise(response.data.data.entreprise);
      } else {
        setError('Échec de la récupération des données des étudiants');
        console.error('Échec de la récupération des données des étudiants', { errors: response.data.errors });
      }
    } catch (err) {
      setError('Erreur lors de la récupération des données des étudiants');
      console.error('Erreur lors de la récupération des données des étudiants', { error: err.message, response: err.response?.data });
    }
  }, 500);

  const fetchDomains = async () => {
    try {
      console.log('Récupération des données des domaines');
      const response = await axios.get(`${API}/statis_startup/startup-domains`, {
        params: { entrepriseId },
      });
      if (response.data.success) {
        const domains = response.data.data;
        setDomains(domains);
        if (domains.length > 0 && !filters.domaine) {
          setFilters((prev) => ({ ...prev, domaine: domains[0].id.toString() }));
        }
        console.log('Domaines récupérés', { count: domains.length });
      }
    } catch (err) {
      setError('Erreur lors de la récupération des domaines');
      console.error('Erreur lors de la récupération des domaines', { error: err.message, response: err.response?.data });
    }
  };

  const fetchStartups = async () => {
    try {
      console.log('Récupération des données des startups', { domaine: filters.domaine, partenaire: filters.partenaire });
      const response = await axios.get(`${API}/statis_startup/startups`, {
        params: { entrepriseId, domaine: filters.domaine || undefined, partenaire: filters.partenaire },
      });
      if (response.data.success) {
        console.log('Startups récupérées', { count: response.data.data.length });
      }
    } catch (err) {
 
      console.error('Erreur lors de la récupération des startups', { error: err.message, response: err.response?.data });
    }
  };

  // Fetch data on mount and filter change
  useEffect(() => {
    if (!entrepriseId || isNaN(parseInt(entrepriseId))) {
      setError('ID d\'entreprise invalide ou manquant. Veuillez vous reconnecter.');
      setLoading(false);
      console.error('ID d\'entreprise invalide lors du montage', { entrepriseId });
      return;
    }
    console.log('Démarrage de la récupération initiale des données', { filters, entrepriseId });
    fetchDomains();
    fetchStartups();
    fetchStats();
    fetchStudentData();

    return () => {
      console.log('Nettoyage des fonctions de récupération');
      fetchStats.cancel();
      fetchStudentData.cancel();
    };
  }, [filters, entrepriseId]);

  // Stats Pie Chart
  useEffect(() => {
    if (!loading && statsChartRef.current && !error) {
      if (statsChartInstanceRef.current) {
        statsChartInstanceRef.current.destroy();
      }

      try {
        const ctx = statsChartRef.current.getContext('2d');
        statsChartInstanceRef.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Total Startups', 'Startups en partenariat'],
            datasets: [{
              label: 'Statistiques',
              data: [
                stats.total_startups || 0,
                stats.partnered_startups || 0,
              ],
              backgroundColor: ['#3b82f6', '#10b981'],
              borderColor: ['#2563eb', '#059669'],
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { font: { size: 14 } } },
              title: { display: true, text: `Statistiques des startups (Entreprise: ${entreprise.nom_entreprise || 'N/A'})`, font: { size: 16 } },
              tooltip: { enabled: true, bodyFont: { size: 14 } },
            },
          },
        });
      } catch (err) {
        console.error('Erreur lors du rendu du graphique en secteurs', { error: err.message });
        setError('Échec du rendu du graphique des statistiques');
      }
    }

    return () => {
      if (statsChartInstanceRef.current) {
        statsChartInstanceRef.current.destroy();
      }
    };
  }, [stats, loading, error, entreprise]);

  // Department Distribution Bar Chart
  useEffect(() => {
    if (!loading && deptChartRef.current && studentData.length > 0 && !error) {
      if (deptChartInstanceRef.current) {
        deptChartInstanceRef.current.destroy();
      }

      try {
        const deptCounts = studentData.reduce((acc, row) => {
          const deptName = row.departement_nom || 'Inconnu';
          acc[deptName] = (acc[deptName] || 0) + 1;
          return acc;
        }, {});
        const labels = Object.keys(deptCounts);
        const data = Object.values(deptCounts);

        const ctx = deptChartRef.current.getContext('2d');
        deptChartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Fondateurs par département',
              data,
              backgroundColor: '#3b82f6',
              borderColor: '#2563eb',
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Nombre', font: { size: 14 } } },
              x: { title: { display: true, text: 'Département', font: { size: 14 } } },
            },
            plugins: {
              legend: { labels: { font: { size: 14 } } },
              tooltip: { bodyFont: { size: 14 } },
            },
          },
        });
      } catch (err) {
        console.error('Erreur lors du rendu du graphique à barres des départements', { error: err.message });
        setError('Échec du rendu du graphique des départements');
      }
    }

    return () => {
      if (deptChartInstanceRef.current) {
        deptChartInstanceRef.current.destroy();
      }
    };
  }, [studentData, loading, error]);

  // Startup Creation Trend Line Chart (Improved)
  useEffect(() => {
    if (!loading && trendChartRef.current && studentData.length > 0 && !error) {
      if (trendChartInstanceRef.current) {
        trendChartInstanceRef.current.destroy();
      }

      try {
        // Aggregate by year for better readability
        const trendsPartnered = studentData.reduce((acc, row) => {
          if (row.est_partenaire === 'Oui') {
            const year = row.date_creation ? new Date(row.date_creation).getFullYear() : 'Inconnu';
            acc[year] = (acc[year] || 0) + 1;
          }
          return acc;
        }, {});
        const trendsNonPartnered = studentData.reduce((acc, row) => {
          if (row.est_partenaire === 'Non') {
            const year = row.date_creation ? new Date(row.date_creation).getFullYear() : 'Inconnu';
            acc[year] = (acc[year] || 0) + 1;
          }
          return acc;
        }, {});
        const labels = [...new Set([...Object.keys(trendsPartnered), ...Object.keys(trendsNonPartnered)])].sort();
        const dataPartnered = labels.map(label => trendsPartnered[label] || 0);
        const dataNonPartnered = labels.map(label => trendsNonPartnered[label] || 0);

        const maxValuePartnered = Math.max(...dataPartnered);
        const maxIndexPartnered = dataPartnered.indexOf(maxValuePartnered);
        const maxValueNonPartnered = Math.max(...dataNonPartnered);
        const maxIndexNonPartnered = dataNonPartnered.indexOf(maxValueNonPartnered);

        const ctx = trendChartRef.current.getContext('2d');
        trendChartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Startups en partenariat',
                data: dataPartnered,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: true,
                tension: 0.3,
              },
              {
                label: 'Startups non en partenariat',
                data: dataNonPartnered,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                fill: true,
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { font: { size: 14 } } },
              tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                bodyFont: { size: 14 },
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
                },
              },
              annotation: {
                annotations: [
                  ...(maxValuePartnered > 0 ? [{
                    type: 'label',
                    xValue: maxIndexPartnered,
                    yValue: maxValuePartnered,
                    content: `Pic Partenaire: ${maxValuePartnered}`,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    color: '#fff',
                    padding: 8,
                    borderRadius: 4,
                    font: { size: 12 },
                  }] : []),
                  ...(maxValueNonPartnered > 0 ? [{
                    type: 'label',
                    xValue: maxIndexNonPartnered,
                    yValue: maxValueNonPartnered,
                    content: `Pic Non-Partenaire: ${maxValueNonPartnered}`,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    color: '#fff',
                    padding: 8,
                    borderRadius: 4,
                    font: { size: 12 },
                  }] : []),
                ],
              },
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Nombre de Startups', font: { size: 14 } } },
              x: { title: { display: true, text: 'Année', font: { size: 14 } } },
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false,
            },
          },
        });
      } catch (err) {
        console.error('Erreur lors du rendu du graphique linéaire des tendances', { error: err.message });
        setError('Échec du rendu du graphique des tendances');
      }
    }

    return () => {
      if (trendChartInstanceRef.current) {
        trendChartInstanceRef.current.destroy();
      }
    };
  }, [studentData, loading, error]);

  // Domain Distribution Bar Chart
  useEffect(() => {
    if (!loading && domainChartRef.current && byDomain.length > 0 && !error) {
      if (domainChartInstanceRef.current) {
        domainChartInstanceRef.current.destroy();
      }

      try {
        const labels = byDomain.map(row => row.domaine_nom || 'Inconnu');
        const data = byDomain.map(row => row.total_startups || 0);

        const ctx = domainChartRef.current.getContext('2d');
        domainChartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Startups par domaine',
              data,
              backgroundColor: '#ec4899',
              borderColor: '#db2777',
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Nombre', font: { size: 14 } } },
              x: { title: { display: true, text: 'Domaine', font: { size: 14 } } },
            },
            plugins: {
              legend: { labels: { font: { size: 14 } } },
              tooltip: { bodyFont: { size: 14 } },
            },
          },
        });
      } catch (err) {
        console.error('Erreur lors du rendu du graphique à barres des domaines', { error: err.message });
        setError('Échec du rendu du graphique des domaines');
      }
    }

    return () => {
      if (domainChartInstanceRef.current) {
        domainChartInstanceRef.current.destroy();
      }
    };
  }, [byDomain, loading, error]);

  // Faculte Distribution Bar Chart
  useEffect(() => {
    if (!loading && faculteChartRef.current && byFaculte.length > 0 && !error) {
      if (faculteChartInstanceRef.current) {
        faculteChartInstanceRef.current.destroy();
      }

      try {
        const labels = byFaculte.map(row => row.faculte_nom || 'Inconnu');
        const data = byFaculte.map(row => row.total_startups || 0);

        const ctx = faculteChartRef.current.getContext('2d');
        faculteChartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Startups par faculté',
              data,
              backgroundColor: '#f97316',
              borderColor: '#ea580c',
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Nombre', font: { size: 14 } } },
              x: { title: { display: true, text: 'Faculté', font: { size: 14 } } },
            },
            plugins: {
              legend: { labels: { font: { size: 14 } } },
              tooltip: { bodyFont: { size: 14 } },
            },
          },
        });
      } catch (err) {
        console.error('Erreur lors du rendu du graphique à barres des facultés', { error: err.message });
        setError('Échec du rendu du graphique des facultés');
      }
    }

    return () => {
      if (faculteChartInstanceRef.current) {
        faculteChartInstanceRef.current.destroy();
      }
    };
  }, [byFaculte, loading, error]);

  // Export to PDF
  const exportToPDF = () => {
    console.log('Exportation en PDF', { filters, entrepriseId, entreprise });
    const doc = new jsPDF({ orientation: 'landscape' });

    if (entreprise.logo) {
      try {
        doc.addImage(entreprise.logo, 'PNG', 14, 10, 30, 30);
      } catch (err) {
        console.error('Erreur lors de l\'ajout du logo au PDF', { error: err.message });
      }
    }

    doc.setFontSize(18);
    doc.text(`Rapport d'analyse des startups (${entreprise.nom_entreprise || 'Entreprise inconnue'})`, 50, 20);
    doc.setFontSize(12);
    doc.text(`Sigle: ${entreprise.sigle || 'N/A'} | Email: ${entreprise.mail || 'N/A'} | Tél: ${entreprise.tel || 'N/A'}`, 50, 30);
    doc.text(`Site Web: ${entreprise.site_web || 'N/A'} | Domaine: ${entreprise.domaine_intervention || 'N/A'}`, 50, 38);
    doc.text(`Filtre: Domaine - ${filters.domaine === 'all' ? 'Tous les domaines' : domains.find(d => d.id === parseInt(filters.domaine))?.nom || 'N/A'} | Partenaire - ${filters.partenaire === 'all' ? 'Tous' : filters.partenaire === 'oui' ? 'Partenaires' : 'Non Partenaires'}`, 50, 46);

    autoTable(doc, {
      startY: 54,
      head: [['Domaine', 'Total Startups', 'Startups en partenariat']],
      body: [[
        filters.domaine ? domains.find(d => d.id === parseInt(filters.domaine))?.nom || 'N/A' : 'Tous',
        stats.total_startups || 0,
        stats.partnered_startups || 0,
      ]],
      theme: 'striped',
      styles: { fontSize: 10, lineHeight: 1.6 },
      headStyles: { fillColor: '#3b82f6' },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Nom', 'Prénom', 'Matricule', 'Sexe', 'Date de naissance', 'Nationalité', 'Situation matrimoniale', 'Licence', 'Département', 'Faculté', 'Commune', 'Quartier', 'Startup', 'Date de création', 'Téléphone', 'Email', 'Partenaire']],
      body: studentData.map(row => [
        row.etudiant_nom || 'N/A',
        row.prenom || 'N/A',
        row.matricule || 'N/A',
        row.sexe || 'N/A',
        row.date_naissance ? new Date(row.date_naissance).toLocaleDateString() : 'N/A',
        row.lieu_naissance || 'N/A',
        row.situation_matrimoniale || 'N/A',
        row.licence_nom || 'N/A',
        row.departement_nom || 'N/A',
        row.faculte_nom || 'N/A',
        row.commune || 'N/A',
        row.quartier || 'N/A',
        row.startup_nom || 'N/A',
        row.date_creation ? new Date(row.date_creation).toLocaleDateString() : 'N/A',
        row.contact_tel || 'N/A',
        row.contact_email || 'N/A',
        row.est_partenaire || 'N/A',
      ]),
      theme: 'striped',
      styles: { fontSize: 8, lineHeight: 1.6 },
      headStyles: { fillColor: '#3b82f6' },
    });

    doc.save(`rapport-analyse-startups-ent-${entreprise.nom_entreprise || 'inconnu'}.pdf`);
    console.log('PDF exporté avec succès');
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Nom', 'Prénom', 'Matricule', 'Sexe', 'Date de naissance', 'Nationalité',
      'Situation matrimoniale', 'Licence', 'Département', 'Faculté', 'Commune',
      'Quartier', 'Startup', 'Date de création', 'Téléphone', 'Email', 'Partenaire'
    ];

    const rows = studentData.map(row => [
      row.etudiant_nom || 'N/A',
      row.prenom || 'N/A',
      row.matricule || 'N/A',
      row.sexe || 'N/A',
      row.date_naissance ? new Date(row.date_naissance).toLocaleDateString() : 'N/A',
      row.lieu_naissance || 'N/A',
      row.situation_matrimoniale || 'N/A',
      row.licence_nom || 'N/A',
      row.departement_nom || 'N/A',
      row.faculte_nom || 'N/A',
      row.commune || 'N/A',
      row.quartier || 'N/A',
      row.startup_nom || 'N/A',
      row.date_creation ? new Date(row.date_creation).toLocaleDateString() : 'N/A',
      row.contact_tel || 'N/A',
      row.contact_email || 'N/A',
      row.est_partenaire || 'N/A'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.map(field => `"${(field + '').replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rapport-analyse-startups-ent-${entreprise.nom_entreprise || 'inconnu'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (key, value) => {
    console.log('Filtre modifié', { key, value });
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
      <div className="max-w-7xl mx-auto flex-1 space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          Tableau de bord des startups ({entreprise.nom_entreprise || 'N/A'})
        </h1>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 mb-8">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Domaine</label>
            <select
              value={filters.domaine}
              onChange={e => handleFilterChange('domaine', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm"
            >
              <option value="all">Tous les domaines</option>
              {domains.length === 0 && <option value="">Chargement...</option>}
              {domains.map(domain => (
                <option key={domain.id} value={domain.id}>{domain.nom}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Statut Partenaire</label>
            <select
              value={filters.partenaire}
              onChange={e => handleFilterChange('partenaire', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm"
            >
              <option value="all">Tous</option>
              <option value="oui">Partenaires</option>
              <option value="non">Non Partenaires</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center text-gray-600 text-lg font-medium animate-pulse">Chargement...</div>}
        {error && (
          <div className="text-center text-red-600 mb-6 flex items-center justify-center space-x-4">
            <span className="text-lg">{error}</span>
            <button
              onClick={() => {
                console.log('Nouvelle tentative de récupération des données');
                setError(null);
                setLoading(true);
                fetchDomains();
                fetchStartups();
                fetchStats();
                fetchStudentData();
              }}
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white shadow-2xl rounded-2xl p-6 transform hover:-translate-y-1 transition duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Statistiques des startups</h2>
                <p className="text-lg text-gray-600"><span className="font-semibold">Total Startups :</span> {stats.total_startups || 0}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Startups en partenariat :</span> {stats.partnered_startups || 0}</p>
              </div>

              <div className="bg-white shadow-2xl rounded-2xl p-6 transform hover:-translate-y-1 transition duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Statistiques des startups</h2>
                <div className="w-full h-80">
                  <canvas ref={statsChartRef} />
                </div>
              </div>

              <div className="bg-white shadow-2xl rounded-2xl p-6 transform hover:-translate-y-1 transition duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Fondateurs par département</h2>
                <div className="w-full h-80">
                  <canvas ref={deptChartRef} />
                </div>
              </div>

              <div className="bg-white shadow-2xl rounded-2xl p-6 transform hover:-translate-y-1 transition duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Tendances de création des startups</h2>
                <div className="w-full h-80">
                  <canvas ref={trendChartRef} />
                </div>
              </div>

              <div className="bg-white shadow-2xl rounded-2xl p-6 transform hover:-translate-y-1 transition duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Startups par domaine</h2>
                <div className="w-full h-80">
                  <canvas ref={domainChartRef} />
                </div>
              </div>

              <div className="bg-white shadow-2xl rounded-2xl p-6 transform hover:-translate-y-1 transition duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Startups par faculté</h2>
                <div className="w-full h-80">
                  <canvas ref={faculteChartRef} />
                </div>
              </div>
            </div>

            <div className="text-center mb-8 space-x-4">
              <button
                onClick={exportToPDF}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 transform hover:-translate-y-1 disabled:opacity-50"
                disabled={loading || error}
              >
                Exporter en PDF
              </button>
              <button
                onClick={exportToCSV}
                className="bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-yellow-600 transition duration-200 transform hover:-translate-y-1 disabled:opacity-50"
                disabled={loading || error}
              >
                Exporter en CSV
              </button>
            </div>

            <div className="bg-white shadow-2xl rounded-2xl p-6 overflow-x-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Fondateurs des startups</h2>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 font-semibold">Nom</th>
                    <th className="p-3 font-semibold">Prénom</th>
                    <th className="p-3 font-semibold">Matricule</th>
                    <th className="p-3 font-semibold">Sexe</th>
                    <th className="p-3 font-semibold">Date de naissance</th>
                    <th className="p-3 font-semibold">Licence</th>
                    <th className="p-3 font-semibold">Département</th>
                    <th className="p-3 font-semibold">Faculté</th>
                    <th className="p-3 font-semibold">Commune</th>
                    <th className="p-3 font-semibold">Quartier</th>
                    <th className="p-3 font-semibold">Startup</th>
                    <th className="p-3 font-semibold">Date de création</th>
                    <th className="p-3 font-semibold">Téléphone</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Fichier</th>
                    <th className="p-3 font-semibold">Partenaire</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition duration-150">
                      <td className="p-3">{row.etudiant_nom || 'N/A'}</td>
                      <td className="p-3">{row.prenom || 'N/A'}</td>
                      <td className="p-3">{row.matricule || 'N/A'}</td>
                      <td className="p-3">{row.sexe || 'N/A'}</td>
                      <td className="p-3">{row.date_naissance ? new Date(row.date_naissance).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3">{row.licence_nom || 'N/A'}</td>
                      <td className="p-3">{row.departement_nom || 'N/A'}</td>
                      <td className="p-3">{row.faculte_nom || 'N/A'}</td>
                      <td className="p-3">{row.commune || 'N/A'}</td>
                      <td className="p-3">{row.quartier || 'N/A'}</td>
                      <td className="p-3">{row.startup_nom || 'N/A'}</td>
                      <td className="p-3">{row.date_creation ? new Date(row.date_creation).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3">{row.contact_tel || 'N/A'}</td>
                      <td className="p-3">{row.contact_email || 'N/A'}</td>
                      <td className="p-3">
                        {row.fichier ? (
                          <a href={row.fichier} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Fichier</a>
                        ) : 'N/A'}
                      </td>
                      <td className="p-3">{row.est_partenaire || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div> 
      </div>
    </div>
  );
};

export default A_startup;