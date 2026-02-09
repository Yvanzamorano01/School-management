import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import FeeStructureTable from './components/FeeStructureTable';
import FeeModal from './components/FeeModal';
import StudentFeeAssignment from './components/StudentFeeAssignment';
import FeeAnalytics from './components/FeeAnalytics';
import feeTypeService from '../../services/feeTypeService';
import paymentService from '../../services/paymentService';
import classService from '../../services/classService';

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-12 bg-muted rounded-lg w-full"></div>
    <div className="h-12 bg-muted rounded-lg w-full"></div>
    <div className="h-12 bg-muted rounded-lg w-full"></div>
    <div className="h-12 bg-muted rounded-lg w-full"></div>
  </div>
);

const FeesManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('structure');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classOptions, setClassOptions] = useState([{ value: 'all', label: 'All Classes' }]);
  const [summaryStats, setSummaryStats] = useState({ totalCollected: 0, totalPending: 0, collectionRate: 0, pendingStudents: 0 });

  const breadcrumbItems = [
    { label: 'Admin Dashboard', path: '/admin-dashboard' },
    { label: 'Fees Management', path: '/fees-management' }
  ];

  useEffect(() => {
    fetchFeeStructures();
    fetchClasses();
    fetchSummaryStats();
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

  const fetchSummaryStats = async () => {
    try {
      const data = await paymentService.getStudentFees();
      const fees = Array.isArray(data) ? data : [];
      const totalAssigned = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
      const totalPaid = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
      const totalPending = totalAssigned - totalPaid;
      const rate = totalAssigned > 0 ? Math.round((totalPaid / totalAssigned) * 100 * 10) / 10 : 0;
      const pendingStudents = new Set(fees.filter(f => (f.balance || 0) > 0).map(f => f.studentId?._id || f.studentId)).size;
      setSummaryStats({ totalCollected: totalPaid, totalPending, collectionRate: rate, pendingStudents });
    } catch (err) {
      console.error('Error fetching summary stats:', err);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feeTypeService.getAll();
      setFeeStructures(data);
    } catch (err) {
      console.error('Error fetching fee structures:', err);
      setError(err.message || 'Failed to load fee structures');
      setFeeStructures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = () => {
    setEditingFee(null);
    setShowFeeModal(true);
  };

  const handleEditFee = (fee) => {
    setEditingFee(fee);
    setShowFeeModal(true);
  };

  const handleSaveFee = (feeData) => {
    console.log('Saving fee:', feeData);
    setShowFeeModal(false);
    setEditingFee(null);
  };

  const tabs = [
    { id: 'structure', label: 'Fee Structure', icon: 'DollarSign' },
    { id: 'assignment', label: 'Student Assignment', icon: 'Users' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AuthHeader 
          userName="Admin User" 
          userRole="Administrator"
          onLogout={() => console.log('Logout clicked')}
        />
        <Breadcrumb items={breadcrumbItems} />

        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fees Management</h1>
              <p className="text-muted-foreground mt-1">Configure fee structures and manage student fee assignments</p>
            </div>
            <Button iconName="Plus" onClick={handleAddFee}>
              Add Fee Structure
            </Button>
          </div>

          <div className="bg-surface rounded-xl border border-border">
            <div className="border-b border-border">
              <div className="flex overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab?.id
                        ? 'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    {tab?.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'structure' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select
                      label="Filter by Class"
                      options={classOptions}
                      value={selectedClass}
                      onChange={setSelectedClass}
                      className="flex-1"
                    />
                  </div>

                  {loading ? (
                    <LoadingSkeleton />
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/10 mb-4">
                        <Icon name="AlertCircle" size={32} color="var(--color-error)" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load fee structures</h3>
                      <p className="text-muted-foreground mb-4">{error}</p>
                      <Button onClick={fetchFeeStructures} variant="outline">
                        <Icon name="RefreshCw" size={16} />
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <FeeStructureTable
                      data={feeStructures}
                      onEdit={handleEditFee}
                    />
                  )}
                </div>
              )}

              {activeTab === 'assignment' && (
                <StudentFeeAssignment />
              )}

              {activeTab === 'analytics' && (
                <FeeAnalytics />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Icon name="DollarSign" size={20} color="var(--color-success)" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Total Collections</h3>
                  <p className="text-sm text-muted-foreground">All time</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{summaryStats.totalCollected.toLocaleString()} FCFA</div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Icon name="Clock" size={20} color="var(--color-warning)" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Pending Fees</h3>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{summaryStats.totalPending.toLocaleString()} FCFA</div>
              <div className="text-sm text-muted-foreground mt-1">{summaryStats.pendingStudents} students</div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Collection Rate</h3>
                  <p className="text-sm text-muted-foreground">Overall</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{summaryStats.collectionRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {showFeeModal && (
        <FeeModal
          isOpen={showFeeModal}
          onClose={() => {
            setShowFeeModal(false);
            setEditingFee(null);
          }}
          onSave={handleSaveFee}
          editingFee={editingFee}
        />
      )}
    </div>
  );
};

export default FeesManagement;