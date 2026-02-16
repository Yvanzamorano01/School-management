import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import BursarSidebar from '../../components/navigation/BursarSidebar';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import RevenueCard from './components/RevenueCard';
import FeeTypeCard from './components/FeeTypeCard';
import RevenueChart from './components/RevenueChart';
import PaymentMethodChart from './components/PaymentMethodChart';
import RecentTransactionItem from './components/RecentTransactionItem';
import QuickActionButton from './components/QuickActionButton';
import dashboardService from '../../services/dashboardService';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';
import { formatCurrency } from '../../utils/format';

const FinanceOverview = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role === 'super_admin' ? 'admin' : (storedUser.role || 'student');
  const SidebarComponent = userRole === 'student' ? StudentSidebar : userRole === 'admin' ? AdminSidebar : BursarSidebar;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [selectedFeeFilter, setSelectedFeeFilter] = useState('all');
  const { currency } = useSchoolSettings();

  // API Data States
  const [revenueCards, setRevenueCards] = useState([]);
  const [feeTypeData, setFeeTypeData] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [quickActions, setQuickActions] = useState([]);

  // Loading States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  // Error States
  const [error, setError] = useState(null);

  const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : userRole === 'student' ? '/student-dashboard' : '/finance-dashboard';
  const breadcrumbItems = [
    { label: 'Dashboard', path: dashboardPath },
    { label: 'Finance Overview', path: '/finance-overview' }
  ];


  const periodOptions = [
    { value: 'all-time', label: 'All Time' },
    { value: 'current-month', label: 'Current Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'current-quarter', label: 'Current Quarter' },
    { value: 'current-year', label: 'Current Year' }];


  const feeFilterOptions = [
    { value: 'all', label: 'All Fee Types' },
    ...feeTypeData.map(ft => ({
      value: ft.title.toLowerCase().split(' ')[0],
      label: ft.title
    }))
  ];


  // Convert period to date range
  const getPeriodDateRange = (period) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (period) {
      case 'current-month':
        return { from: new Date(year, month, 1), to: new Date(year, month + 1, 0, 23, 59, 59) };
      case 'last-month':
        return { from: new Date(year, month - 1, 1), to: new Date(year, month, 0, 23, 59, 59) };
      case 'current-quarter': {
        const qStart = Math.floor(month / 3) * 3;
        return { from: new Date(year, qStart, 1), to: new Date(year, qStart + 3, 0, 23, 59, 59) };
      }
      case 'current-year':
        return { from: new Date(year, 0, 1), to: new Date(year, 11, 31, 23, 59, 59) };
      default:
        return null;
    }
  };

  // Fetch finance data on mount and when period changes
  useEffect(() => {
    fetchFinanceData();
  }, [currency, selectedPeriod]);

  const fetchFinanceData = async () => {
    fetchStats();
    fetchRevenue();
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setError(null);
      const dateRange = getPeriodDateRange(selectedPeriod);
      const data = await dashboardService.getStats(dateRange ? { dateRange } : {});

      setRevenueCards([
        {
          title: "Total Collections",
          amount: formatCurrency(data.totalRevenue, currency),
          change: data.revenueChange || "+0%",
          changeType: data.revenueChange?.startsWith('+') ? "positive" : "negative",
          trend: "vs last month",
          icon: "DollarSign",
          iconColor: "var(--color-success)"
        },
        {
          title: "Pending Fees",
          amount: formatCurrency(data.pendingFees, currency),
          change: data.pendingFeesChange || "+0%",
          changeType: data.pendingFeesChange?.startsWith('-') ? "positive" : "negative",
          trend: "vs last month",
          icon: "Clock",
          iconColor: "var(--color-warning)"
        },
        {
          title: "Total Students",
          amount: data.totalStudents?.toLocaleString() || "0",
          change: `+${data.newStudents || 0}`,
          changeType: "positive",
          trend: "new this month",
          icon: "Users",
          iconColor: "var(--color-primary)"
        },
        {
          title: "Collection Rate",
          amount: `${data.collectionRate || "0"}%`,
          change: data.collectionRateChange || "+0%",
          changeType: data.collectionRateChange?.startsWith('+') ? "positive" : "negative",
          trend: "vs last month",
          icon: "TrendingUp",
          iconColor: "var(--color-secondary)"
        }
      ]);

      setFeeTypeData([
        {
          title: "Tuition Fees",
          collected: data.tuitionCollected || 0,
          pending: data.tuitionPending || 0,
          total: (data.tuitionCollected || 0) + (data.tuitionPending || 0),
          collectionRate: data.tuitionRate || 0,
          icon: "BookOpen"
        },
        {
          title: "Exam Fees",
          collected: data.examCollected || 0,
          pending: data.examPending || 0,
          total: (data.examCollected || 0) + (data.examPending || 0),
          collectionRate: data.examRate || 0,
          icon: "FileText"
        },
        {
          title: "Transport Fees",
          collected: data.transportCollected || 0,
          pending: data.transportPending || 0,
          total: (data.transportCollected || 0) + (data.transportPending || 0),
          collectionRate: data.transportRate || 0,
          icon: "Bus"
        },
        {
          title: "Library Fees",
          collected: data.libraryCollected || 0,
          pending: data.libraryPending || 0,
          total: (data.libraryCollected || 0) + (data.libraryPending || 0),
          collectionRate: data.libraryRate || 0,
          icon: "Library"
        }
      ]);

      setRecentTransactions(data.recentTransactions || []);
      setPaymentMethodData(data.paymentMethods || []);

      setQuickActions([
        {
          icon: "Settings",
          label: "Fee Configuration",
          description: "Manage fee types, amounts, and payment schedules",
          color: "var(--color-primary)"
        },
        {
          icon: "Receipt",
          label: "Record Payment",
          description: "Add new payment transactions and receipts",
          color: "var(--color-success)"
        },
        {
          icon: "FileBarChart",
          label: "Financial Reports",
          description: "Generate comprehensive revenue and collection reports",
          color: "var(--color-secondary)"
        },
        {
          icon: "Download",
          label: "Export Data",
          description: "Download financial statements for accounting integration",
          color: "var(--color-accent)"
        }
      ]);

    } catch (err) {
      console.error('Error fetching finance stats:', err);
      setError('Failed to load finance statistics');
      setRevenueCards([]);
      setFeeTypeData([]);
      setRecentTransactions([]);
      setPaymentMethodData([]);
      setQuickActions([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      setLoadingRevenue(true);
      const currentYear = new Date().getFullYear();
      const data = await dashboardService.getRevenueCollectedVsPending(currentYear);
      setMonthlyRevenueData(data || []);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setMonthlyRevenueData([]);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleRetry = () => {
    fetchFinanceData();
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarComponent
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <AuthHeader
        userName="Admin User"
        userRole="Administrator"
        onLogout={handleLogout} />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                Finance Overview
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Comprehensive financial analytics and revenue tracking
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Select
                options={periodOptions}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                className="w-full sm:w-48" />

              {userRole !== 'student' && (
                <Button
                  variant="default"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => console.log('Export report')}>

                  Export Report
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="AlertCircle" size={20} color="var(--color-error)" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {loadingStats ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                ))}
              </>
            ) : (
              revenueCards?.map((card, index) =>
                <RevenueCard key={index} {...card} />
              )
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            {loadingRevenue ? (
              <>
                <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-32 mb-6"></div>
                  <div className="h-64 bg-muted rounded"></div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-32 mb-6"></div>
                  <div className="h-64 bg-muted rounded"></div>
                </div>
              </>
            ) : (
              <>
                <RevenueChart data={monthlyRevenueData} currency={currency} />
                <PaymentMethodChart data={paymentMethodData} currency={currency} />
              </>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">
                Fee Type Breakdown
              </h2>
              <Select
                options={feeFilterOptions}
                value={selectedFeeFilter}
                onChange={setSelectedFeeFilter}
                className="w-48" />

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {loadingStats ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                      <div className="h-5 bg-muted rounded w-28 mb-4"></div>
                      <div className="h-8 bg-muted rounded w-32 mb-4"></div>
                      <div className="h-2 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </>
              ) : (
                feeTypeData
                  ?.filter(ft => selectedFeeFilter === 'all' || ft.title.toLowerCase().startsWith(selectedFeeFilter))
                  ?.map((feeType, index) =>
                    <FeeTypeCard key={index} {...feeType} currency={currency} />
                  )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl shadow-elevation-1">
                <div className="p-4 md:p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      Recent Transactions
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="ExternalLink"
                      iconPosition="right"
                      onClick={() => console.log('View all transactions')}>

                      View All
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {loadingStats ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 md:p-6 animate-pulse">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                              <div className="h-3 bg-muted rounded w-24"></div>
                            </div>
                            <div className="h-5 bg-muted rounded w-20"></div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    recentTransactions?.map((transaction) =>
                      <RecentTransactionItem
                        key={transaction?.id}
                        transaction={transaction}
                        currency={currency} />
                    )
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-elevation-1 mb-4 md:mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  {loadingStats ? (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 bg-muted/20 rounded-lg animate-pulse">
                          <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      ))}
                    </>
                  ) : (
                    quickActions?.map((action, index) =>
                      <QuickActionButton
                        key={index}
                        {...action}
                        onClick={() => console.log(`Action: ${action?.label}`)} />
                    )
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-elevation-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="AlertCircle" size={20} color="var(--color-primary)" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Collection Alerts
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">
                      42 Students with Overdue Fees
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total overdue amount: {formatCurrency(18500, currency)}
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">
                      Payment Deadline Approaching
                    </p>
                    <p className="text-xs text-muted-foreground">
                      156 students due in next 7 days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default FinanceOverview;