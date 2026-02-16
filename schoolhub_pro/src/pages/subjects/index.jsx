import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import SubjectCard from './components/SubjectCard';
import AddSubjectModal from './components/AddSubjectModal';
import ViewSubjectModal from './components/ViewSubjectModal';
import subjectService from '../../services/subjectService';
import classService from '../../services/classService';

const Subjects = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role === 'super_admin' ? 'admin' : (storedUser.role || 'student');
  const SidebarComponent = userRole === 'admin' ? AdminSidebar : TeacherSidebar;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  // API Data States
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subjectsData, classesData] = await Promise.all([
        subjectService.getAll(),
        classService.getAll()
      ]);

      const formattedClasses = classesData.map(cls => ({
        value: cls._id || cls.id,
        label: cls.name
      }));
      setClasses(formattedClasses);

      const formattedSubjects = subjectsData.map(subject => ({
        id: subject._id || subject.id,
        name: subject.name,
        code: subject.code,
        classId: subject.classId?._id || subject.classId,
        className: subject.classId?.name || 'N/A',
        description: subject.description || '',
        chapters: subject.chapters || [],
        teachersAssigned: subject.teachersAssigned || 0,
        studentsEnrolled: subject.studentsEnrolled || 0,
        totalChapters: subject.chapters?.length || 0,
        hoursPerWeek: subject.hoursPerWeek || 0
      }));
      setSubjects(formattedSubjects);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load subjects');
      setSubjects([]);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects?.filter(subject => {
    const matchesSearch = subject?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      subject?.code?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      subject?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesClass = selectedClass === 'all' || subject?.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleSubjectSubmit = async (formData) => {
    try {
      const { id, ...payload } = formData;
      if (id) {
        await subjectService.update(id, payload);
      } else {
        await subjectService.create(payload);
      }
      setShowAddModal(false);
      setEditingSubject(null);
      fetchData();
    } catch (err) {
      console.error('Error saving subject:', err);
      alert('Failed to save subject');
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setShowAddModal(true);
  };

  const handleDeleteSubject = async (subject) => {
    if (window.confirm(`Are you sure you want to delete "${subject.name}"?`)) {
      try {
        await subjectService.delete(subject.id);
        fetchData();
      } catch (err) {
        console.error('Error deleting subject:', err);
        alert('Failed to delete subject');
      }
    }
  };

  const handleViewSubject = (subject) => {
    setSelectedSubject(subject);
    setShowViewModal(true);
  };



  const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : '/teacher-dashboard';
  const breadcrumbItems = [
    { label: 'Dashboard', path: dashboardPath },
    { label: 'Subjects', path: '/subjects' }
  ];

  const stats = {
    totalSubjects: subjects?.length,
    totalClasses: [...new Set(subjects?.map(s => s?.classId))]?.length,
    totalTeachers: subjects?.reduce((sum, s) => sum + (s?.teachersAssigned || 0), 0),
    totalStudents: subjects?.reduce((sum, s) => sum + (s?.studentsEnrolled || 0), 0)
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SidebarComponent
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <AuthHeader />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                Subjects Management
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage syllabus, chapters, and descriptions per subject & class
              </p>
            </div>
            {userRole === 'admin' && (
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => { setEditingSubject(null); setShowAddModal(true); }}
              >
                Add Subject
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchData}>Retry</Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Book" size={20} className="text-primary" />
                <span className="text-2xl font-semibold text-foreground">{stats?.totalSubjects}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Subjects</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="BookOpen" size={20} className="text-blue-600" />
                <span className="text-2xl font-semibold text-foreground">{stats?.totalClasses}</span>
              </div>
              <p className="text-sm text-muted-foreground">Classes Covered</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="UserCheck" size={20} className="text-green-600" />
                <span className="text-2xl font-semibold text-foreground">{stats?.totalTeachers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Teachers Assigned</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Users" size={20} className="text-orange-600" />
                <span className="text-2xl font-semibold text-foreground">{stats?.totalStudents}</span>
              </div>
              <p className="text-sm text-muted-foreground">Students Enrolled</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search subjects by name, code, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  iconName="Search"
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  options={[{ value: 'all', label: 'All Classes' }, ...classes]}
                  value={selectedClass}
                  onChange={setSelectedClass}
                  placeholder="Filter by class"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSubjects?.map(subject => (
                <SubjectCard
                  key={subject?.id}
                  subject={subject}
                  onView={handleViewSubject}
                  onEdit={handleEditSubject}
                  onDelete={handleDeleteSubject}
                />
              ))}
            </div>
          )}

          {!loading && filteredSubjects?.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No subjects found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || selectedClass !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first subject'}
              </p>
              {!searchQuery && selectedClass === 'all' && userRole === 'admin' && (
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => { setEditingSubject(null); setShowAddModal(true); }}
                >
                  Add Subject
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <AddSubjectModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingSubject(null); }}
        onSubmit={handleSubjectSubmit}
        classes={classes}
        editingSubject={editingSubject}
      />

      <ViewSubjectModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        subject={selectedSubject}
      />
    </div>
  );
};

export default Subjects;
