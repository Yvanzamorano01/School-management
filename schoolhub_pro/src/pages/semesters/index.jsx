import React, { useState, useMemo, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import semesterService from '../../services/semesterService';
import academicYearService from '../../services/academicYearService';

const Semesters = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [filterYear, setFilterYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    academicYearId: '',
    startDate: '',
    endDate: '',
    status: 'Upcoming'
  });

  const [semestersData, setSemestersData] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sems, years] = await Promise.all([
        semesterService.getAll(),
        academicYearService.getAll()
      ]);

      const formattedYears = (years || []).map(y => ({
        id: y._id || y.id,
        name: y.name
      }));
      setAcademicYears(formattedYears);

      const formattedSems = (sems || []).map(s => ({
        id: s._id || s.id,
        name: s.name,
        academicYearId: s.academicYearId?._id || s.academicYearId,
        academicYearName: s.academicYearId?.name || 'N/A',
        startDate: s.startDate?.split('T')[0] || '',
        endDate: s.endDate?.split('T')[0] || '',
        status: s.status || 'Upcoming',
        examsCount: s.examsCount || 0
      }));
      setSemestersData(formattedSems);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load semesters');
      setSemestersData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSemesters = useMemo(() => {
    if (!filterYear) return semestersData;
    return semestersData.filter(s => s.academicYearId === filterYear);
  }, [semestersData, filterYear]);

  const stats = useMemo(() => {
    const total = semestersData.length;
    const active = semestersData.find(s => s.status === 'Active');
    const completed = semestersData.filter(s => s.status === 'Completed').length;
    const upcoming = semestersData.filter(s => s.status === 'Upcoming').length;
    return { total, active, completed, upcoming };
  }, [semestersData]);

  const handleEdit = (semester) => {
    setSelectedSemester(semester);
    setFormData({
      name: semester.name || '',
      academicYearId: semester.academicYearId || '',
      startDate: semester.startDate || '',
      endDate: semester.endDate || '',
      status: semester.status || 'Upcoming'
    });
    setShowAddModal(true);
  };

  const handleDelete = (semester) => {
    if (semester.status === 'Active') {
      alert('Cannot delete an active semester');
      return;
    }
    setSelectedSemester(semester);
    setShowDeleteModal(true);
  };

  const handleSetActive = async (semester) => {
    try {
      await semesterService.activate(semester.id);
      fetchData();
    } catch (err) {
      console.error('Failed to set semester as active:', err);
      alert('Failed to update semester status');
    }
  };

  const handleSaveSemester = async () => {
    try {
      if (selectedSemester) {
        await semesterService.update(selectedSemester.id, formData);
      } else {
        await semesterService.create(formData);
      }
      setShowAddModal(false);
      setSelectedSemester(null);
      setFormData({ name: '', academicYearId: '', startDate: '', endDate: '', status: 'Upcoming' });
      fetchData();
    } catch (err) {
      console.error('Failed to save semester:', err);
      alert(err?.response?.data?.message || 'Failed to save semester');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await semesterService.delete(selectedSemester.id);
      setShowDeleteModal(false);
      setSelectedSemester(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete semester:', err);
      alert('Failed to delete semester');
    }
  };



  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Semesters', path: '/semesters' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Upcoming', label: 'Upcoming' },
    { value: 'Completed', label: 'Completed' }
  ];

  const yearOptions = academicYears.map(y => ({ value: y.id, label: y.name }));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'bg-success/10 text-success border-success/20';
      case 'Upcoming': return 'bg-primary/10 text-primary border-primary/20';
      case 'Completed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const LoadingSkeleton = () => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Semester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Academic Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-muted animate-pulse rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-20 bg-muted animate-pulse rounded" /></td>
                <td className="px-6 py-4 hidden md:table-cell"><div className="h-3 w-24 bg-muted animate-pulse rounded" /></td>
                <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-32 bg-muted animate-pulse rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-muted animate-pulse rounded-full" /></td>
                <td className="px-6 py-4"><div className="flex justify-end gap-2"><div className="h-8 w-8 bg-muted animate-pulse rounded" /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <AuthHeader />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Semesters</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage academic semesters within each year</p>
            </div>
            <Button
              onClick={() => {
                setSelectedSemester(null);
                setFormData({ name: '', academicYearId: yearOptions[0]?.value || '', startDate: '', endDate: '', status: 'Upcoming' });
                setShowAddModal(true);
              }}
              iconName="Plus"
              iconPosition="left"
              size="lg"
            >
              Add Semester
            </Button>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchData}>Retry</Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="CalendarDays" size={24} className="text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Semesters</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="PlayCircle" size={24} className="text-success" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats.active?.name || 'None'}</div>
              <div className="text-sm text-muted-foreground">Current Semester</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="CheckCircle" size={24} className="text-muted-foreground" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Clock" size={24} className="text-accent" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats.upcoming}</div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <Select
                  value={filterYear}
                  onChange={(value) => setFilterYear(value)}
                  options={[{ value: '', label: 'All Academic Years' }, ...yearOptions]}
                />
              </div>
              {filterYear && (
                <Button variant="outline" onClick={() => setFilterYear('')} iconName="X">
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Icon name="Info" size={20} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Semester Management</p>
              <p className="text-sm text-muted-foreground">
                Only one semester can be active at a time within an academic year. Exams, attendance, and grades are linked to semesters.
              </p>
            </div>
          </div>

          {/* Semesters Table */}
          {loading ? <LoadingSkeleton /> : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Semester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Academic Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSemesters.map((semester) => (
                      <tr key={semester.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${semester.status === 'Active' ? 'bg-success/10' : 'bg-muted'
                              }`}>
                              <Icon
                                name="CalendarDays"
                                size={20}
                                className={semester.status === 'Active' ? 'text-success' : 'text-muted-foreground'}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{semester.name}</div>
                              <div className="text-sm text-muted-foreground">{semester.examsCount} exams</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-muted rounded text-sm text-foreground">
                            {semester.academicYearName}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-sm text-foreground">{formatDate(semester.startDate)}</div>
                          <div className="text-sm text-muted-foreground">to {formatDate(semester.endDate)}</div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {semester.status === 'Active' ? (
                            <div className="text-sm text-muted-foreground">
                              {getDaysRemaining(semester.endDate)} days remaining
                            </div>
                          ) : semester.status === 'Completed' ? (
                            <div className="text-sm text-muted-foreground">Completed</div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Not started</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(semester.status)}`}>
                            {semester.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {semester.status === 'Upcoming' && (
                              <Button variant="ghost" size="sm" onClick={() => handleSetActive(semester)} title="Set as Active">
                                <Icon name="Play" size={16} className="text-success" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(semester)}>
                              <Icon name="Pencil" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(semester)}
                              disabled={semester.status === 'Active'}
                            >
                              <Icon name="Trash2" size={16} className={semester.status === 'Active' ? 'text-muted' : 'text-error'} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSemesters.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="CalendarDays" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No semesters found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setSelectedSemester(null); }}
        title={selectedSemester ? 'Edit Semester' : 'Add Semester'}
      >
        <div className="space-y-4">
          <Input
            label="Semester Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Semester 1, Fall Term"
          />
          <Select
            label="Academic Year"
            value={formData.academicYearId}
            onChange={(value) => setFormData({ ...formData, academicYearId: value })}
            options={yearOptions}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          <Select
            label="Status"
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={statusOptions}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSaveSemester}>{selectedSemester ? 'Update' : 'Add'} Semester</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedSemester(null); }}
        title="Delete Semester"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete <span className="font-bold text-foreground">{selectedSemester?.name}</span>?
            This will remove all associated exams, grades, and attendance records.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Semesters;
