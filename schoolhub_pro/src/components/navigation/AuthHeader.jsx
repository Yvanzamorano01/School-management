import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';

const ROLE_LABELS = {
  'super_admin': 'Super Admin',
  'admin': 'Administrateur',
  'moderator': 'Modérateur',
  'teacher': 'Enseignant',
  'student': 'Étudiant',
  'parent': 'Parent',
  'bursar': 'Comptable'
};

const AuthHeader = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { schoolName, schoolLogo } = useSchoolSettings();

  const { userName, userRole } = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const name = user?.profile?.name || localStorage.getItem('userName') || 'User';
      const role = ROLE_LABELS[user?.role] || user?.profile?.role || localStorage.getItem('userRole') || 'Role';
      return { userName: name, userRole: role };
    } catch {
      return { userName: 'User', userRole: 'Role' };
    }
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const getInitials = (name) => {
    return name?.split(' ')?.map(word => word?.[0])?.join('')?.toUpperCase()?.slice(0, 2);
  };

  return (
    <header className="auth-header">
      <div className="auth-header-brand">
        <div className="auth-header-logo">
          {schoolLogo ? (
            <img src={schoolLogo} alt="School logo" className="w-6 h-6 object-contain rounded" />
          ) : (
            <Icon name="GraduationCap" size={24} color="var(--color-primary)" />
          )}
        </div>
        <span className="auth-header-title">{schoolName}</span>
      </div>

      <div className="auth-header-user">
        <div className="auth-header-user-info hidden sm:block">
          <div className="auth-header-user-name">{userName}</div>
          <div className="auth-header-user-role">{userRole}</div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="auth-header-avatar"
            aria-label="User menu"
          >
            {getInitials(userName)}
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-[190]"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-elevation-3 z-[300] overflow-hidden">
                <div className="p-4 border-b border-border sm:hidden">
                  <div className="font-medium text-foreground">{userName}</div>
                  <div className="text-sm text-muted-foreground">{userRole}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-foreground hover:bg-muted transition-colors duration-250"
                >
                  <Icon name="LogOut" size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;