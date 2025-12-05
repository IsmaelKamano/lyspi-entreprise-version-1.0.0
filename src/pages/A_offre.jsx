import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from '../components/Header';
import _ from 'lodash';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Enregistrer les composants nécessaires pour Chart.js
Chart.register(...registerables, annotationPlugin);

const A_offre = () => {
  const [stats, setStats] = useState({});
  const [byTypeOffre, setByTypeOffre] = useState([]);
  const [byFaculte, setByFaculte] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [offres, setOffres] = useState([]);
  const [typeOffres, setTypeOffres] = useState([]);
  const [entreprise, setEntreprise] = useState({});
  const [filters, setFilters] = useState({
    poste: 'Tous',
    typeOffre: 'all',
    statut: 'Tous', // Added statut filter
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statsChartRef = useRef(null);
  const deptChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const genderChartRef = useRef(null);
  const typeOffreChartRef = useRef(null);
  const faculteChartRef = useRef(null);
  const statsChartInstanceRef = useRef(null);
  const deptChartInstanceRef = useRef(null);
  const trendChartInstanceRef = useRef(null);
  const genderChartInstanceRef = useRef(null);
  const typeOffreChartInstanceRef = useRef(null);
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
      const params = {
        poste: filters.poste,
        entrepriseId,
        ...(filters.statut !== 'Tous' && { statut: filters.statut }), // Include statut if not 'Tous'
      };

      if (filters.typeOffre === 'all') {
        response = await axios.get('http://localhost:3000/api/statistique/postulation-stats-tout', { params });
      } else {
        params.typeOffre = filters.typeOffre;
        response = await axios.get('http://localhost:3000/api/statistique/postulation-stats', { params });
      }

      if (response.data.success) {
        setStats(response.data.data.stats);
        setByTypeOffre(response.data.data.byTypeOffre || []);
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
      const params = {
        poste: filters.poste,
        entrepriseId,
        ...(filters.typeOffre !== 'all' && { typeOffre: filters.typeOffre }),
        ...(filters.statut !== 'Tous' && { statut: filters.statut }), // Include statut if not 'Tous'
      };

      const response = await axios.get('http://localhost:3000/api/statistique/student-data', { params });

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

  const fetchTypeOffres = async () => {
    try {
      console.log('Récupération des données des types d\'offres');
      const response = await axios.get('http://localhost:3000/api/statistique/type-offres', {
        params: { entrepriseId },
      });
      if (response.data.success) {
        setTypeOffres(response.data.data);
        console.log('Types d\'offres récupérés', { count: response.data.data.length });
      }
    } catch (err) {
      setError('Erreur lors de la récupération des types d\'offres');
      console.error('Erreur lors de la récupération des types d\'offres', { error: err.message, response: err.response?.data });
    }
  };

  const fetchOffres = async () => {
    try {
      console.log('Récupération des données des offres', { typeOffre: filters.typeOffre });
      const params = { entrepriseId };
      if (filters.typeOffre !== 'all') params.typeOffre = filters.typeOffre;
      const response = await axios.get('http://localhost:3000/api/statistique/offres', { params });
      if (response.data.success) {
        setOffres(response.data.data);
        console.log('Offres récupérées', { count: response.data.data.length });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des offres', { error: err.message, response: err.response?.data });
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
    fetchTypeOffres();
    fetchOffres();
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
            labels: [ 'Embauches en attente', 'Embauchés', 'Non embauchés'],
            datasets: [{
              label: 'Statistiques',
              data: [
             
                stats.pending_hires || 0,
                stats.hired || 0,
                stats.not_hired || 0,
              ],
              backgroundColor: [ '#f59e0b', '#10b981', '#ef4444'],
              borderColor: [ '#d97706', '#059669', '#dc2626'],
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
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
  }, [stats, loading, error]);

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
              label: 'Candidats acceptés par département',
              data,
              backgroundColor: '#3b82f6',
              borderColor: '#12de6a',
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

  // Postulation Trend Line Chart with Annotations
  useEffect(() => {
    if (!loading && trendChartRef.current && studentData.length > 0 && !error) {
      if (trendChartInstanceRef.current) {
        trendChartInstanceRef.current.destroy();
      }

      try {
        const trends = studentData.reduce((acc, row) => {
          const date = row.date_postule ? new Date(row.date_postule).toISOString().slice(0, 7) : 'Inconnu';
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
              label: 'Postulations acceptées au fil du temps',
              data,
              borderColor: '#10b981',
              backgroundColor: 'rgba(35, 242, 24, 0.2)',
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
              y: { beginAtZero: true, title: { display: true, text: 'Postulations' } },
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

  // Gender Distribution Bar Chart
  useEffect(() => {
    if (!loading && genderChartRef.current && studentData.length > 0 && !error) {
      if (genderChartInstanceRef.current) {
        genderChartInstanceRef.current.destroy();
      }

      try {
        const genderCounts = studentData.reduce((acc, row) => {
          const gender = row.sexe || 'Inconnu';
          acc[gender] = (acc[gender] || 0) + 1;
          return acc;
        }, {});
        const labels = Object.keys(genderCounts);
        const data = Object.values(genderCounts);

        const ctx = genderChartRef.current.getContext('2d');
        genderChartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Candidats acceptés par sexe',
              data,
              backgroundColor: '#8b5cf6',
              borderColor: '#7c3aed',
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Nombre' } },
              x: { title: { display: true, text: 'Sexe' } },
            },
          },
        });
      } catch (err) {
        console.error('Erreur lors du rendu du graphique à barres des sexes', { error: err.message });
        setError('Échec du rendu du graphique des sexes');
      }
    }

    return () => {
      if (genderChartInstanceRef.current) {
        genderChartInstanceRef.current.destroy();
      }
    };
  }, [studentData, loading, error]);

  // Type Offre Distribution Bar Chart
  useEffect(() => {
    if (!loading && typeOffreChartRef.current && byTypeOffre.length > 0 && !error) {
      if (typeOffreChartInstanceRef.current) {
        typeOffreChartInstanceRef.current.destroy();
      }

      try {
        const labels = byTypeOffre.map(row => row.type_offre_nom || 'Inconnu');
        const datasets = filters.statut === 'Tous' ? [
          {
            label: 'En attente',
            data: byTypeOffre.map(row => row.pending_hires || 0),
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 1,
          },
          {
            label: 'Embauchés',
            data: byTypeOffre.map(row => row.hired || 0),
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1,
          },
          {
            label: 'Non embauchés',
            data: byTypeOffre.map(row => row.not_hired || 0),
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 1,
          },
        ] : [{
          label: `Candidats (${filters.statut})`,
          data: byTypeOffre.map(row => row.total_students || 0),
          backgroundColor: '#ec4899',
          borderColor: '#db2777',
          borderWidth: 1,
        }];

        const ctx = typeOffreChartRef.current.getContext('2d');
        typeOffreChartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: { labels, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Nombre' }, stacked: filters.statut === 'Tous' },
              x: { title: { display: true, text: 'Type d\'offre' }, stacked: filters.statut === 'Tous' },
            },
          },
        });
      } catch (err) {
        console.error('Erreur lors du rendu du graphique à barres des types d\'offres', { error: err.message });
        setError('Échec du rendu du graphique des types d\'offres');
      }
    }

    return () => {
      if (typeOffreChartInstanceRef.current) {
        typeOffreChartInstanceRef.current.destroy();
      }
    };
  }, [byTypeOffre, loading, error, filters.statut]);

  // Faculte Distribution Bar Chart
  useEffect(() => {
    if (!loading && faculteChartRef.current && byFaculte.length > 0 && !error) {
      if (faculteChartInstanceRef.current) {
        faculteChartInstanceRef.current.destroy();
      }

      try {
        const labels = byFaculte.map(row => row.faculte_nom || 'Inconnu');
        const datasets = filters.statut === 'Tous' ? [
          {
            label: 'En attente',
            data: byFaculte.map(row => row.pending_hires || 0),
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 1,
          },
          {
            label: 'Embauchés',
            data: byFaculte.map(row => row.hired || 0),
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1,
          },
          {
            label: 'Non embauchés',
            data: byFaculte.map(row => row.not_hired || 0),
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 1,
          },
        ] : [{
          label: `Candidats (${filters.statut})`,
          data: byFaculte.map(row => row.total_students || 0),
          backgroundColor: '#f97316',
          borderColor: '#ea580c',
          borderWidth: 1,
        }];

        const ctx = faculteChartRef.current.getContext('2d');
        faculteChartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: { labels, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Nombre' }, stacked: filters.statut === 'Tous' },
              x: { title: { display: true, text: 'Faculté' }, stacked: filters.statut === 'Tous' },
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
  }, [byFaculte, loading, error, filters.statut]);

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
    doc.text(`Rapport d'analyse des postulations acceptées (${entreprise.nom_entreprise || 'Entreprise inconnue'})`, 50, 20);
    doc.setFontSize(12);
    doc.text(`Sigle: ${entreprise.sigle || 'N/A'} | Email: ${entreprise.mail || 'N/A'} | Tél: ${entreprise.tel || 'N/A'}`, 50, 30);
    doc.text(`Site Web: ${entreprise.site_web || 'N/A'} | Domaine: ${entreprise.domaine_intervention || 'N/A'}`, 50, 38);
    doc.text(`Filtres: Poste - ${filters.poste} | Type d'offre - ${filters.typeOffre === 'all' ? 'Tous les types' : typeOffres.find(t => t.id === parseInt(filters.typeOffre))?.nom || 'N/A'} | Statut - ${filters.statut}`, 50, 46);

    // Stats Table
    autoTable(doc, {
      startY: 54,
      head: [['Poste', 'Type d\'offre', 'Candidats acceptés', 'Embauches en attente', 'Embauchés', 'Non embauchés']],
      body: [[
        filters.poste,
        filters.typeOffre === 'all' ? 'Tous les types' : typeOffres.find(t => t.id === parseInt(filters.typeOffre))?.nom || 'N/A',
        stats.total_students_applied || 0,
        stats.pending_hires || 0,
        stats.hired || 0,
        stats.not_hired || 0,
      ]],
      theme: 'striped',
      styles: { fontSize: 10, lineHeight: 1.6 },
      headStyles: { fillColor: '#3b82f6' },
    });

    // Student Data Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Nom', 'Prénom', 'Matricule', 'Sexe', 'Date de naissance', 'Nationalité', 'Situation matrimoniale', 'Licence', 'Département', 'Faculté', 'Commune', 'Quartier', 'Poste', 'Statut d\'embauche', 'Date de postulation']],
      body: studentData.map(row => [
        row.etudiant_nom || 'N/A',
        row.prenom || 'N/A',
        row.matricule || 'N/A',
        row.sexe || 'N/A',
        row.date_naissance ? new Date(row.date_naissance).toLocaleDateString() : 'N/A',
        row.nationalite || 'N/A',
        row.situation_matrimoniale || 'N/A',
        row.licence_nom || 'N/A',
        row.departement_nom || 'N/A',
        row.faculte_nom || 'N/A',
        row.commune || 'N/A',
        row.quartier || 'N/A',
        row.poste || 'N/A',
        row.statut_embauche || 'N/A',
        row.date_postule ? new Date(row.date_postule).toLocaleDateString() : 'N/A',
      ]),
      theme: 'striped',
      styles: { fontSize: 8, lineHeight: 1.6 },
      headStyles: { fillColor: '#3b82f6' },
    });

    doc.save(`rapport-analyse-postulations-ent-${entreprise.nom_entreprise || 'inconnu'}-${filters.statut}.pdf`);
    console.log('PDF exporté avec succès');
  };


  // Export to CSV
  const exportToCSV = () => {
    console.log('Exportation en CSV', { filters, entrepriseId, entreprise });
    const headers = [
      'Nom', 'Prénom', 'Matricule', 'Sexe', 'Date de naissance', 'Nationalité',
      'Situation matrimoniale', 'Licence', 'Département', 'Faculté', 'Commune',
      'Quartier', 'Poste', 'Statut d\'embauche', 'Date de postulation', 'Fichiers',
    ];

    const rows = studentData.map(row => [
      row.etudiant_nom || 'N/A',
      row.prenom || 'N/A',
      row.matricule || 'N/A',
      row.sexe || 'N/A',
      row.date_naissance ? new Date(row.date_naissance).toLocaleDateString() : 'N/A',
      row.nationalite || 'N/A',
      row.situation_matrimoniale || 'N/A',
      row.licence_nom || 'N/A',
      row.departement_nom || 'N/A',
      row.faculte_nom || 'N/A',
      row.commune || 'N/A',
      row.quartier || 'N/A',
      row.poste || 'N/A',
      row.statut_embauche || 'N/A',
      row.date_postule ? new Date(row.date_postule).toLocaleDateString() : 'N/A',
      [
        row.cv ? `CV: ${row.cv}` : '',
        row.lettre_motivation ? `Lettre: ${row.lettre_motivation}` : '',
      ].filter(Boolean).join(' | ') || 'N/A',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.map(field => `"${(field + '').replace(/"/g, '""')}"`).join(';')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rapport-analyse-postulations-ent-${entreprise.nom_entreprise || 'inconnu'}-${filters.statut}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('CSV exporté avec succès');
  };

  const handleFilterChange = (key, value) => {
    console.log('Filtre modifié', { key, value });
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'typeOffre' ? { poste: 'Tous' } : {}),
    }));
  };

  // Calculate hire rate
  const hireRate = stats.total_students_applied > 0 ? ((stats.hired || 0) / stats.total_students_applied * 100).toFixed(2) : 0;

  return (
   <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
    <div className="max-w-7xl mx-auto flex-1">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center sticky top-0 bg-gradient-to-br from-indigo-100 to-white z-10">
        Tableau de bord d'analyse des postulations acceptées ({entreprise.nom_entreprise || 'N/A'})
      </h1>
        {/* Filtres */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Type d'offre</label>
            <select
              value={filters.typeOffre}
              onChange={e => handleFilterChange('typeOffre', e.target.value)}
              className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            >
              <option value="all">Tous les types d'offre</option>
              {typeOffres.length === 0 && <option value="">Chargement...</option>}
              {typeOffres.map(type => (
                <option key={type.id} value={type.id}>{type.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Poste</label>
            <select
              value={filters.poste}
              onChange={e => handleFilterChange('poste', e.target.value)}
              className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            >
              <option value="Tous">Tous</option>
              {offres.map(offre => (
                <option key={offre.id} value={offre.poste}>{offre.poste}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Statut d'embauche</label>
            <select
              value={filters.statut}
              onChange={e => handleFilterChange('statut', e.target.value)}
              className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            >
              <option value="Tous">Tous</option>
              <option value="En attente">En attente</option>
              <option value="Embauché">Embauché</option>
              <option value="Non embauché">Non embauché</option>
            </select>
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
                fetchTypeOffres();
                fetchOffres();
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
            {/* Blocs côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Carte de statistiques */}
              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques des postulations acceptées</h2>
                <p className="text-lg text-gray-600"><span className="font-semibold">Embauches en attente :</span> {stats.pending_hires || 0}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Embauchés :</span> {stats.hired || 0}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Non embauchés :</span> {stats.not_hired || 0}</p>
                <p className="text-lg text-gray-600"><span className="font-semibold">Taux d'embauche :</span> {hireRate}%</p>
              </div>

              {/* Graphique en secteurs */}
              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Statistiques des postulations acceptées</h2>
                <div className="w-full h-80">
                  <canvas ref={statsChartRef} />
                </div>
              </div>

              {/* Graphique à barres des départements */}
              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Candidats acceptés par département</h2>
                <div className="w-full h-80">
                  <canvas ref={deptChartRef} />
                </div>
              </div>

              {/* Graphique linéaire des tendances */}
              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Tendances des postulations acceptées</h2>
                <div className="w-full h-80">
                  <canvas ref={trendChartRef} />
                </div>
              </div>

              {/* Graphique à barres des sexes */}
              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Répartition par sexe</h2>
                <div className="w-full h-80">
                  <canvas ref={genderChartRef} />
                </div>
              </div>

  

              {/* Graphique à barres des facultés */}
              <div className="bg-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Candidats acceptés par faculté</h2>
                <div className="w-full h-80">
                  <canvas ref={faculteChartRef} />
                </div>
              </div>
            </div>

            {/* Boutons d'exportation */}
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

            {/* Tableau des données des étudiants */}
            <div className="bg-white shadow-xl rounded-md p-2 overflow-x-auto">

              <h2 className="text-xl font-semibold text-gray-800 mb-4">Postulations acceptées des étudiants</h2>
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
                    <th className="p-3 font-semibold">Poste</th>
                    <th className="p-3 font-semibold">Statut d'embauche</th>
                    <th className="p-3 font-semibold">Date de postulation</th>
                    <th className="p-3 font-semibold">Fichiers</th>
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
                      <td className="p-3">{row.nationalite || 'N/A'}</td>
                      <td className="p-3">{row.situation_matrimoniale || 'N/A'}</td>
                      <td className="p-3">{row.licence_nom || 'N/A'}</td>
                      <td className="p-3">{row.departement_nom || 'N/A'}</td>
                      <td className="p-3">{row.faculte_nom || 'N/A'}</td>
                      <td className="p-3">{row.commune || 'N/A'}</td>
                      <td className="p-3">{row.quartier || 'N/A'}</td>
                      <td className="p-3">{row.poste || 'N/A'}</td>
                      <td className="p-3">{row.statut_embauche || 'N/A'}</td>
                      <td className="p-3">{row.date_postule ? new Date(row.date_postule).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3">
                        {row.cv ? (
                          <a href={row.cv} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CV</a>
                        ) : 'N/A'}
                        {row.lettre_motivation && (
                          <>
                            {' | '}
                            <a href={row.lettre_motivation} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lettre</a>
                          </>
                        )}
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
</div>
  );
};

export default A_offre;