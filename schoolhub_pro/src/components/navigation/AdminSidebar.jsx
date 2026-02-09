import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { canViewMenuItem } from 'utils/permissions';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';

const AdminSidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navRef = useRef(null);
  const { schoolName, schoolLogo } = useSchoolSettings();

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('sidebarScrollPosition');
    if (savedScrollPosition && navRef?.current) {
      navRef.current.scrollTop = parseInt(savedScrollPosition, 10);
    }
  }, [location?.pathname]);

  const handleScroll = () => {
    if (navRef?.current) {
      sessionStorage.setItem('sidebarScrollPosition', navRef?.current?.scrollTop?.toString());
    }
  };

  const navigationSections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          path: '/admin-dashboard',
          label: 'Dashboard',
          icon: 'LayoutDashboard'
        },
        {
          path: '/school-settings',
          label: 'School Settings',
          icon: 'Settings',
          permission: 'Settings'
        }
      ]
    },
    {
      title: 'PEOPLE',
      items: [
        {
          path: '/students-management',
          label: 'Students',
          icon: 'Users',
          permission: 'Students'
        },
        {
          path: '/teachers-management',
          label: 'Teachers',
          icon: 'UserCheck',
          permission: 'Teachers'
        },
        {
          path: '/parents-management',
          label: 'Parents',
          icon: 'UserCircle',
          permission: 'Parents'
        },
        {
          path: '/admins-management',
          label: 'Admins',
          icon: 'Shield',
          requireSuperAdmin: true
        }
      ]
    },
    {
      title: 'ACADEMICS',
      items: [
        {
          path: '/classes-management',
          label: 'Classes',
          icon: 'BookOpen',
          permission: 'Classes'
        },
        {
          path: '/sections-management',
          label: 'Sections',
          icon: 'Layers',
          permission: 'Sections'
        },
        {
          path: '/subjects',
          label: 'Subjects',
          icon: 'Book',
          permission: 'Subjects'
        },
        {
          path: '/timetables-management',
          label: 'Timetables',
          icon: 'Clock',
          permission: 'Classes'
        },
        {
          path: '/exams',
          label: 'Exams',
          icon: 'FileText',
          permission: 'Exams'
        },
        {
          path: '/grade-system',
          label: 'Grade System',
          icon: 'Award',
          permission: 'Settings'
        }
      ]
    },
    {
      title: 'RESOURCES',
      items: [
        {
          path: '/course-materials',
          label: 'Course Materials',
          icon: 'FolderOpen'
        },
        {
          path: '/notices',
          label: 'Notices',
          icon: 'Bell',
          permission: 'Notices'
        },
        {
          path: '/academic-years',
          label: 'Academic Years',
          icon: 'Calendar',
          permission: 'Settings'
        },
        {
          path: '/semesters',
          label: 'Semesters',
          icon: 'CalendarDays',
          permission: 'Settings'
        }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        {
          path: '/fee-types-management',
          label: 'Fee Types',
          icon: 'Tag',
          permission: 'Fees'
        },
        {
          path: '/student-fees-management',
          label: 'Student Fees',
          icon: 'CreditCard',
          permission: 'Fees'
        },
        {
          path: '/finance-overview',
          label: 'Payments',
          icon: 'DollarSign',
          permission: 'Fees'
        },
        {
          path: '/reports-management',
          label: 'Reports',
          icon: 'BarChart3',
          permission: 'Reports'
        }
      ]
    }
  ];

  // Filter sections based on user permissions
  const filteredSections = useMemo(() => {
    return navigationSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => canViewMenuItem(item))
      }))
      .filter(section => section.items.length > 0);
  }, []);

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

        <nav className="portal-sidebar-nav" ref={navRef} onScroll={handleScroll}>
          {filteredSections?.map((section, sectionIndex) => (
            <div key={sectionIndex} className="portal-sidebar-section">
              <div className="portal-sidebar-section-title">
                {section?.title}
              </div>
              {section?.items?.map((item) => (
                <Link
                  key={`${item?.path}-${item?.label}`}
                  to={item?.path}
                  className={`portal-sidebar-nav-item ${isActive(item?.path) ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon name={item?.icon} size={20} />
                  <span className="portal-sidebar-nav-label">{item?.label}</span>
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

export default AdminSidebar;
