import React, { useState, useMemo, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';
import StudentFilters from './components/StudentFilters';
import StudentTableRow from './components/StudentTableRow';
import StudentCard from './components/StudentCard';
import AddStudentModal from './components/AddStudentModal';
import ViewStudentModal from './components/ViewStudentModal';
import ManageClassModal from './components/ManageClassModal';
import BulkActionsBar from './components/BulkActionsBar';
import studentService from '../../services/studentService';
import classService from '../../services/classService';

const StudentsManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showManageClassModal, setShowManageClassModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API Data States
  const [studentsData, setStudentsData] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [filters, setFilters] = useState({
    class: '',
    section: '',
    status: '',
    search: ''
  });

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Graduated', label: 'Graduated' },
    { value: 'Transferred', label: 'Transferred' }
  ];

  // Role detection
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role === 'super_admin' ? 'admin' : (storedUser.role || 'student');
  const SidebarComponent = userRole === 'admin' ? AdminSidebar : TeacherSidebar;
  const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : '/teacher-dashboard';

  const breadcrumbItems = [
    { label: 'Dashboard', path: dashboardPath },
    { label: 'Students Management', path: '/students-management' }
  ];

  // Fetch students data
  useEffect(() => {
    fetchStudents();
    fetchClassesAndSections();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAll();
      // Transform API response to match component format
      const formattedStudents = data.map(student => ({
        id: student._id || student.id,
        studentId: student.studentId,
        name: student.name || 'N/A',
        photo: student.photo || null,
        photoAlt: `Photo of ${student.name || 'Student'}`,
        classId: student.classId?._id || student.classId,
        class: student.classId?.name || student.className || 'N/A',
        sectionId: student.sectionId?._id || student.sectionId,
        section: student.sectionId?.name || student.sectionName || 'N/A',
        status: student.status || 'Active',
        parentName: student.parentName || 'N/A',
        parentContact: student.parentContact || 'N/A',
        parentEmail: student.parentEmail || 'N/A',
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A',
        gender: student.gender || 'N/A',
        bloodGroup: student.bloodGroup || 'N/A',
        address: student.address || 'N/A',
        admissionDate: student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A',
        rollNumber: student.rollNumber || 'N/A',
        relationship: student.relationship || 'N/A'
      }));
      setStudentsData(formattedStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
      setStudentsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSections = async () => {
    try {
      const classes = await classService.getAll();
      const classArr = Array.isArray(classes) ? classes : [];
      setClassOptions(classArr.map(c => ({
        value: c._id,
        label: c.name
      })));

      const sections = await classService.getAllSections();
      const sectionArr = Array.isArray(sections) ? sections : [];
      // Build class name lookup
      const classMap = {};
      classArr.forEach(c => { classMap[c._id] = c.name; });

      setSectionOptions(sectionArr.map(s => {
        const className = classMap[s.classId?._id || s.classId] || '';
        return {
          value: s._id,
          label: className ? `${className} - ${s.name}` : s.name,
          classId: s.classId?._id || s.classId
        };
      }));
    } catch (err) {
      console.error('Error fetching classes:', err);
      setClassOptions([]);
      setSectionOptions([]);
    }
  };

  const filteredStudents = useMemo(() => {
    return studentsData?.filter((student) => {
      const matchesClass = !filters?.class || student?.classId === filters?.class;
      const matchesSection = !filters?.section || student?.sectionId === filters?.section;
      const matchesStatus = !filters?.status || student?.status === filters?.status;
      const matchesSearch = !filters?.search ||
        student?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        student?.studentId?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        student?.parentContact?.includes(filters?.search);

      return matchesClass && matchesSection && matchesStatus && matchesSearch;
    });
  }, [studentsData, filters]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents?.length / itemsPerPage);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      class: '',
      section: '',
      status: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(paginatedStudents?.map((s) => s?.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, studentId]);
    } else {
      setSelectedStudents((prev) => prev?.filter((id) => id !== studentId));
    }
  };

  const handleAddStudent = async (formData) => {
    try {
      setActionLoading(true);
      if (formData.id) {
        const { id, ...updateData } = formData;
        await studentService.update(id, updateData);
      } else {
        await studentService.create(formData);
      }
      setShowAddModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
      alert(formData.id ? 'Failed to update student.' : 'Failed to add student. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowAddModal(true);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleManageClass = (student) => {
    setSelectedStudent(student);
    setShowManageClassModal(true);
  };

  const handleManageClassSubmit = async ({ studentId, classId, sectionId }) => {
    try {
      setActionLoading(true);
      await studentService.update(studentId, { classId, sectionId });
      setShowManageClassModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Error updating class assignment:', err);
      alert('Failed to update class assignment. Please try again.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) return;
    try {
      setActionLoading(true);
      await studentService.delete(student.id);
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Failed to delete student. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)? This action cannot be undone.`)) return;
    try {
      setActionLoading(true);
      await Promise.all(selectedStudents.map(id => studentService.delete(id)));
      setSelectedStudents([]);
      fetchStudents();
    } catch (err) {
      console.error('Error deleting students:', err);
      alert('Failed to delete some students. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      setActionLoading(true);
      await studentService.bulkUpdateStatus(selectedStudents, status);
      setSelectedStudents([]);
      fetchStudents(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = () => {
    console.log('Promoting students:', selectedStudents);
    setSelectedStudents([]);
  };

  const handleExport = async () => {
    try {
      const blob = await studentService.exportStudents(selectedStudents);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Failed to export students.');
    }
  };

  const isAllSelected = paginatedStudents?.length > 0 &&
    paginatedStudents?.every((s) => selectedStudents?.includes(s?.id));

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 border-b border-border">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
          <div className="h-6 bg-muted rounded w-20" />
          <div className="h-6 bg-muted rounded w-16" />
          <div className="h-8 bg-muted rounded w-24" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SidebarComponent
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <AuthHeader
        userName="Admin User"
        userRole="Administrator"
        onLogout={() => console.log('Logout clicked')} />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                Students Management
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage student records, enrollment, and academic assignments
              </p>
            </div>
{userRole === 'admin' && (
              <Button
                onClick={() => {
                  setSelectedStudent(null);
                  setShowAddModal(true);
                }}
                iconName="Plus"
                iconPosition="left"
                className="w-full sm:w-auto">
                Add New Student
              </Button>
            )}
          </div>

          <StudentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            classOptions={classOptions}
            sectionOptions={sectionOptions}
            statusOptions={statusOptions} />

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchStudents}>
                Retry
              </Button>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="Users" size={20} className="text-primary" />
                <span className="text-sm md:text-base font-medium text-foreground">
                  {loading ? 'Loading...' : `${filteredStudents?.length} Students Found`}
                </span>
              </div>
              {selectedStudents?.length > 0 &&
                <span className="text-sm text-muted-foreground">
                  {selectedStudents?.length} selected
                </span>
              }
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <Checkbox
                            checked={isAllSelected}
                            onChange={(e) => handleSelectAll(e?.target?.checked)} />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Parent Contact
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents?.map((student) =>
                        <tr key={student?.id} className="border-b border-border hover:bg-muted/50 transition-colors duration-250">
                          <td className="px-4 py-4">
                            <Checkbox
                              checked={selectedStudents?.includes(student?.id)}
                              onChange={(e) => handleSelectStudent(student?.id, e?.target?.checked)} />
                          </td>
                          <StudentTableRow
                            student={student}
                            onEdit={handleEditStudent}
                            onView={handleViewStudent}
                            onManageClass={handleManageClass}
                            onDelete={userRole === 'admin' ? handleDeleteStudent : undefined} />
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden p-4 space-y-4">
                  {paginatedStudents?.map((student) =>
                    <div key={student?.id} className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedStudents?.includes(student?.id)}
                        onChange={(e) => handleSelectStudent(student?.id, e?.target?.checked)}
                        className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <StudentCard
                          student={student}
                          onEdit={handleEditStudent}
                          onView={handleViewStudent}
                          onManageClass={handleManageClass}
                          onDelete={userRole === 'admin' ? handleDeleteStudent : undefined} />
                      </div>
                    </div>
                  )}
                </div>

                {filteredStudents?.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No students found</p>
                  </div>
                )}
              </>
            )}

            {totalPages > 1 &&
              <div className="p-4 md:p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents?.length)} of {filteredStudents?.length} students
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    iconName="ChevronLeft">
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-250 ${currentPage === pageNum ?
                            'bg-primary text-primary-foreground' :
                            'text-foreground hover:bg-muted'}`
                          }>
                          {pageNum}
                        </button>);
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    iconName="ChevronRight"
                    iconPosition="right">
                    Next
                  </Button>
                </div>
              </div>
            }
          </div>
        </div>
      </main>
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleAddStudent}
        classOptions={classOptions}
        sectionOptions={sectionOptions}
        student={selectedStudent} />
      <ViewStudentModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent} />
      <ManageClassModal
        isOpen={showManageClassModal}
        onClose={() => {
          setShowManageClassModal(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleManageClassSubmit}
        student={selectedStudent}
        classOptions={classOptions}
        sectionOptions={sectionOptions} />
      <BulkActionsBar
        selectedCount={selectedStudents?.length}
        onPromote={handlePromote}
        onUpdateStatus={handleUpdateStatus}
        onExport={handleExport}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedStudents([])} />
    </div>
  );
};

export default StudentsManagement;
