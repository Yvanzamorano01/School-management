import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import ExamCard from './components/ExamCard';
import CreateExamModal from './components/CreateExamModal';
import EnterMarksModal from './components/EnterMarksModal';
import ViewResultsModal from './components/ViewResultsModal';
import examService from '../../services/examService';
import classService from '../../services/classService';
import subjectService from '../../services/subjectService';

const Exams = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Role detection
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role === 'super_admin' ? 'admin' : (storedUser.role || 'student');
  const SidebarComponent = userRole === 'admin' ? AdminSidebar : TeacherSidebar;
  const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : '/teacher-dashboard';

  const breadcrumbItems = [
    { label: 'Dashboard', path: dashboardPath },
    { label: 'Exams', path: '/exams' }
  ];

  useEffect(() => {
    fetchReferenceData();
    fetchExams();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [classesData, subjectsData] = await Promise.all([
        classService.getAll(),
        subjectService.getAll()
      ]);
      setClasses(classesData.map(c => ({ value: c._id || c.id, label: c.name })));
      setSubjects(subjectsData.map(s => ({ value: s._id || s.id, label: s.name })));
    } catch (err) {
      console.error('Error loading reference data:', err);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examService.getAll();
      setExams(data || []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setError('Failed to load exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const subjectName = exam.subjectId?.name || '';
    const className = exam.classId?.name || '';
    const matchesSearch = exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const classIdVal = exam.classId?._id || exam.classId;
    const subjectIdVal = exam.subjectId?._id || exam.subjectId;
    const matchesClass = selectedClass === 'all' || classIdVal === selectedClass;
    const matchesSubject = selectedSubject === 'all' || subjectIdVal === selectedSubject;
    return matchesSearch && matchesClass && matchesSubject;
  });

  const handleCreateExam = async (newExam) => {
    try {
      await examService.create(newExam);
      setShowCreateModal(false);
      fetchExams();
    } catch (err) {
      console.error('Failed to create exam:', err);
      alert(err?.response?.data?.message || 'Failed to create exam');
    }
  };

  const handleEnterMarks = (exam) => {
    setSelectedExam(exam);
    setShowMarksModal(true);
  };

  const handleViewResults = (exam) => {
    setSelectedExam(exam);
    setShowResultsModal(true);
  };

  const completedExams = exams.filter(e => e.status === 'completed');
  const stats = {
    totalExams: exams.length,
    upcomingExams: exams.filter(e => e.status === 'upcoming').length,
    completedExams: completedExams.length,
    ongoingExams: exams.filter(e => e.status === 'ongoing').length
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarComponent isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AuthHeader onLogout={() => { localStorage.clear(); window.location.href = '/'; }} />
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-1">Exams Management</h1>
                <p className="text-sm text-muted-foreground">Create exams, enter marks, and view results</p>
              </div>
{userRole === 'admin' && (
                <Button iconName="Plus" iconPosition="left" onClick={() => setShowCreateModal(true)}>
                  Create Exam
                </Button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                <Icon name="AlertCircle" size={20} className="text-error" />
                <p className="text-sm text-error">{error}</p>
                <Button variant="ghost" size="sm" onClick={fetchExams}>Retry</Button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="FileText" size={20} className="text-primary" />
                  <span className="text-2xl font-semibold text-foreground">{stats.totalExams}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Clock" size={20} className="text-blue-600" />
                  <span className="text-2xl font-semibold text-foreground">{stats.upcomingExams}</span>
                </div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="PlayCircle" size={20} className="text-orange-600" />
                  <span className="text-2xl font-semibold text-foreground">{stats.ongoingExams}</span>
                </div>
                <p className="text-sm text-muted-foreground">Ongoing</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="CheckCircle2" size={20} className="text-green-600" />
                  <span className="text-2xl font-semibold text-foreground">{stats.completedExams}</span>
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search exams by title or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    iconName="Search"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    options={[{ value: 'all', label: 'All Classes' }, ...classes]}
                    value={selectedClass}
                    onChange={setSelectedClass}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    options={[{ value: 'all', label: 'All Subjects' }, ...subjects]}
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                  />
                </div>
              </div>
            </div>

            {/* Exam List */}
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                    <div className="h-6 w-3/4 bg-muted rounded mb-4" />
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredExams.map(exam => (
                    <ExamCard
                      key={exam._id || exam.id}
                      exam={exam}
                      onEnterMarks={handleEnterMarks}
                      onViewResults={handleViewResults}
                    />
                  ))}
                </div>
                {filteredExams.length === 0 && (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No exams found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || selectedClass !== 'all' || selectedSubject !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Get started by creating your first exam'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <CreateExamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateExam}
        classes={classes}
        subjects={subjects}
      />

      {showMarksModal && (
        <EnterMarksModal
          isOpen={showMarksModal}
          onClose={() => { setShowMarksModal(false); setSelectedExam(null); }}
          exam={selectedExam}
          onSaved={fetchExams}
        />
      )}

      {showResultsModal && (
        <ViewResultsModal
          isOpen={showResultsModal}
          onClose={() => { setShowResultsModal(false); setSelectedExam(null); }}
          exam={selectedExam}
        />
      )}
    </div>
  );
};

export default Exams;
