import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import FeeTypeCard from './components/FeeTypeCard';
import AddFeeTypeModal from './components/AddFeeTypeModal';
import ViewFeeTypeModal from './components/ViewFeeTypeModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import feeTypeService from '../../services/feeTypeService';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';
import { formatCurrency } from '../../utils/format';

const FeeTypesManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currency } = useSchoolSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = localStorage.getItem('userName') || 'Admin User';
  const userRole = localStorage.getItem('userRole') || 'admin';

  const breadcrumbItems = [
    { label: 'Admin Dashboard', path: '/admin-dashboard' },
    { label: 'Fee Types Management', path: '/fee-types-management' }
  ];

  const [feeTypes, setFeeTypes] = useState([]);

  useEffect(() => {
    fetchFeeTypes();
  }, [currency]);

  const fetchFeeTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feeTypeService.getAll();
      const formatted = data.map(ft => ({
        id: ft._id || ft.id,
        name: ft.name,
        description: ft.description,
        amount: ft.amount,
        dueDate: ft.dueDate?.split('T')[0],
        frequency: ft.frequency || 'Annual',
        applicableClasses: ft.applicableClasses || ['All Classes'],
        status: ft.status || 'Active'
      }));
      setFeeTypes(formatted);
    } catch (err) {
      console.error('Error fetching fee types:', err);
      setError('Failed to load fee types');
      setFeeTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeeType = () => {
    setSelectedFeeType(null);
    setShowAddModal(true);
  };

  const handleViewFeeType = (feeType) => {
    setSelectedFeeType(feeType);
    setShowViewModal(true);
  };

  const handleEditFeeType = (feeType) => {
    setSelectedFeeType(feeType);
    setShowAddModal(true);
  };

  const handleDeleteFeeType = (feeType) => {
    setSelectedFeeType(feeType);
    setShowDeleteModal(true);
  };

  const handleSaveFeeType = async (feeTypeData) => {
    try {
      if (selectedFeeType) {
        await feeTypeService.update(selectedFeeType.id, feeTypeData);
      } else {
        await feeTypeService.create(feeTypeData);
      }
      setShowAddModal(false);
      setSelectedFeeType(null);
      fetchFeeTypes();
    } catch (err) {
      console.error('Error saving fee type:', err);
      alert('Failed to save fee type');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await feeTypeService.delete(selectedFeeType.id);
      setShowDeleteModal(false);
      setSelectedFeeType(null);
      fetchFeeTypes();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete fee type');
    }
  };

  const filteredFeeTypes = feeTypes?.filter(ft =>
    ft?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    ft?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const totalFeeTypes = feeTypes?.length;
  const activeFeeTypes = feeTypes?.filter(ft => ft?.status === 'Active')?.length;
  const totalAmount = feeTypes?.reduce((sum, ft) => sum + (ft?.amount || 0), 0);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface rounded-xl border border-border p-6 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-muted rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AuthHeader
          userName={userName}
          userRole={userRole === 'admin' ? 'Administrator' : userRole}
          onLogout={() => { window.location.href = '/login'; }}
        />
        <Breadcrumb items={breadcrumbItems} />

        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fee Types Management</h1>
              <p className="text-muted-foreground mt-1">Configure and manage different types of fees</p>
            </div>
            <Button iconName="Plus" onClick={handleAddFeeType}>Add Fee Type</Button>
          </div>

          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchFeeTypes}>Retry</Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="Tag" size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Total Fee Types</h3>
                  <p className="text-sm text-muted-foreground">Configured</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalFeeTypes}</div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Active Fee Types</h3>
                  <p className="text-sm text-muted-foreground">Currently in use</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{activeFeeTypes}</div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Icon name="DollarSign" size={20} color="var(--color-warning)" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Total Amount</h3>
                  <p className="text-sm text-muted-foreground">Combined fees</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalAmount, currency)}</div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="mb-6">
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search fee types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {loading ? <LoadingSkeleton /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeeTypes?.map((feeType) => (
                  <FeeTypeCard
                    key={feeType?.id}
                    feeType={feeType}
                    onView={handleViewFeeType}
                    onEdit={handleEditFeeType}
                    onDelete={handleDeleteFeeType}
                    currency={currency}
                  />
                ))}
              </div>
            )}

            {!loading && filteredFeeTypes?.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No fee types found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddFeeTypeModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setSelectedFeeType(null); }}
          onSave={handleSaveFeeType}
          editingFeeType={selectedFeeType}
        />
      )}

      {showViewModal && (
        <ViewFeeTypeModal
          isOpen={showViewModal}
          onClose={() => { setShowViewModal(false); setSelectedFeeType(null); }}
          feeType={selectedFeeType}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedFeeType(null); }}
          onConfirm={handleConfirmDelete}
          feeTypeName={selectedFeeType?.name}
        />
      )}
    </div>
  );
};

export default FeeTypesManagement;
