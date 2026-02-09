import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';

import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ReportCard from './components/ReportCard';
import GenerateReportModal from './components/GenerateReportModal';
import reportService from '../../services/reportService';


const ReportsManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = localStorage.getItem('userName') || 'Admin User';
  const userRole = localStorage.getItem('userRole') || 'admin';

  const breadcrumbItems = [
    { label: 'Admin Dashboard', path: '/admin-dashboard' },
    { label: 'Reports Management', path: '/reports-management' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'academic', label: 'Academic Reports' },
    { value: 'financial', label: 'Financial Reports' },
    { value: 'administrative', label: 'Administrative Reports' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getAll();
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (report) => {
    setSelectedReport(report);
    setShowGenerateModal(true);
  };

  const handleSaveReport = (reportData) => {
    console.log('Generating report:', reportData);
    setShowGenerateModal(false);
    setSelectedReport(null);
  };

  const filteredReports = reports?.filter(report =>
    filterCategory === 'all' || report?.category === filterCategory
  );

  const academicReports = reports?.filter(r => r?.category === 'academic')?.length;
  const financialReports = reports?.filter(r => r?.category === 'financial')?.length;
  const administrativeReports = reports?.filter(r => r?.category === 'administrative')?.length;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AuthHeader 
          userName={userName}
          userRole={userRole === 'admin' ? 'Administrator' : userRole}
          onLogout={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        />
        <Breadcrumb items={breadcrumbItems} />

        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
              <p className="text-muted-foreground mt-1">Generate and manage comprehensive reports for academic, financial, and operational analytics</p>
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="AlertCircle" size={20} className="text-error" />
                <div>
                  <p className="text-error font-medium">Failed to load reports</p>
                  <p className="text-sm text-error/80">{error}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <Icon name="RefreshCw" size={16} />
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface rounded-xl border border-border p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-muted rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="BookOpen" size={20} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Academic Reports</h3>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{academicReports}</div>
              </div>

              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Icon name="DollarSign" size={20} color="var(--color-success)" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Financial Reports</h3>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{financialReports}</div>
              </div>

              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Icon name="Settings" size={20} color="var(--color-warning)" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Administrative Reports</h3>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{administrativeReports}</div>
              </div>
            </div>
          )}

          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Select
                options={categoryOptions}
                value={filterCategory}
                onChange={setFilterCategory}
                className="w-full md:w-64"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-surface rounded-lg border border-border p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-muted"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-5/6 mb-4"></div>
                    <div className="h-9 bg-muted rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReports?.map((report) => (
                    <ReportCard
                      key={report?.id}
                      report={report}
                      onGenerate={handleGenerateReport}
                    />
                  ))}
                </div>

                {filteredReports?.length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reports found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showGenerateModal && (
        <GenerateReportModal
          isOpen={showGenerateModal}
          onClose={() => {
            setShowGenerateModal(false);
            setSelectedReport(null);
          }}
          onSave={handleSaveReport}
          report={selectedReport}
        />
      )}
    </div>
  );
};

export default ReportsManagement;