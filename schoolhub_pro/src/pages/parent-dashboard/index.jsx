import React, { useState, useEffect } from 'react';
import ParentSidebar from '../../components/navigation/ParentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import ChildSummaryCard from './components/ChildSummaryCard';
import NotificationPanel from './components/NotificationPanel';
import QuickActionsPanel from './components/QuickActionsPanel';
import RecentActivityFeed from './components/RecentActivityFeed';
import UpcomingEventsCalendar from './components/UpcomingEventsCalendar';
import ChildSelector from './components/ChildSelector';
import dashboardService from '../../services/dashboardService';

const ParentDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedChild, setSelectedChild] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    children: [],
    notifications: [],
    activities: [],
    events: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getParentDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch parent dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      setDashboardData({
        children: [],
        notifications: [],
        activities: [],
        events: []
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
  { label: 'Home', path: '/parent-dashboard' },
  { label: 'Dashboard', path: '/parent-dashboard' }];


  const { children, notifications, activities, events } = dashboardData;

  const filteredChildren = selectedChild === 'all' ?
  children :
  children?.filter((child) => child?.id === selectedChild);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <ParentSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <AuthHeader
          userName="Michael Johnson"
          userRole="Parent" />

        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="main-content-inner">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load Dashboard</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ParentSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <AuthHeader
          userName="Michael Johnson"
          userRole="Parent" />

        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="main-content-inner">
            <Breadcrumb items={breadcrumbItems} />

            <div className="mb-6 md:mb-8">
              <div className="h-8 bg-muted rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="h-64 bg-muted rounded animate-pulse"></div>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="lg:col-span-2 h-96 bg-muted rounded animate-pulse"></div>
              <div className="h-96 bg-muted rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="h-96 bg-muted rounded animate-pulse"></div>
              <div className="h-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ParentSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <AuthHeader
        userName="Michael Johnson"
        userRole="Parent" />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Parent Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Monitor your children's academic progress and school activities
            </p>
          </div>

          {children?.length > 1 &&
          <div className="mb-6 md:mb-8">
              <ChildSelector
              children={children}
              selectedChild={selectedChild}
              onChildChange={setSelectedChild} />

            </div>
          }

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {filteredChildren?.map((child) =>
            <ChildSummaryCard key={child?.id} child={child} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2">
              <NotificationPanel notifications={notifications} />
            </div>
            <div>
              <QuickActionsPanel />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <RecentActivityFeed activities={activities} />
            <UpcomingEventsCalendar events={events} />
          </div>
        </div>
      </main>
    </div>);

};

export default ParentDashboard;