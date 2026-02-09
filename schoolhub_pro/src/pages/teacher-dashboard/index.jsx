import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import ClassCard from './components/ClassCard';
import ScheduleCard from './components/ScheduleCard';
import QuickActionCard from './components/QuickActionCard';
import NoticeCard from './components/NoticeCard';
import StatCard from './components/StatCard';
import teacherService from '../../services/teacherService';
import timetableService from '../../services/timetableService';
import studentService from '../../services/studentService';
import examService from '../../services/examService';
import api from '../../services/api';

const TeacherDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userName = localStorage.getItem('userName') || 'Teacher';
  const userRole = 'Teacher';

  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [exams, setExams] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const profileId = user.profileId;

      if (!profileId) {
        console.error('No profileId found');
        return;
      }

      const results = await Promise.allSettled([
        teacherService.getById(profileId),
        timetableService.getAll({ teacherId: profileId }),
        api.get('/notices', { params: { target: 'Teachers', limit: 1000 } }),
        examService.getAll(),
        studentService.getAll()
      ]);

      if (results[0].status === 'fulfilled') {
        setTeacher(results[0].value);
      }

      if (results[1].status === 'fulfilled') {
        setTimetable(results[1].value);
      }

      if (results[2].status === 'fulfilled') {
        const noticesData = results[2].value.data;
        setNotices(Array.isArray(noticesData) ? noticesData : []);
      }

      if (results[3].status === 'fulfilled') {
        const examsData = results[3].value;
        setExams(Array.isArray(examsData) ? examsData : []);
      }

      if (results[4].status === 'fulfilled') {
        const students = results[4].value;
        setTotalStudents(Array.isArray(students) ? students.length : 0);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const teacherClassIds = teacher?.classIds?.map(c => c._id || c.id || c) || [];
  const upcomingExamsCount = (exams || []).filter(exam => {
    const isUpcoming = exam.status === 'upcoming';
    const isTeacherClass = teacherClassIds.includes(exam.classId?._id || exam.classId);
    return isUpcoming && isTeacherClass;
  }).length;

  const statsData = [
    {
      label: "My Classes",
      value: teacher?.classIds?.length || 0,
      icon: "BookOpen",
      bgColor: "bg-primary/10",
      iconColor: "var(--color-primary)",
      subtitle: "This semester"
    },
    {
      label: "My Subjects",
      value: teacher?.subjects?.length || 0,
      icon: "Book",
      bgColor: "bg-secondary/10",
      iconColor: "var(--color-secondary)",
      subtitle: "Teaching"
    },
    {
      label: "Upcoming Exams",
      value: upcomingExamsCount,
      icon: "FileText",
      bgColor: "bg-warning/10",
      iconColor: "var(--color-warning)",
      subtitle: "To prepare"
    },
    {
      label: "Notices",
      value: notices?.length || 0,
      icon: "Bell",
      bgColor: "bg-success/10",
      iconColor: "var(--color-success)",
      subtitle: "For teachers"
    }
  ];

  const classesForDisplay = (teacher?.classIds || []).map(cls => ({
    subject: (teacher.subjects || []).join(', '),
    grade: cls.name || 'Unknown',
    section: '',
    status: 'active',
    studentCount: 0,
    classesPerWeek: 0,
    recentActivity: ''
  }));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  const todaySchedule = (timetable || [])
    .filter(t => t.day === today)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .map(t => ({
      time: t.startTime || '',
      subject: t.subjectId?.name || t.subject || '',
      room: t.room || '',
      grade: t.classId?.name || '',
      duration: t.startTime && t.endTime ? `${t.startTime} - ${t.endTime}` : '',
      studentCount: 0
    }));

  const noticesForDisplay = (notices || []).slice(0, 5).map(n => ({
    title: n.title,
    type: n.priority === 'High' ? 'urgent' : n.priority === 'Normal' ? 'important' : 'general',
    message: n.content,
    from: n.author || 'Administration',
    date: n.publishDate || n.createdAt
  }));

  const quickActions = [
    {
      title: "Mark Attendance",
      description: "Record student attendance for today's classes",
      icon: "ClipboardCheck",
      bgColor: "bg-primary/10",
      iconColor: "var(--color-primary)",
      path: "/attendance-management"
    },
    {
      title: "Upload Materials",
      description: "Add new course materials and resources",
      icon: "Upload",
      bgColor: "bg-secondary/10",
      iconColor: "var(--color-secondary)",
      path: "/course-materials"
    },
    {
      title: "Enter Grades",
      description: "Record exam marks and assignment scores",
      icon: "Award",
      bgColor: "bg-success/10",
      iconColor: "var(--color-success)",
      path: "/exams"
    },
    {
      title: "Create Exam",
      description: "Set up new examination and assessment",
      icon: "FileText",
      bgColor: "bg-warning/10",
      iconColor: "var(--color-warning)",
      path: "/exams"
    }
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/teacher-dashboard' }
  ];

  const LoadingSkeleton = ({ className }) => (
    <div className={`animate-pulse bg-muted rounded ${className}`}></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <TeacherSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <AuthHeader
        userName={userName}
        userRole={userRole}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Welcome back, {userName?.split(' ')?.[0]}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Here's what's happening with your classes today
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card rounded-xl border border-border p-6">
                  <LoadingSkeleton className="h-4 w-24 mb-4" />
                  <LoadingSkeleton className="h-8 w-32 mb-2" />
                  <LoadingSkeleton className="h-3 w-20" />
                </div>
              ))
            ) : (
              statsData?.map((stat, index) => (
                <StatCard key={index} stat={stat} />
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-foreground">My Classes</h2>
                  <span className="text-sm text-muted-foreground">{classesForDisplay?.length} active classes</span>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="bg-card rounded-xl border border-border p-6">
                        <LoadingSkeleton className="h-5 w-40 mb-3" />
                        <LoadingSkeleton className="h-4 w-32 mb-2" />
                        <LoadingSkeleton className="h-4 w-full mb-4" />
                        <LoadingSkeleton className="h-3 w-48" />
                      </div>
                    ))}
                  </div>
                ) : classesForDisplay?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {classesForDisplay?.map((classItem, index) => (
                      <ClassCard key={index} classData={classItem} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border p-6 text-center">
                    <p className="text-muted-foreground">No classes assigned</p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {quickActions?.map((action, index) => (
                    <QuickActionCard key={index} action={action} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Today's Schedule</h2>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-card rounded-xl border border-border p-4">
                        <LoadingSkeleton className="h-4 w-16 mb-2" />
                        <LoadingSkeleton className="h-5 w-40 mb-2" />
                        <LoadingSkeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                ) : todaySchedule?.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedule?.map((schedule, index) => (
                      <ScheduleCard key={index} schedule={schedule} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <p className="text-muted-foreground">No classes scheduled for today</p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Important Notices</h2>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-card rounded-xl border border-border p-4">
                        <LoadingSkeleton className="h-4 w-40 mb-2" />
                        <LoadingSkeleton className="h-3 w-full mb-2" />
                        <LoadingSkeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                ) : noticesForDisplay?.length > 0 ? (
                  <div className="space-y-3">
                    {noticesForDisplay?.map((notice, index) => (
                      <NoticeCard key={index} notice={notice} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <p className="text-muted-foreground">No notices available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
