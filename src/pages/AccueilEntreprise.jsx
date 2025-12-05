import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import Footer from '../components/Footer';
import StartupList from './StartupList';

const AccueilEntreprise = () => {
  const navigate = useNavigate();
  const entrepriseId = localStorage.getItem('entrepriseId');

  useEffect(() => {
    if (!entrepriseId) {
      navigate('/connexion');
    }
  }, [navigate, entrepriseId]);

  if (!entrepriseId) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-900 text-white">
      <Header />
      <MainContent />
      <StartupList />
      <Footer />
    </div>
  );
};

export default AccueilEntreprise;