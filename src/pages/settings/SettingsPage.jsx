import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Settings as SettingsIcon, Sun, Moon, ArrowLeft } from "lucide-react";
import { useTheme } from "../../context/ThemeContext"; // Import du thème

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme(); // Hook du thème

  // Récupération des infos utilisateur (similaire au ProfilePopup)
  const [userInfo, setUserInfo] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : { name: "Utilisateur", email: "email@inconnu.com", profileImage: null };
  });

  return (
    <div className="settings-container" style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#111827' : '#f3f4f6', 
      color: isDarkMode ? '#fff' : '#111827',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* Header de la page */}
      <header style={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <ArrowLeft size={32} />
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Paramètres</h1>
      </header>

      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* SECTION 1 : PROFIL */}
        <div style={{
          backgroundColor: isDarkMode ? '#1f2937' : 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: '#163b67',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
          }}>
            {userInfo.profileImage ? (
              <img src={userInfo.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={40} color="white" />
            )}
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{userInfo.name}</h2>
            <p style={{ margin: 0, color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> {userInfo.email}
            </p>
          </div>
        </div>

        {/* SECTION 2 : APPARENCE (MODE SOMBRE) */}
        <div style={{
          backgroundColor: isDarkMode ? '#1f2937' : 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SettingsIcon size={20} /> Apparence
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                padding: '10px', borderRadius: '50%', backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' 
              }}>
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Mode Sombre</div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>Activer le thème sombre</div>
              </div>
            </div>

            {/* Bouton Toggle */}
            <button 
              onClick={toggleTheme}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '14px',
                backgroundColor: isDarkMode ? '#f5a623' : '#d1d5db',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: isDarkMode ? '25px' : '3px',
                transition: 'left 0.3s'
              }}></div>
            </button>
          </div>
        </div>

        {/* Ajouter d'autres sections ici si besoin (Sécurité, Notifications, etc.) */}

      </div>
    </div>
  );
}