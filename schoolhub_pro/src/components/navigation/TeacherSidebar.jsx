import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';

const TeacherSidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { schoolName, schoolLogo } = useSchoolSettings();

  const navigationSections = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/teacher-dashboard', label: 'Dashboard', icon: 'LayoutDashboard' }
      ]
    },
    {
      title: 'MY WORKSPACE',
      items: [
        { path: '/my-classes', label: 'My Classes', icon: 'Users' },
        { path: '/my-students', label: 'My Students', icon: 'UserCheck' },
        { path: '/my-timetable', label: 'My Timetable', icon: 'Clock' }
      ]
    },
    {
      title: 'ACADEMICS',
      items: [
        { path: '/attendance-management', label: 'Attendance', icon: 'ClipboardCheck' },
        { path: '/grades-management', label: 'Grades', icon: 'Award' },
        { path: '/exams', label: 'Exams', icon: 'FileText' }
      ]
    },
    {
      title: 'RESOURCES',
      items: [
        { path: '/course-materials', label: 'Course Materials', icon: 'FolderOpen' },
        { path: '/notices', label: 'Notices', icon: 'Bell' }
      ]
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
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="portal-sidebar-section">
              <div className="portal-sidebar-section-title">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`portal-sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="portal-sidebar-nav-label">{item.label}</span>
                </Link>
              ))}
            </div>
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

export default TeacherSidebar;