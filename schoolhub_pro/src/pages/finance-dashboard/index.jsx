import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import FinancialSummaryCard from './components/FinancialSummaryCard';
import RevenueChart from './components/RevenueChart';
import PaymentMethodChart from './components/PaymentMethodChart';
import RecentTransactionItem from './components/RecentTransactionItem';
import QuickActionButton from './components/QuickActionButton';
import FeeTypeBreakdown from './components/FeeTypeBreakdown';
import ClassRevenueTable from './components/ClassRevenueTable';
import dashboardService from '../../services/dashboardService';
import classService from '../../services/classService';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedClass, setSelectedClass] = useState('all');

  const userName = localStorage.getItem('userName') || 'Admin User';
  const userRole = localStorage.getItem('userRole') === 'admin' ? 'Administrator' : 'Admin';

  // API Data States
  const [financialSummary, setFinancialSummary] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [classRevenueData, setClassRevenueData] = useState([]);

  // Loading States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingFeeTypes, setLoadingFeeTypes] = useState(true);
  const [loadingClassRevenue, setLoadingClassRevenue] = useState(true);

  // Error States
  const [error, setError] = useState(null);

  const breadcrumbItems = [
  { label: 'Finance', path: '/finance-dashboard' },
  { label: 'Dashboard', path: '/finance-dashboard' }];


  const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'current-week', label: 'Current Week' },
  { value: 'current-month', label: 'Current Month' },
  { value: 'current-quarter', label: 'Current Quarter' },
  { value: 'current-year', label: 'Current Year' },
  { value: 'custom', label: 'Custom Range' }];


  const [classOptions, setClassOptions] = useState([{ value: 'all', label: 'All Classes' }]);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchFinanceData();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAll();
      const classes = Array.isArray(data) ? data : [];
      setClassOptions([
        { value: 'all', label: 'All Classes' },
        ...classes.map(c => ({ value: c._id, label: c.name }))
      ]);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchFinanceData = async () => {
    fetchStats();
    fetchRevenue();
    fetchPaymentMethods();
    fetchTransactions();
    fetchFeeTypes();
    fetchClassRevenue();
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await dashboardService.getStats();
      setFinancialSummary([
        {
          title: 'Total Collections',
          amount: `${data.totalCollections?.toLocaleString() || '0'} FCFA`,
          change: data.collectionsChange || '+0%',
          changeType: data.collectionsChange?.startsWith('+') ? 'positive' : 'negative',
          icon: 'DollarSign',
          iconColor: 'var(--color-success)',
          trend: true
        },
        {
          title: 'Outstanding Fees',
          amount: `${data.outstandingFees?.toLocaleString() || '0'} FCFA`,
          change: data.outstandingChange || '+0%',
          changeType: data.outstandingChange?.startsWith('-') ? 'positive' : 'negative',
          icon: 'AlertCircle',
          iconColor: 'var(--color-warning)',
          trend: true
        },
        {
          title: 'Daily Revenue',
          amount: `${data.dailyRevenue?.toLocaleString() || '0'} FCFA`,
          change: data.dailyRevenueChange || '+0%',
          changeType: data.dailyRevenueChange?.startsWith('+') ? 'positive' : 'negative',
          icon: 'TrendingUp',
          iconColor: 'var(--color-primary)',
          trend: true
        },
        {
          title: 'Collection Rate',
          amount: `${data.collectionRate || '0'}%`,
          change: data.collectionRateChange || '+0%',
          changeType: data.collectionRateChange?.startsWith('+') ? 'positive' : 'negative',
          icon: 'Target',
          iconColor: 'var(--color-secondary)',
          trend: true
        }
      ]);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setFinancialSummary([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      setLoadingRevenue(true);
      const data = await dashboardService.getRevenueByCategory(new Date().getFullYear());
      setRevenueData(data);
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setRevenueData([]);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const data = await dashboardService.getPaymentMethods();
      setPaymentMethodData(data);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setPaymentMethodData([]);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const data = await dashboardService.getRecentTransactions(5);
      setRecentTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setRecentTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchFeeTypes = async () => {
    try {
      setLoadingFeeTypes(true);
      const data = await dashboardService.getFeeTypes();
      setFeeTypes(data);
    } catch (err) {
      console.error('Error fetching fee types:', err);
      setFeeTypes([]);
    } finally {
      setLoadingFeeTypes(false);
    }
  };

  const fetchClassRevenue = async () => {
    try {
      setLoadingClassRevenue(true);
      const data = await dashboardService.getClassRevenue();
      setClassRevenueData(data);
    } catch (err) {
      console.error('Error fetching class revenue:', err);
      setClassRevenueData([]);
    } finally {
      setLoadingClassRevenue(false);
    }
  };


  const handleLogout = () => {
    navigate('/login');
  };

  const handleRecordPayment = () => {
    console.log('Navigate to payment recording');
  };

  const handleAssignFees = () => {
    console.log('Navigate to fee assignment');
  };

  const handleGenerateReceipt = () => {
    console.log('Generate receipt');
  };

  const handleGenerateReport = () => {
    console.log('Generate financial report');
  };

  // Loading skeleton component
  const LoadingSkeleton = ({ className }) => (
    <div className={`animate-pulse bg-muted rounded ${className}`}></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <AuthHeader
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout} />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">Finance Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground">Comprehensive financial management and revenue tracking</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                options={periodOptions}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                placeholder="Select period"
                className="w-full sm:w-48" />

              <Select
                options={classOptions}
                value={selectedClass}
                onChange={setSelectedClass}
                placeholder="Select class"
                className="w-full sm:w-48" />

            </div>
          </div>

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
              financialSummary?.map((item, index) =>
                <FinancialSummaryCard key={index} {...item} />
              )
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <QuickActionButton
              icon="Plus"
              label="Record Payment"
              onClick={handleRecordPayment}
              color="var(--color-success)" />

            <QuickActionButton
              icon="DollarSign"
              label="Assign Fees"
              onClick={handleAssignFees}
              color="var(--color-primary)" />

            <QuickActionButton
              icon="FileText"
              label="Generate Receipt"
              onClick={handleGenerateReceipt}
              color="var(--color-secondary)" />

            <QuickActionButton
              icon="BarChart3"
              label="Financial Report"
              onClick={handleGenerateReport}
              color="var(--color-accent)" />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {loadingRevenue ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <LoadingSkeleton className="h-6 w-32 mb-4" />
                <LoadingSkeleton className="h-64 w-full" />
              </div>
            ) : (
              <RevenueChart
                data={revenueData}
                title="Monthly Revenue Breakdown" />
            )}

            {loadingPaymentMethods ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <LoadingSkeleton className="h-6 w-40 mb-4" />
                <LoadingSkeleton className="h-64 w-full" />
              </div>
            ) : (
              <PaymentMethodChart
                data={paymentMethodData}
                title="Payment Method Distribution" />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2">
              {loadingClassRevenue ? (
                <div className="bg-card rounded-xl border border-border p-6">
                  <LoadingSkeleton className="h-6 w-32 mb-4" />
                  <LoadingSkeleton className="h-64 w-full" />
                </div>
              ) : (
                <ClassRevenueTable classData={classRevenueData} />
              )}
            </div>
            <div>
              {loadingFeeTypes ? (
                <div className="bg-card rounded-xl border border-border p-6">
                  <LoadingSkeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index}>
                        <LoadingSkeleton className="h-4 w-24 mb-2" />
                        <LoadingSkeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <FeeTypeBreakdown feeTypes={feeTypes} />
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-foreground">Recent Transactions</h3>
              <Button variant="ghost" size="sm" iconName="Filter" iconPosition="left">
                Filter
              </Button>
            </div>

            {loadingTransactions ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-3">
                    <LoadingSkeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <LoadingSkeleton className="h-4 w-32 mb-2" />
                      <LoadingSkeleton className="h-3 w-24" />
                    </div>
                    <LoadingSkeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions?.map((transaction, index) =>
                  <RecentTransactionItem key={index} transaction={transaction} />
                )}
              </div>
            )}

            <div className="mt-4 md:mt-6 pt-4 border-t border-border">
              <Button variant="outline" fullWidth iconName="ArrowRight" iconPosition="right">
                View All Transactions
              </Button>
            </div>
          </div>

          <div className="mt-6 md:mt-8 bg-primary/5 border border-primary/20 rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Info" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">Financial Reconciliation Reminder</h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                  Monthly financial reconciliation is due by January 5, 2026. Please ensure all transactions are verified and bank statements are reconciled before the deadline.
                </p>
                <Button variant="default" size="sm" iconName="CheckCircle" iconPosition="left">
                  Start Reconciliation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default FinanceDashboard;