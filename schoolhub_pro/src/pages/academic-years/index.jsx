import React, { useState, useMemo, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/AppIcon';
import academicYearService from '../../services/academicYearService';

const AcademicYears = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'Inactive'
  });

  const [academicYearsData, setAcademicYearsData] = useState([]);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await academicYearService.getAll();
      const formatted = data.map(year => ({
        id: year._id || year.id,
        name: year.name,
        startDate: year.startDate?.split('T')[0],
        endDate: year.endDate?.split('T')[0],
        status: year.status || 'Upcoming',
        semestersCount: year.semestersCount || 0
      }));
      setAcademicYearsData(formatted);
    } catch (err) {
      console.error('Error fetching academic years:', err);
      setError('Failed to load academic years');
      setAcademicYearsData([]);
    } finally {
      setLoading(false);
    }
  };


  const stats = useMemo(() => {
    const total = academicYearsData?.length;
    const active = academicYearsData?.find((y) => y?.status === 'Active');
    const completed = academicYearsData?.filter((y) => y?.status === 'Completed')?.length;
    const upcoming = academicYearsData?.filter((y) => y?.status === 'Upcoming')?.length;
    return { total, active, completed, upcoming };
  }, [academicYearsData]);

  const handleEdit = (year) => {
    setSelectedYear(year);
    setFormData({
      name: year?.name || '',
      startDate: year?.startDate || '',
      endDate: year?.endDate || '',
      status: year?.status || 'Inactive'
    });
    setShowAddModal(true);
  };

  const handleDelete = (year) => {
    if (year?.status === 'Active') {
      alert('Cannot delete an active academic year');
      return;
    }
    setSelectedYear(year);
    setShowDeleteModal(true);
  };

  const handleSetActive = async (year) => {
    try {
      await academicYearService.activate(year.id);
      fetchAcademicYears();
    } catch (err) {
      console.error('Error setting active:', err);
      alert('Failed to set as active');
    }
  };

  const handleSaveYear = async () => {
    try {
      if (selectedYear) {
        await academicYearService.update(selectedYear.id, formData);
      } else {
        await academicYearService.create(formData);
      }
      setShowAddModal(false);
      setSelectedYear(null);
      setFormData({ name: '', startDate: '', endDate: '', status: 'Inactive' });
      fetchAcademicYears();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save academic year');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await academicYearService.delete(selectedYear.id);
      setShowDeleteModal(false);
      setSelectedYear(null);
      fetchAcademicYears();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Academic Years', path: '/academic-years' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Upcoming', label: 'Upcoming' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'bg-success/10 text-success border-success/20';
      case 'Upcoming': return 'bg-primary/10 text-primary border-primary/20';
      case 'Completed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <AuthHeader onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }} />
      <main className="main-content">
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Academic Years</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage academic year periods for the school</p>
            </div>
            <Button onClick={() => { setSelectedYear(null); setFormData({ name: '', startDate: '', endDate: '', status: 'Upcoming' }); setShowAddModal(true); }} iconName="Plus" iconPosition="left" size="lg">
              Add Academic Year
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchAcademicYears}>Retry</Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="Calendar" size={24} className="text-primary mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.total}</div>
              <div className="text-sm text-muted-foreground">Total Years</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="CheckCircle" size={24} className="text-success mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.active?.name || 'None'}</div>
              <div className="text-sm text-muted-foreground">Current Active Year</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="Archive" size={24} className="text-muted-foreground mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.completed}</div>
              <div className="text-sm text-muted-foreground">Completed Years</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="Clock" size={24} className="text-accent mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.upcoming}</div>
              <div className="text-sm text-muted-foreground">Upcoming Years</div>
            </div>
          </div>

          {/* Academic Years Grid */}
          {loading ? <LoadingSkeleton /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {academicYearsData?.map((year) => (
                <div key={year?.id} className={`bg-card rounded-xl border p-6 ${year?.status === 'Active' ? 'border-success ring-2 ring-success/20' : 'border-border'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{year?.name}</h3>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(year?.status)}`}>{year?.status}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(year)}><Icon name="Pencil" size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(year)} disabled={year?.status === 'Active'}><Icon name="Trash2" size={16} className={year?.status === 'Active' ? 'text-muted' : 'text-error'} /></Button>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="CalendarRange" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{formatDate(year?.startDate)} - {formatDate(year?.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Layers" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{year?.semestersCount} Semesters</span>
                    </div>
                  </div>
                  {year?.status !== 'Active' && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => handleSetActive(year)}>
                      <Icon name="Play" size={16} className="mr-2" />Set as Active
                    </Button>
                  )}
                  {year?.status === 'Active' && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-success text-sm">
                      <Icon name="CheckCircle" size={16} />Currently Active
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setSelectedYear(null); }} title={selectedYear ? 'Edit Academic Year' : 'Add Academic Year'}>
        <div className="space-y-4">
          <Input label="Academic Year Name" value={formData?.name} onChange={(e) => setFormData({ ...formData, name: e?.target?.value })} placeholder="e.g., 2024-2025" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData?.startDate} onChange={(e) => setFormData({ ...formData, startDate: e?.target?.value })} />
            <Input label="End Date" type="date" value={formData?.endDate} onChange={(e) => setFormData({ ...formData, endDate: e?.target?.value })} />
          </div>
          <Select label="Status" value={formData?.status} onChange={(value) => setFormData({ ...formData, status: value })} options={statusOptions} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSaveYear}>{selectedYear ? 'Update' : 'Add'} Year</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedYear(null); }} title="Delete Academic Year">
        <div className="space-y-4">
          <p className="text-muted-foreground">Are you sure you want to delete academic year <span className="font-bold text-foreground">{selectedYear?.name}</span>?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AcademicYears;
