import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Camera } from "lucide-react";

export default function ProfilePopup({ showMenu, onClose }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Récupération des infos utilisateur (à adapter selon votre gestion d'état)
  // Ici on utilise localStorage pour l'exemple
  const [userInfo, setUserInfo] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : { name: "Utilisateur", email: "email@inconnu.com", profileImage: null };
  });

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu, onClose]);

  if (!showMenu) return null;

  // Déclencher l'input de fichier caché
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Gérer la sélection de l'image et l'envoyer à la base de données
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Créer un aperçu local immédiat
    const imageUrl = URL.createObjectURL(file);
    setUserInfo((prev) => ({ ...prev, profileImage: imageUrl }));

    // Préparer les données pour l'API (FormData pour les fichiers)
    const formData = new FormData();
    formData.append("profileImage", file);
    // Ajoutez l'ID de l'utilisateur si nécessaire
    // formData.append("userId", userInfo.id); 

    try {
      // REMPLACEZ PAR VOTRE VRAIE ROUTE BACKEND
      const response = await fetch("http://127.0.0.1:8000/api/user/upload-image", {
        method: "POST",
        body: formData,
        // N'ajoutez pas Content-Type manuellement pour FormData, le navigateur le fait
      });

      if (response.ok) {
        const data = await response.json();
        // Mettre à jour le localStorage et l'état avec l'URL de l'image renvoyée par le backend
        const updatedUser = { ...userInfo, profileImage: data.imageUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
        alert("Photo de profil mise à jour avec succès !");
      } else {
        alert("Erreur lors de l'upload de l'image.");
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur de connexion au serveur.");
    }
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    // Nettoyer le stockage local/session
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Si vous utilisez des tokens
    onClose();
    // Rediriger vers la page Home
    navigate("/");
  };

  return (
    <div className="assistant-profile-menu" ref={menuRef}>
      <div className="assistant-profile-header">
        <div className="assistant-profile-pic-wrapper" onClick={handleImageClick} style={{ cursor: "pointer", position: "relative" }}>
          {userInfo.profileImage ? (
            <img src={userInfo.profileImage} alt="Profile" className="assistant-profile-pic-img" />
          ) : (
            <div className="assistant-profile-pic">
              <User size={24} />
            </div>
          )}
          {/* Icône appareil photo sur l'image */}
          <div className="assistant-camera-badge">
            <Camera size={14} color="white" />
          </div>
        </div>
        
        {/* Input fichier caché */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />

        <div className="assistant-profile-info">
          {/* Afficher le vrai nom et email de l'utilisateur */}
          <h4>{userInfo.name || "Utilisateur SolarAI"}</h4>
          <p>{userInfo.email || "utilisateur@email.com"}</p>
        </div>
      </div>
      
      <div className="assistant-profile-divider"></div>
      
      <div className="assistant-profile-links">
        <button onClick={() => { navigate("/profile"); onClose(); }}>
          <User size={16} /> Mon Profil
        </button>
        <button onClick={() => { navigate("/settings"); onClose(); }}>
          <Settings size={16} /> Paramètres
        </button>
        {/* Bouton Déconnexion mis à jour */}
        <button className="assistant-logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </div>
  );
}