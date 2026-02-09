import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import AcademicSummaryCard from './components/AcademicSummaryCard';
import ScheduleCard from './components/ScheduleCard';
import AnnouncementCard from './components/AnnouncementCard';
import PerformanceChart from './components/PerformanceChart';
import Icon from '../../components/AppIcon';
import studentService from '../../services/studentService';
import timetableService from '../../services/timetableService';
import api from '../../services/api';

const StudentDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);

  const userName = localStorage.getItem('userName') || 'Student';
  const userRole = 'Student';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const profileId = user.profileId;

      if (!profileId) {
        setError('No student profile found');
        return;
      }

      const res = await Promise.allSettled([
        studentService.getById(profileId),
        studentService.getStudentResults(profileId),
        studentService.getStudentFees(profileId),
        api.get('/notices', { params: { target: 'Students', limit: 1000 } })
      ]);

      let studentData = null;
      if (res[0].status === 'fulfilled') {
        studentData = res[0].value;
        setStudent(studentData);
      }

      if (res[1].status === 'fulfilled') {
        const r = res[1].value;
        setResults(Array.isArray(r) ? r : []);
      }

      if (res[2].status === 'fulfilled') {
        const f = res[2].value;
        setFees(Array.isArray(f) ? f : []);
      }

      if (res[3].status === 'fulfilled') {
        const n = res[3].value.data;
        setNotices(Array.isArray(n) ? n : []);
      }

      // Fetch timetable using student's classId
      if (studentData?.classId) {
        const classId = studentData.classId._id || studentData.classId;
        try {
          const tt = await timetableService.getByClass(classId);
          setTimetable(Array.isArray(tt) ? tt : []);
        } catch (err) {
          console.error('Failed to fetch timetable:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate academic summary
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length)
    : 0;
  const totalSubjects = new Set(results.map(r => r.examId?.subjectId || r.subjectId)).size;
  const passedExams = results.filter(r => r.isPassed).length;

  const totalFeesAmount = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
  const paidFeesAmount = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const pendingFees = totalFeesAmount - paidFeesAmount;

  const academicSummary = [
    {
      icon: 'Award',
      title: 'Average Score',
      value: `${avgScore}%`,
      subtitle: `${results.length} exams taken`,
      trend: avgScore >= 60 ? { type: 'up', value: 'Pass' } : results.length > 0 ? { type: 'down', value: 'Needs work' } : null,
      color: 'primary'
    },
    {
      icon: 'BookOpen',
      title: 'Subjects',
      value: totalSubjects,
      subtitle: 'This semester',
      color: 'secondary'
    },
    {
      icon: 'CheckCircle',
      title: 'Exams Passed',
      value: `${passedExams}/${results.length}`,
      subtitle: results.length > 0 ? `${Math.round(passedExams / results.length * 100)}% pass rate` : 'No exams yet',
      color: 'success'
    },
    {
      icon: 'CreditCard',
      title: 'Pending Fees',
      value: pendingFees > 0 ? `${pendingFees.toLocaleString()}` : '0',
      subtitle: pendingFees > 0 ? 'FCFA outstanding' : 'All fees paid',
      trend: pendingFees > 0 ? { type: 'down', value: 'Due' } : { type: 'up', value: 'Clear' },
      color: pendingFees > 0 ? 'warning' : 'success'
    }
  ];

  // Today's schedule from timetable
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  const todaySchedule = (timetable || [])
    .filter(t => t.day === today)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .map((t, i) => ({
      id: t._id || String(i),
      subject: t.subjectId?.name || t.subject || 'Unknown',
      teacher: t.teacherId?.name || '',
      time: t.startTime && t.endTime ? `${t.startTime} - ${t.endTime}` : t.startTime || '',
      room: t.room || '',
      status: 'upcoming'
    }));

  // Announcements from notices
  const announcements = (notices || []).slice(0, 5).map((n, i) => ({
    id: n._id || String(i),
    type: n.priority === 'High' ? 'exam' : 'general',
    title: n.title,
    content: n.content,
    author: n.author || 'Administration',
    date: n.publishDate || n.createdAt,
    isNew: i === 0
  }));

  // Performance chart data from results (group by subject)
  const subjectMap = {};
  results.forEach(r => {
    const subName = r.examId?.subjectId?.name || r.examId?.title?.split(' - ')?.[1] || 'Exam';
    const shortName = subName.length > 10 ? subName.substring(0, 10) + '...' : subName;
    if (!subjectMap[shortName]) {
      subjectMap[shortName] = { total: 0, count: 0 };
    }
    subjectMap[shortName].total += (r.percentage || 0);
    subjectMap[shortName].count += 1;
  });
  const performanceData = Object.entries(subjectMap).slice(0, 8).map(([name, data]) => ({
    month: name,
    grade: Math.round(data.total / data.count),
    attendance: 0
  }));

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/student-dashboard' }
  ];

  const LoadingSkeleton = ({ className }) => (
    <div className={`animate-pulse bg-muted rounded ${className}`}></div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <AuthHeader userName={userName} userRole={userRole} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="main-content-inner">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <StudentSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <AuthHeader userName={userName} userRole={userRole} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="main-content-inner">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <AuthHeader userName={userName} userRole={userRole} />
      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              Welcome back, {userName?.split(' ')?.[0]}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {student?.classId?.name ? `${student.classId.name}` : ''}{student?.sectionId?.name ? ` - ${student.sectionId.name}` : ''}
              {' '}&mdash; Here's your academic overview
            </p>
          </div>

          {/* Academic Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {academicSummary.map((card, i) => (
              <AcademicSummaryCard key={i} {...card} />
            ))}
          </div>

          {/* Performance Chart + Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2">
              {performanceData.length > 0 ? (
                <PerformanceChart data={performanceData} />
              ) : (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Performance by Subject</h3>
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <div className="text-center">
                      <Icon name="BarChart3" size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No exam results yet</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <ScheduleCard schedule={todaySchedule} />
            </div>
          </div>

          {/* Fees Summary + Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-20 lg:mb-6">
            {/* Fees Summary */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Fee Summary</h3>
                <a href="/finance-overview" className="text-sm text-primary hover:text-primary/80">View all</a>
              </div>
              {fees.length > 0 ? (
                <div className="space-y-3">
                  {fees.slice(0, 5).map((fee, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{fee.feeTypeId?.name || 'Fee'}</p>
                        <p className="text-xs text-muted-foreground">
                          {fee.paidAmount?.toLocaleString()} / {fee.totalAmount?.toLocaleString()} FCFA
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        fee.status === 'Paid' ? 'bg-success/10 text-success' :
                        fee.status === 'Partially Paid' ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        {fee.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <Icon name="CreditCard" size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No fee records found</p>
                  </div>
                </div>
              )}
            </div>

            {/* Announcements */}
            <AnnouncementCard announcements={announcements} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
