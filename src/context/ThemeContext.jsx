import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Création du contexte
const ThemeContext = createContext();

// 2. Création du Provider (le gestionnaire d'état)
export const ThemeProvider = ({ children }) => {
  // Au démarrage, on regarde dans le localStorage s'il y a une préférence enregistrée.
  // Si rien n'est trouvé, on met 'true' (Mode Sombre par défaut, comme dans ton ancien code).
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  // 3. Effet déclenché à chaque changement de thème
  useEffect(() => {
    // A. Sauvegarder dans le localStorage (mémoire persistante)
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));

    // B. Ajouter ou supprimer la classe 'dark-mode' sur le body (pour le CSS global)
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Valeur qui sera accessible dans toute l'app
  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Hook personnalisé pour simplifier l'importation dans les composants
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return context;
};