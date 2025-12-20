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

const A_formation = () => {
  const [stats, setStats] = useState({});
  const [byFaculte, setByFaculte] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [formations, setFormations] = useState([]);
  const [entreprise, setEntreprise] = useState({});
  const [filters, setFilters] = useState({
    formationTitre: '',
    dateDebutStart: '',
    dateDebutEnd: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statsChartRef = useRef(null);
  const deptChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const faculteChartRef = useRef(null);

  const statsChartInstanceRef = useRef(null);
  const deptChartInstanceRef = useRef(null);
  const trendChartInstanceRef = useRef(null);
  const faculteChartInstanceRef = useRef(null);
  const entrepriseId = localStorage.getItem('entrepriseId');

  // Clean query parameters to avoid sending empty or undefined values
  const cleanParams = (params) => {
    const cleaned = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

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
      const params = cleanParams({ entrepriseId, ...filters });
      console.log('Envoi de la requête fetchStats avec paramètres', params);
      const response = await axios.get(`${API}/stati_formation/formation-stats`, { params });

      if (response.data.success) {
        setStats(response.data.data.stats);
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
      const params = cleanParams({ entrepriseId, ...filters });
      console.log('Envoi de la requête fetchStudentData avec paramètres', params);
      const response = await axios.get(`${API}/stati_formation/student-data`, { params });

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

  const fetchFormations = async () => {
    if (!entrepriseId || isNaN(parseInt(entrepriseId))) {
      setError('ID d\'entreprise invalide ou manquant. Veuillez vous reconnecter.');
      console.error('ID d\'entreprise invalide', { entrepriseId });
      return;
    }

    try {
      const params = cleanParams({ entrepriseId });
      console.log('Envoi de la requête fetchFormations avec paramètres', params);
      const response = await axios.get(`${API}/stati_formation/formations`, { params });
      if (response.data.success) {
        setFormations(response.data.data);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des formations');
      console.error('Erreur lors de la récupération des formations', { error: err.message, response: err.response?.data });
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
    fetchFormations();
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
            labels: ['Total Formations', 'Total Participants'],
            datasets: [{
              label: 'Statistiques',
              data: [
                stats.total_formations || 0,
                stats.total_participants || 0,
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
              legend: { position: 'top' },
              title: { display: true, text: `Statistiques des formations (Entreprise: ${entreprise.nom_entreprise || 'N/A'})` },
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
              label: 'Participants par département',
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
              y: { beginAtZero: true, title: { display: true, text: 'Nombre' } },
              x: { title: { display: true, text: 'Département' } },
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

  // Participation Trend Line Chart
  useEffect(() => {
    if (!loading && trendChartRef.current && studentData.length > 0 && !error) {
      if (trendChartInstanceRef.current) {
        trendChartInstanceRef.current.destroy();
      }

      try {
        const trends = studentData.reduce((acc, row) => {
          const date = row.date_participation ? new Date(row.date_participation).toISOString().slice(0, 7) : 'Inconnu';
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        const labels = Object.keys(trends).sort();
        const data = labels.map(label => trends[label]);

        const maxValue = Math.max(...data);
        const maxIndex = data.indexOf(maxValue);

        const ctx = trendChartRef.current.getContext('2d');
        trendChartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Participations au fil du temps',
              data,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              fill: false,
              tension: 0.1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              annotation: {
                annotations: maxValue > 0 ? [{
                  type: 'label',
                  xValue: maxIndex,
                  yValue: maxValue,
                  content: `Pic: ${maxValue}`,
                  backgroundColor: 'rgba(16, 185, 129, 0.8)',
                  color: '#fff',
                  padding: 6,
                  borderRadius: 4,
                }] : [],
              },
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Participants' } },
              x: { title: { display: true, text: 'Mois' } },
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

  // Faculte Distribution Bar Chart
  useEffect(() => {
    if (!loading && faculteChartRef.current && byFaculte.length > 0 && !error) {
      if (faculteChartInstanceRef.current) {
        faculteChartInstanceRef.current.destroy();
      }

      try {
        const labels = byFaculte.map(row => row.faculte_nom || 'Inconnu');
        const data = byFaculte.map(row => row.total_participants || 0);

        const ctx = faculteChartRef.current.getContext('2d');
        faculteChartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Participants par faculté',
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
              y: { beginAtZero: true, title: { display: true, text: 'Nombre' } },
              x: { title: { display: true, text: 'Faculté' } },
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
    doc.text(`Rapport d'analyse des formations (${entreprise.nom_entreprise || 'Entreprise inconnue'})`, 50, 20);
    doc.setFontSize(12);
    doc.text(`Sigle: ${entreprise.sigle || 'N/A'} | Email: ${entreprise.mail || 'N/A'} | Tél: ${entreprise.tel || 'N/A'}`, 50, 30);
    doc.text(`Site Web: ${entreprise.site_web || 'N/A'} | Domaine: ${entreprise.domaine_intervention || 'N/A'}`, 50, 38);
    doc.text(`Filtre: Formation - ${filters.formationTitre || 'Toutes les formations'} | Date début: ${filters.dateDebutStart || 'N/A'} à ${filters.dateDebutEnd || 'N/A'}`, 50, 46);

    // Stats Table
    autoTable(doc, {
      startY: 54,
      head: [['Formation', 'Total Formations', 'Total Participants']],
      body: [[
        filters.formationTitre || 'Toutes les formations',
        stats.total_formations || 0,
        stats.total_participants || 0,
      ]],
      theme: 'striped',
      styles: { fontSize: 10, lineHeight: 1.6 },
      headStyles: { fillColor: '#3b82f6' },
    });

    // Student Data Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Nom', 'Prénom', 'Matricule', 'Sexe', 'Date de naissance', 'Nationalité', 'Situation matrimoniale', 'Licence', 'Département', 'Faculté', 'Commune', 'Quartier', 'Formation', 'Date de début', 'Date de fin', 'Date de participation', 'Téléphone', 'Email']],
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
        row.formation_titre || 'N/A',
        row.date_debut ? new Date(row.date_debut).toLocaleDateString() : 'N/A',
        row.date_fin ? new Date(row.date_fin).toLocaleDateString() : 'N/A',
        row.date_participation ? new Date(row.date_participation).toLocaleDateString() : 'N/A',
        row.contact_tel || 'N/A',
        row.contact_email || 'N/A',
      ]),
      theme: 'striped',
      styles: { fontSize: 8, lineHeight: 1.6 },
      headStyles: { fillColor: '#3b82f6' },
    });

    doc.save(`rapport-analyse-formations-ent-${entreprise.nom_entreprise || 'inconnu'}.pdf`);
    console.log('PDF exporté avec succès');
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Nom', 'Prénom', 'Matricule', 'Sexe', 'Date de naissance', 'Nationalité',
      'Situation matrimoniale', 'Licence', 'Département', 'Faculté', 'Commune',
      'Quartier', 'Formation', 'Date de début', 'Date de fin', 'Date de participation',
      'Téléphone', 'Email', 'Fichier'
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
      row.formation_titre || 'N/A',
      row.date_debut ? new Date(row.date_debut).toLocaleDateString() : 'N/A',
      row.date_fin ? new Date(row.date_fin).toLocaleDateString() : 'N/A',
      row.date_participation ? new Date(row.date_participation).toLocaleDateString() : 'N/A',
      row.contact_tel || 'N/A',
      row.contact_email || 'N/A',
      row.fichier ? `Fichier: ${row.fichier}` : 'N/A'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.map(field => `"${(field + '').replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rapport-analyse-formations-ent-${entreprise.nom_entreprise || 'inconnu'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (key, value) => {
    console.log('Filtre modifié', { key, value });
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Calculate participation rate
  const participationRate = stats.total_formations > 0 ? ((stats.total_participants || 0) / stats.total_formations).toFixed(2) : 0;

  return (
   <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Tableau de bord d'analyse des formations ({entreprise.nom_entreprise || 'N/A'})
        </h1>

        {/* Filtres */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Titre de la formation</label>
            <select
              value={filters.formationTitre}
              onChange={e => handleFilterChange('formationTitre', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            >
              <option value="">Toutes les formations</option>
              {formations.map(form => (
                <option key={form.id} value={form.titre}>{form.titre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Date de début (Début)</label>
            <input
              type="date"
              value={filters.dateDebutStart}
              onChange={e => handleFilterChange('dateDebutStart', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Date de début (Fin)</label>
            <input
              type="date"
              value={filters.dateDebutEnd}
              onChange={e => handleFilterChange('dateDebutEnd', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
          </div>
        </div>

        {loading && <div className="text-center text-gray-600 text-lg">Chargement...</div>}
        {error && (
          <div className="text-center text-red-600 mb-6">
            {error}
            <button
              onClick={() => {
                console.log('Nouvelle tentative de récupération des données');
                setError(null);
                setLoading(true);
                fetchFormations();
                fetchStats();
                fetchStudentData();
              }}
              className="ml-4 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques des formations</h2>
                <p className="text-lg text-gray-600"><span className="font-semibold">Total Formations :</span> {stats.total_formations || 0}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Total Participants :</span> {stats.total_participants || 0}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Participants par formation :</span> {participationRate}</p>
              </div>

              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Statistiques des formations</h2>
                <div className="w-full h-80">
                  <canvas ref={statsChartRef} />
                </div>
              </div>

              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Participants par département</h2>
                <div className="w-full h-80">
                  <canvas ref={deptChartRef} />
                </div>
              </div>

              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Tendances de participation</h2>
                <div className="w-full h-80">
                  <canvas ref={trendChartRef} />
                </div>
              </div>

              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Participants par faculté</h2>
                <div className="w-full h-80">
                  <canvas ref={faculteChartRef} />
                </div>
              </div>
            </div>

            <div className="text-center mb-8 space-x-4">
              <button
                onClick={exportToPDF}
                className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-105 disabled:opacity-50"
                disabled={loading || error}
              >
                Exporter en PDF
              </button>
              <button
                onClick={exportToCSV}
                className="bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-yellow-600 transition duration-200 transform hover:scale-105 disabled:opacity-50"
                disabled={loading || error}
              >
                Exporter en CSV
              </button>
            </div>

            <div className="bg-white shadow-xl rounded-xl p-6 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Participants aux formations</h2>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="p-3 font-semibold">Nom</th>
                    <th className="p-3 font-semibold">Prénom</th>
                    <th className="p-3 font-semibold">Matricule</th>
                    <th className="p-3 font-semibold">Sexe</th>
                    <th className="p-3 font-semibold">Date de naissance</th>
                    <th className="p-3 font-semibold">Nationalité</th>
                    <th className="p-3 font-semibold">Situation matrimoniale</th>
                    <th className="p-3 font-semibold">Licence</th>
                    <th className="p-3 font-semibold">Département</th>
                    <th className="p-3 font-semibold">Faculté</th>
                    <th className="p-3 font-semibold">Commune</th>
                    <th className="p-3 font-semibold">Quartier</th>
                    <th className="p-3 font-semibold">Formation</th>
                    <th className="p-3 font-semibold">Date de début</th>
                    <th className="p-3 font-semibold">Date de fin</th>
                    <th className="p-3 font-semibold">Date de participation</th>
                    <th className="p-3 font-semibold">Téléphone</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Fichier</th>
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
                      <td className="p-3">{row.lieu_naissance || 'N/A'}</td>
                      <td className="p-3">{row.situation_matrimoniale || 'N/A'}</td>
                      <td className="p-3">{row.licence_nom || 'N/A'}</td>
                      <td className="p-3">{row.departement_nom || 'N/A'}</td>
                      <td className="p-3">{row.faculte_nom || 'N/A'}</td>
                      <td className="p-3">{row.commune || 'N/A'}</td>
                      <td className="p-3">{row.quartier || 'N/A'}</td>
                      <td className="p-3">{row.formation_titre || 'N/A'}</td>
                      <td className="p-3">{row.date_debut ? new Date(row.date_debut).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3">{row.date_fin ? new Date(row.date_fin).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3">{row.date_participation ? new Date(row.date_participation).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3">{row.contact_tel || 'N/A'}</td>
                      <td className="p-3">{row.contact_email || 'N/A'}</td>
                      <td className="p-3">
                        {row.fichier ? (
                          <a href={row.fichier} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Fichier</a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default A_formation;