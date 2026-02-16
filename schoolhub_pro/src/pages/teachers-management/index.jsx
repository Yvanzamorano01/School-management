import React, { useState, useMemo, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import TeacherFilters from './components/TeacherFilters';
import TeacherTableRow from './components/TeacherTableRow';
import AddTeacherModal from './components/AddTeacherModal';
import ViewTeacherModal from './components/ViewTeacherModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import teacherService from '../../services/teacherService';
import authService from '../../services/authService';
import classService from '../../services/classService';
import subjectService from '../../services/subjectService';

const TeachersManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API Data States
  const [teachersData, setTeachersData] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);

  // Check if current user is super_admin
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = storedUser.role === 'super_admin';

  const [filters, setFilters] = useState({
    subject: '',
    status: '',
    search: ''
  });

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Teachers', path: '/teachers-management' }
  ];

  // Fetch teachers data
  useEffect(() => {
    fetchTeachers();
    fetchClassesAndSubjects();
  }, []);

  const fetchClassesAndSubjects = async () => {
    try {
      const [classes, subjects] = await Promise.all([
        classService.getAll(),
        subjectService.getAll()
      ]);
      const classArr = Array.isArray(classes) ? classes : [];
      setClassOptions(classArr.map(c => ({ value: c._id, label: c.name })));
      const subjectArr = Array.isArray(subjects) ? subjects : [];
      setSubjectOptions(subjectArr.map(s => ({ value: s.name, label: s.name })));
    } catch (err) {
      console.error('Error fetching classes/subjects:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherService.getAll();
      // Transform API response to match component format
      const formattedTeachers = data.map(teacher => ({
        id: teacher._id || teacher.id,
        userId: teacher.userId,
        teacherId: teacher.teacherId,
        name: teacher.name || `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.email,
        phone: teacher.phone,
        photo: teacher.photo || null,
        photoAlt: `Photo of ${teacher.name || 'Teacher'}`,
        subjects: teacher.subjects || [],
        classIds: teacher.classIds?.map(c => c._id || c) || [],
        classes: teacher.classIds?.map(c => c.name || c).filter(Boolean) || [],
        status: teacher.status || 'Active',
        qualification: teacher.qualification || 'N/A',
        experience: teacher.experience || 'N/A',
        joinDate: teacher.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : 'N/A'
      }));
      setTeachersData(formattedTeachers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again.');
      setTeachersData([]);
      setSubjectOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachersData?.filter((teacher) => {
      const matchesSubject = !filters?.subject || teacher?.subjects?.includes(filters?.subject);
      const matchesStatus = !filters?.status || teacher?.status === filters?.status;
      const matchesSearch = !filters?.search ||
        teacher?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        teacher?.email?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        teacher?.teacherId?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        teacher?.phone?.includes(filters?.search);

      return matchesSubject && matchesStatus && matchesSearch;
    });
  }, [teachersData, filters]);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeachers?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  const totalPages = Math.ceil(filteredTeachers?.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalTeachers = teachersData?.length;
    const activeTeachers = teachersData?.filter((t) => t?.status === 'Active')?.length;
    const allSubjects = [...new Set(teachersData?.flatMap((t) => t?.subjects))];
    const avgClasses = totalTeachers > 0
      ? (teachersData?.reduce((sum, t) => sum + (t?.classes?.length || 0), 0) / totalTeachers)?.toFixed(1)
      : '0';

    return {
      total: totalTeachers,
      active: activeTeachers,
      subjects: allSubjects?.length,
      avgClasses: avgClasses
    };
  }, [teachersData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ subject: '', status: '', search: '' });
    setCurrentPage(1);
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setShowAddModal(true);
  };

  const handleDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleAddTeacher = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedTeacher) {
        await teacherService.update(selectedTeacher.id, formData);
      } else {
        await teacherService.create(formData);
      }
      setShowAddModal(false);
      setSelectedTeacher(null);
      fetchTeachers(); // Refresh the list
    } catch (err) {
      console.error('Error saving teacher:', err);
      alert('Failed to save teacher. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      await teacherService.delete(selectedTeacher.id);
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      fetchTeachers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting teacher:', err);
      alert('Failed to delete teacher. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout triggered');
  };

  const handleToggleActive = async (teacher) => {
    const action = teacher.status === 'Active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${teacher.name}'s account?`)) return;
    try {
      setToggleLoading(teacher.id);
      await authService.toggleUserActive(teacher.userId || teacher.id);
      fetchTeachers();
    } catch (err) {
      console.error('Error toggling user:', err);
      alert(err.response?.data?.message || 'Failed to toggle account status');
    } finally {
      setToggleLoading(null);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4 border-b border-border">
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
          <div className="h-6 bg-muted rounded w-24" />
          <div className="h-6 bg-muted rounded w-20" />
          <div className="h-8 bg-muted rounded w-24" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <AuthHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                Teachers
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage all teachers in the school
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedTeacher(null);
                setShowAddModal(true);
              }}
              iconName="Plus"
              iconPosition="left"
              size="lg">
              Add Teacher
            </Button>
          </div>

          <TeacherFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            subjectOptions={subjectOptions}
            statusOptions={statusOptions} />

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchTeachers}>
                Retry
              </Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                  <div className="h-6 w-6 bg-muted rounded mb-2" />
                  <div className="h-8 bg-muted rounded w-16 mb-1" />
                  <div className="h-4 bg-muted rounded w-24" />
                </div>
              ))
            ) : (
              <>
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Users" size={24} className="text-primary" />
                  </div>
                  <div className="text-2xl font-semibold text-foreground mb-1">
                    {stats?.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Teachers</div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="UserCheck" size={24} className="text-success" />
                  </div>
                  <div className="text-2xl font-semibold text-foreground mb-1">
                    {stats?.active}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Book" size={24} className="text-accent" />
                  </div>
                  <div className="text-2xl font-semibold text-foreground mb-1">
                    {stats?.subjects}
                  </div>
                  <div className="text-sm text-muted-foreground">Subjects Covered</div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="BookOpen" size={24} className="text-secondary" />
                  </div>
                  <div className="text-2xl font-semibold text-foreground mb-1">
                    {stats?.avgClasses}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Classes/Teacher</div>
                </div>
              </>
            )}
          </div>

          {/* Teachers Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Teacher
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                          Subjects
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                          Classes
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTeachers?.map((teacher) =>
                        <TeacherTableRow
                          key={teacher?.id}
                          teacher={teacher}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleActive={isSuperAdmin ? handleToggleActive : undefined}
                          toggleLoading={toggleLoading === teacher?.id} />
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredTeachers?.length === 0 &&
                  <div className="text-center py-12">
                    <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No teachers found</p>
                  </div>
                }
              </>
            )}

            {totalPages > 1 &&
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTeachers?.length)} of {filteredTeachers?.length} teachers
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    iconName="ChevronLeft" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    iconName="ChevronRight" />
                </div>
              </div>
            }
          </div>
        </div>
      </main>

      <AddTeacherModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedTeacher(null);
        }}
        onSubmit={handleAddTeacher}
        teacher={selectedTeacher}
        classOptions={classOptions}
        subjectOptions={subjectOptions} />

      <ViewTeacherModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher} />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTeacher(null);
        }}
        onConfirm={handleConfirmDelete}
        teacherName={selectedTeacher?.name} />
    </div>
  );
};

export default TeachersManagement;
