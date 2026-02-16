import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ClassCard from './components/ClassCard';
import ClassFormModal from './components/ClassFormModal';
import ClassAnalytics from './components/ClassAnalytics';
import FilterPanel from './components/FilterPanel';
import classService from '../../services/classService';
import academicYearService from '../../services/academicYearService';

const ClassesManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    academicYear: 'all',
    status: 'all'
  });

  // API Data States
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Classes Management', path: '/classes-management' }
  ];

  // Fetch classes and academic years on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classesData, yearsData] = await Promise.all([
        classService.getAll(),
        academicYearService.getAll()
      ]);

      const formattedYears = yearsData.map(y => ({
        id: y._id || y.id,
        name: y.name,
        isActive: y.isActive
      }));
      setAcademicYears(formattedYears);

      const formattedClasses = classesData.map(cls => ({
        id: cls._id || cls.id,
        name: cls.name,
        code: cls.code,
        description: cls.description || `Academic level ${cls.name}`,
        academicYear: cls.academicYearId?.name || 'N/A',
        academicYearId: cls.academicYearId?._id || cls.academicYearId,
        totalSections: cls.totalSections || 0,
        totalStudents: cls.totalStudents || 0,
        subjects: cls.subjects || [],
        isActive: cls.isActive !== false
      }));
      setClasses(formattedClasses);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = () => fetchData();

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      academicYear: 'all',
      status: 'all'
    });
  };

  const filteredClasses = classes?.filter(cls => {
    const matchesSearch = cls?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
      cls?.code?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
      cls?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase());
    const matchesYear = filters?.academicYear === 'all' || cls?.academicYearId === filters?.academicYear;
    const matchesStatus = filters?.status === 'all' ||
      (filters?.status === 'active' && cls?.isActive) ||
      (filters?.status === 'inactive' && !cls?.isActive);

    return matchesSearch && matchesYear && matchesStatus;
  });

  const handleCreateClass = () => {
    setEditingClass(null);
    setShowClassModal(true);
  };

  const handleEditClass = (classData) => {
    setEditingClass(classData);
    setShowClassModal(true);
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.delete(classId);
        fetchClasses();
      } catch (err) {
        console.error('Error deleting class:', err);
        alert('Failed to delete class');
      }
    }
  };

  const handleClassSubmit = async (formData) => {
    try {
      if (formData?.id) {
        await classService.update(formData.id, formData);
      } else {
        await classService.create(formData);
      }
      setShowClassModal(false);
      setEditingClass(null);
      fetchClasses();
    } catch (err) {
      console.error('Error saving class:', err);
      alert('Failed to save class');
    }
  };

  // Calculate analytics
  const totalClasses = classes?.length || 0;
  const totalStudents = classes?.reduce((sum, cls) => sum + (cls?.totalStudents || 0), 0);
  const totalSections = classes?.reduce((sum, cls) => sum + (cls?.totalSections || 0), 0);
  const activeClasses = classes?.filter(cls => cls?.isActive)?.length || 0;

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="portal-layout">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="main-content">
        <AuthHeader
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={() => { }}
        />
        <div className="portal-content">
          <Breadcrumb items={breadcrumbItems} />

          {/* Page Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Classes Management</h1>
              <p className="text-muted-foreground">Manage academic levels and curriculum structure</p>
            </div>
            <Button onClick={handleCreateClass} className="flex items-center gap-2">
              <Icon name="Plus" size={20} />
              Add New Class
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchClasses}>Retry</Button>
            </div>
          )}

          {/* Analytics Cards */}
          <ClassAnalytics
            totalClasses={totalClasses}
            totalStudents={totalStudents}
            totalSections={totalSections}
            activeClasses={activeClasses}
          />

          {/* Filters */}
          <FilterPanel
            filters={filters}
            academicYears={academicYears}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Classes Grid */}
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses?.length > 0 ? (
                filteredClasses?.map((classData) => (
                  <ClassCard
                    key={classData?.id}
                    classData={classData}
                    onEdit={handleEditClass}
                    onDelete={handleDeleteClass}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground">No classes found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new class</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Class Form Modal */}
      {showClassModal && (
        <ClassFormModal
          isOpen={showClassModal}
          onClose={() => {
            setShowClassModal(false);
            setEditingClass(null);
          }}
          onSubmit={handleClassSubmit}
          editingClass={editingClass}
          academicYears={academicYears}
        />
      )}
    </div>
  );
};

export default ClassesManagement;
