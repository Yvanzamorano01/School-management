import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';

const SchoolSettingsContext = createContext();

export const SchoolSettingsProvider = ({ children }) => {
  const [schoolName, setSchoolName] = useState('SchoolHub Pro');
  const [schoolLogo, setSchoolLogo] = useState(null);

  const refreshSettings = useCallback(async () => {
    try {
      const settings = await settingsService.getSettings();
      setSchoolName(settings.schoolName || 'SchoolHub Pro');
      setSchoolLogo(settings.schoolLogo || null);
    } catch (err) {
      console.error('Failed to load school settings:', err);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return (
    <SchoolSettingsContext.Provider value={{ schoolName, schoolLogo, refreshSettings }}>
      {children}
    </SchoolSettingsContext.Provider>
  );
};

export const useSchoolSettings = () => {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    return { schoolName: 'SchoolHub Pro', schoolLogo: null, refreshSettings: () => {} };
  }
  return context;
};

export default SchoolSettingsContext;
