import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import GeneralSettings from './components/GeneralSettings';
import AcademicConfiguration from './components/AcademicConfiguration';
import UserManagement from './components/UserManagement';
import SystemPreferences from './components/SystemPreferences';
import settingsService from '../../services/settingsService';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';

const SchoolSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [settings, setSettings] = useState({});
  const savedSettingsRef = useRef({});
  const { refreshSettings } = useSchoolSettings();

  const breadcrumbItems = [
    { label: 'Admin Dashboard', path: '/admin-dashboard' },
    { label: 'School Settings', path: '/school-settings' }
  ];

  const tabs = [
    { id: 'general', label: 'General Settings', icon: 'Settings' },
    { id: 'academic', label: 'Academic Configuration', icon: 'BookOpen' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'system', label: 'System Preferences', icon: 'Sliders' }
  ];

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getSettings();
      setSettings(data);
      savedSettingsRef.current = data;
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    setHasUnsavedChanges(true);
    setSuccessMsg('');
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg('');
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      savedSettingsRef.current = updated;
      setHasUnsavedChanges(false);
      setSuccessMsg('Settings saved successfully!');
      refreshSettings();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({ ...savedSettingsRef.current });
    setHasUnsavedChanges(false);
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AuthHeader onLogout={() => { localStorage.clear(); window.location.href = '/'; }} />
        <Breadcrumb items={breadcrumbItems} />

        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">School Settings</h1>
              <p className="text-muted-foreground mt-1">Configure institutional parameters and system preferences</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleResetSettings} disabled={!hasUnsavedChanges}>
                Reset
              </Button>
              <Button iconName="Save" onClick={handleSaveSettings} disabled={!hasUnsavedChanges || saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error rounded-lg p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Icon name="AlertCircle" size={20} color="var(--color-error)" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
              <Button size="sm" variant="outline" onClick={fetchSettings}>
                Retry
              </Button>
            </div>
          )}

          {successMsg && (
            <div className="bg-success/10 border border-success rounded-lg p-4 flex items-center gap-3">
              <Icon name="CheckCircle" size={20} color="var(--color-success)" />
              <p className="text-sm text-foreground">{successMsg}</p>
            </div>
          )}

          {hasUnsavedChanges && (
            <div className="bg-warning/10 border border-warning rounded-lg p-4 flex items-center gap-3">
              <Icon name="AlertTriangle" size={20} color="var(--color-warning)" />
              <p className="text-sm text-foreground">You have unsaved changes.</p>
            </div>
          )}

          <div className="bg-surface rounded-xl border border-border">
            <div className="border-b border-border">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded animate-pulse" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-16 bg-muted rounded animate-pulse" />
                    <div className="h-16 bg-muted rounded animate-pulse" />
                    <div className="h-16 bg-muted rounded animate-pulse" />
                    <div className="h-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'general' && <GeneralSettings settings={settings} onChange={handleSettingsChange} />}
                  {activeTab === 'academic' && <AcademicConfiguration />}
                  {activeTab === 'users' && <UserManagement settings={settings} onChange={handleSettingsChange} />}
                  {activeTab === 'system' && <SystemPreferences />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSettings;
