import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import MetricCard from './components/MetricCard';
import QuickActionCard from './components/QuickActionCard';
import RevenueChart from './components/RevenueChart';
import StudentDemographics from './components/StudentDemographics';
import ActivityFeed from './components/ActivityFeed';
import AttendanceOverview from './components/AttendanceOverview';
import Icon from '../../components/AppIcon';
import dashboardService from '../../services/dashboardService';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userName, setUserName] = useState('Admin User');
  const [userRole, setUserRole] = useState('System Administrator');

  // API Data States
  const [metrics, setMetrics] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [demographicsData, setDemographicsData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [activities, setActivities] = useState([]);

  // Loading States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingDemographics, setLoadingDemographics] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Error States
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName') || 'Admin User';
    const storedRole = localStorage.getItem('userRole') || 'admin';
    setUserName(storedUserName);

    const roleLabels = {
      admin: 'System Administrator',
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent',
      bursar: 'Finance Manager'
    };
    setUserRole(roleLabels?.[storedRole] || 'System Administrator');
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch all data in parallel
    fetchStats();
    fetchRevenue();
    fetchDemographics();
    fetchAttendance();
    fetchActivities();
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await dashboardService.getStats();
      setMetrics([
        {
          title: "Total Students",
          value: data.totalStudents?.toLocaleString() || "0",
          change: data.studentsChange || "+0%",
          changeType: data.studentsChange?.startsWith('+') ? "positive" : "negative",
          icon: "Users",
          iconColor: "var(--color-primary)",
          trend: "vs last month"
        },
        {
          title: "Total Revenue",
          value: `${data.totalRevenue?.toLocaleString() || "0"} FCFA`,
          change: data.revenueChange || "+0%",
          changeType: data.revenueChange?.startsWith('+') ? "positive" : "negative",
          icon: "DollarSign",
          iconColor: "var(--color-success)",
          trend: "vs last month"
        },
        {
          title: "Attendance Rate",
          value: `${data.attendanceRate || "0"}%`,
          change: data.attendanceChange || "+0%",
          changeType: data.attendanceChange?.startsWith('+') ? "positive" : "negative",
          icon: "ClipboardCheck",
          iconColor: "var(--color-secondary)",
          trend: "vs last week"
        },
        {
          title: "Active Teachers",
          value: data.totalTeachers?.toString() || "0",
          change: data.teachersChange || "+0",
          changeType: data.teachersChange?.startsWith('+') ? "positive" : "negative",
          icon: "GraduationCap",
          iconColor: "var(--color-accent)",
          trend: "new this month"
        }
      ]);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setMetrics([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      setLoadingRevenue(true);
      const data = await dashboardService.getRevenue(new Date().getFullYear());
      setRevenueData(data);
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setRevenueData([]);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const fetchDemographics = async () => {
    try {
      setLoadingDemographics(true);
      const data = await dashboardService.getDemographics();
      setDemographicsData(data);
    } catch (err) {
      console.error('Error fetching demographics:', err);
      setDemographicsData([]);
    } finally {
      setLoadingDemographics(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const data = await dashboardService.getAttendance('week');
      setAttendanceData(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendanceData([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const data = await dashboardService.getRecentActivities(6);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const quickActions = [
    {
      title: "Manage Students",
      description: "View, add, or edit student records and enrollment details",
      icon: "Users",
      iconColor: "var(--color-primary)",
      route: "/students-management"
    },
    {
      title: "Manage Classes",
      description: "Configure classes, sections, and teacher assignments",
      icon: "BookOpen",
      iconColor: "var(--color-secondary)",
      route: "/classes-management"
    },
    {
      title: "Finance Overview",
      description: "Track fees, payments, and financial reports",
      icon: "DollarSign",
      iconColor: "var(--color-success)",
      route: "/finance-overview"
    },
    {
      title: "System Settings",
      description: "Configure school settings, academic years, and preferences",
      icon: "Settings",
      iconColor: "var(--color-accent)",
      route: "/admin-dashboard"
    }
  ];

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin-dashboard" }
  ];

  // Loading skeleton component
  const LoadingSkeleton = ({ className }) => (
    <div className={`animate-pulse bg-muted rounded ${className}`}></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <AuthHeader
        userName={userName}
        userRole={userRole}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              Welcome back, {userName?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Here's what's happening with your school today
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {loadingStats ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card rounded-xl border border-border p-6">
                  <LoadingSkeleton className="h-4 w-24 mb-4" />
                  <LoadingSkeleton className="h-8 w-32 mb-2" />
                  <LoadingSkeleton className="h-3 w-20" />
                </div>
              ))
            ) : (
              metrics?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {loadingRevenue ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <LoadingSkeleton className="h-6 w-32 mb-4" />
                <LoadingSkeleton className="h-64 w-full" />
              </div>
            ) : (
              <RevenueChart data={revenueData} />
            )}
            {loadingDemographics ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <LoadingSkeleton className="h-6 w-40 mb-4" />
                <LoadingSkeleton className="h-64 w-full" />
              </div>
            ) : (
              <StudentDemographics data={demographicsData} />
            )}
          </div>

          {/* Attendance and Activities Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {loadingAttendance ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <LoadingSkeleton className="h-6 w-40 mb-4" />
                <LoadingSkeleton className="h-48 w-full" />
              </div>
            ) : (
              <AttendanceOverview data={attendanceData} />
            )}
            {loadingActivities ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <LoadingSkeleton className="h-6 w-32 mb-4" />
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3 py-3">
                    <LoadingSkeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <LoadingSkeleton className="h-4 w-32 mb-2" />
                      <LoadingSkeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ActivityFeed activities={activities} />
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 md:mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {quickActions?.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
