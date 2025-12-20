import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPaperPlane, FaFile } from 'react-icons/fa';
import { API, API_BASE_URL } from '../config/api';

// Configuration de l'URL de l'API
const API_URL = API;

const MessagerieEntreprise = () => {
  const [entreprise, setEntreprise] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Récupérer l'id_entreprise connecté
  const entrepriseId = localStorage.getItem('entrepriseId');

  // Récupérer les informations de l'entreprise, de l'admin associé et les messages
  useEffect(() => {
    if (!entrepriseId) {
      setError('Vous devez être connecté pour accéder à la messagerie.');
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Récupérer les détails de l'entreprise
        const entrepriseResponse = await axios.get(`${API_URL}/message/entreprises/details/${entrepriseId}`);
        setEntreprise(entrepriseResponse.data);

        // Récupérer l'admin associé
        const adminResponse = await axios.get(`${API_URL}/admin/${entrepriseResponse.data.id_admin}`);
        setAdmin(adminResponse.data);

        // Récupérer les messages
        const messagesResponse = await axios.get(`${API_URL}/message/messages/${entrepriseId}/${entrepriseResponse.data.id_admin}`);
        setMessages(messagesResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError(
          error.response?.data?.error ||
          error.message === 'Network Error' ? 'Erreur de connexion au serveur' : 'Erreur lors du chargement des données'
        );
      } finally {
        setLoading(false);
      }
    };

    // Appeler immédiatement au chargement
    fetchData();

    // Polling toutes les 10 secondes
    const interval = setInterval(fetchData, 10000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, [entrepriseId, navigate]);

  // Faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gérer la sélection du fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
      if (filetypes.test(selectedFile.type) || filetypes.test(selectedFile.name.toLowerCase())) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError(null);
      } else {
        setError('Seuls les fichiers image (jpeg, jpg, png, gif), PDF, DOCX, et Excel (xls, xlsx) sont autorisés.');
        setFile(null);
        setFileName('');
      }
    } else {
      setFile(null);
      setFileName('');
    }
  };

  // Envoyer un nouveau message (avec ou sans fichier)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) {
      setError('Le message ne peut pas être vide si aucun fichier n\'est sélectionné.');
      return;
    }
    if (newMessage.length > 1000) {
      setError('Le message ne peut pas dépasser 1000 caractères.');
      return;
    }

    const formData = new FormData();
    formData.append('id_emetteur', entrepriseId);
    formData.append('id_destinataire', entreprise?.id_admin);
    formData.append('contenu', newMessage);
    formData.append('type_emetteur', 'entreprise');
    formData.append('type_destinataire', 'admin');
    if (file) {
      formData.append('fichier', file);
    }

    try {
      const response = await axios.post(`${API_URL}/message/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
        setMessages([...messages, {
        id_message: response.data.id_message,
        id_emetteur: entrepriseId,
        id_destinataire: entreprise?.id_admin,
        contenu: newMessage,
          fichier: file ? `${API_BASE_URL}/${file.name}` : null,
        date_envoi: new Date().toISOString(),
        type_emetteur: 'entreprise',
        type_destinataire: 'admin',
        nom_emetteur: entreprise?.nom_entreprise || 'Vous',
      }]);
      setNewMessage('');
      setFile(null);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError(null);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError(
        error.response?.data?.error ||
        error.message === 'Network Error' ? 'Erreur de connexion au serveur' : 'Erreur lors de l\'envoi du message'
      );
    }
  };

  // Vérifier si le bouton "Envoyer" doit être activé
  const isSendButtonDisabled = !newMessage.trim() && !file;

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">Chargement...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500 text-lg">{error}</div>;
  if (!entreprise || !admin) return <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">Données non trouvées</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Profil de l'admin (style modernisé) */}
      <div className="bg-white shadow-lg p-4 flex items-center space-x-4 border-b border-gray-200 sticky top-0 z-10">
        <button
          onClick={() => navigate('/accueil-entreprise')}
          className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          aria-label="Retour au tableau de bord"
        >
          <FaArrowLeft size={24} />
        </button>
        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
          {admin.nom?.charAt(0) || '?'}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{admin.nom} {admin.prenom}</h2>
          <p className="text-sm text-gray-500">{admin.mail || 'Non défini'}</p>
        </div>
      </div>
      {/* Zone des messages */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id_message}
            className={`flex ${message.type_emetteur === 'entreprise' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-lg transition-all duration-200 ${
                message.type_emetteur === 'entreprise'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.contenu}</p>
              {message.fichier && (
                <div className="mt-3">
                  {message.fichier.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                    <img
                      src={`${API_BASE_URL}/${message.fichier}`}
                      alt="Image jointe"
                      className="max-w-full h-auto rounded-lg shadow-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Fichier : {message.fichier.split('/').pop()}</p>
                  )}
                  <a
                    href={`${API_BASE_URL}/${message.fichier}`}
                    download
                    className={`text-sm underline ${
                      message.type_emetteur === 'entreprise' ? 'text-blue-200 hover:text-blue-100' : 'text-blue-500 hover:text-blue-600'
                    }`}
                  >
                    Télécharger le fichier
                  </a>
                </div>
              )}
              <p className="text-xs mt-2 opacity-75">
                {new Date(message.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Champ de saisie */}
      <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-200 sticky bottom-0 z-10">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-400"
            aria-label="Saisir un message"
            maxLength={1000}
          />
          <label className="p-3 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors duration-200">
            <FaFile size={20} className="text-gray-600" />
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              aria-label="Uploader un fichier"
            />
          </label>
          <button
            type="submit"
            className={`p-3 rounded-full transition-colors duration-200 ${
              isSendButtonDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            }`}
            disabled={isSendButtonDisabled}
            aria-label="Envoyer le message"
          >
            <FaPaperPlane size={20} />
          </button>
        </div>
        {fileName && (
          <p className="text-sm text-gray-500 mt-2">Fichier sélectionné : {fileName}</p>
        )}
      </form>
    </div>
  );
};

export default MessagerieEntreprise;