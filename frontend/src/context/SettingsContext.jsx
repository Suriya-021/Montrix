import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  // Appearance
  const [theme, setTheme] = useState(localStorage.getItem('setting_theme') || 'dark');
  const [compactMode, setCompactMode] = useState(localStorage.getItem('setting_compact') === 'true');
  const [animations, setAnimations] = useState(localStorage.getItem('setting_animations') !== 'false'); // default true
  
  // Preferences
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('setting_dateFormat') || 'ddmmyyyy');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(localStorage.getItem('setting_firstDay') || 'monday');
  const [defaultCategory, setDefaultCategory] = useState(localStorage.getItem('setting_defaultCategory') || 'other');

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('setting_notifications');
    return saved ? JSON.parse(saved) : {
      budgetAlerts: true,
      budgetExceeded: true,
      upcomingBills: true,
      savingsGoals: true,
      aiInsights: false
    };
  });

  // Apply Appearance side-effects
  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    if (theme === 'light') root.classList.add('light-theme');
    else root.classList.remove('light-theme');

    // Compact mode
    if (compactMode) root.classList.add('compact-mode');
    else root.classList.remove('compact-mode');

    // Animations
    if (!animations) root.classList.add('disable-animations');
    else root.classList.remove('disable-animations');
    
  }, [theme, compactMode, animations]);

  // Unified updater
  const updateSetting = (key, value) => {
    switch (key) {
      case 'theme': setTheme(value); break;
      case 'compactMode': setCompactMode(value); break;
      case 'animations': setAnimations(value); break;
      case 'dateFormat': setDateFormat(value); break;
      case 'firstDayOfWeek': setFirstDayOfWeek(value); break;
      case 'defaultCategory': setDefaultCategory(value); break;
      case 'notifications': setNotifications(value); break;
      default: break;
    }
    
    if (key === 'notifications') {
      localStorage.setItem(`setting_${key}`, JSON.stringify(value));
    } else {
      localStorage.setItem(`setting_${key}`, value);
    }
  };

  return (
    <SettingsContext.Provider value={{
      theme, compactMode, animations,
      dateFormat, firstDayOfWeek, defaultCategory,
      notifications,
      updateSetting
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
