import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';

const SchoolSettingsContext = createContext();

export const SchoolSettingsProvider = ({ children }) => {
  const [schoolName, setSchoolName] = useState('SchoolHub Pro');
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [currency, setCurrency] = useState('XAF');
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#1E40AF');

  const refreshSettings = useCallback(async () => {
    try {
      const settings = await settingsService.getSettings();
      setSchoolName(settings.schoolName || 'SchoolHub Pro');
      setSchoolLogo(settings.schoolLogo || null);
      setCurrency(settings.currency || 'XAF');
      setTheme(settings.theme || 'light');
      setPrimaryColor(settings.primaryColor || '#1E40AF');
    } catch (err) {
      console.error('Failed to load school settings:', err);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Apply Primary Color
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      // We might want to calculate a darker shade for hover states or rings if needed, 
      // but for now, let's stick to the base primary color.
      // Also ensuring ring color matches primary
      document.documentElement.style.setProperty('--color-ring', primaryColor);
    }
  }, [primaryColor]);

  return (
    <SchoolSettingsContext.Provider value={{ schoolName, schoolLogo, currency, theme, primaryColor, refreshSettings }}>
      {children}
    </SchoolSettingsContext.Provider>
  );
};

export const useSchoolSettings = () => {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    return {
      schoolName: 'SchoolHub Pro',
      schoolLogo: null,
      currency: 'XAF',
      theme: 'light',
      primaryColor: '#1E40AF',
      refreshSettings: () => { }
    };
  }
  return context;
};

export default SchoolSettingsContext;
