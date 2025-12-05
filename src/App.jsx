import { Routes, Route } from 'react-router-dom';
import EcranAccueil from './pages/EcranAccueil';
import AccueilEntreprise from './pages/AccueilEntreprise';
import Inscription from './pages/Inscription';
import PublierOffre from './pages/PublierOffre';
import PublierFormation from './pages/PublierFormation';
import PublierEvenement from './pages/PublierEvenement';
import PublierSuccessStory from './pages/PublierSuccessStory';
import StartupList from './pages/StartupList';
import Messagerie from './pages/Messagerie';
import APropos from './pages/APropos';
import Profil from './pages/Profil';
import StartupDetails from './pages/StartupDetails';
import Candidature from './pages/Candidature';
import A_offre from './pages/A_offre';
import A_formation from './pages/A_formation';
import A_startup from './pages/A_startup';
import MotdepasseEntreprise from './pages/MotdepasseEntreprise';
import AccueilPublic from './pages/AccueilPublic';
import Verification from './pages/Verification';


import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<AccueilPublic />} />
        <Route path="/connexion" element={<EcranAccueil />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/accueil-entreprise" element={<AccueilEntreprise />} />
        <Route path="/publier/offre" element={<PublierOffre />} />
        <Route path="/publier/formation" element={<PublierFormation />} />
        <Route path="/publier/evenement" element={<PublierEvenement />} />
        <Route path="/publier/success-story" element={<PublierSuccessStory />} />
        <Route path="/startup" element={<StartupList />} />
        <Route path="/messagerie" element={<Messagerie />} />
        <Route path="/apropos" element={<APropos />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/details/:id" element={<StartupDetails />} />
        <Route path="/candidature" element={<Candidature />} />
        <Route path="/analyse/offre" element={<A_offre />} />
        <Route path="/analyse/formation" element={<A_formation />} />
        <Route path="/analyse/startup" element={<A_startup />} />
        <Route path="/motdepasse-entreprise" element={<MotdepasseEntreprise />} />
        <Route path="/verification" element={<Verification />} />
        {/* Ajoutez d'autres routes ici si nécessaire */}
      </Routes>
    </NotificationProvider>
  );
}

export default App;