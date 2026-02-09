import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';

const BursarSidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { schoolName, schoolLogo } = useSchoolSettings();

  const navigationItems = [
    {
      path: '/finance-dashboard',
      label: 'Finance Dashboard',
      icon: 'DollarSign'
    }
  ];

  const isActive = (path) => location?.pathname === path;

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className="mobile-menu-toggle"
        aria-label="Toggle mobile menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={20} />
      </button>
      {isMobileOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={handleMobileToggle}
        />
      )}
      <aside className={`portal-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'translate-x-0' : ''}`}>
        <div className="portal-sidebar-header">
          <div className="portal-sidebar-logo">
            {schoolLogo ? (
              <img src={schoolLogo} alt="School logo" className="w-6 h-6 object-contain rounded" />
            ) : (
              <Icon name="GraduationCap" size={24} color="var(--color-primary)" />
            )}
          </div>
          <span className="portal-sidebar-brand">{schoolName}</span>
        </div>

        <nav className="portal-sidebar-nav">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`portal-sidebar-nav-item ${isActive(item?.path) ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon name={item?.icon} size={20} />
              <span className="portal-sidebar-nav-label">{item?.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-2">
          <button
            onClick={onToggle}
            className="hidden lg:flex portal-sidebar-nav-item w-full"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
            <span className="portal-sidebar-nav-label">Collapse</span>
          </button>
        </div>
        <div className="px-3 pb-4 pt-2 border-t border-border/50">
          <p className="portal-sidebar-nav-label text-[10px] text-muted-foreground/60 text-center">&copy; {new Date().getFullYear()} Yvan Zamorano</p>
        </div>
      </aside>
    </>
  );
};

export default BursarSidebar;