import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import ClassSelector from './components/ClassSelector';
import AttendanceStats from './components/AttendanceStats';
import StudentRoster from './components/StudentRoster';
import AttendanceHistory from './components/AttendanceHistory';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import attendanceService from '../../services/attendanceService';
import classService from '../../services/classService';
import api from '../../services/api';

const AttendanceManagement = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [attendance, setAttendance] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Detect user role from localStorage
  const getUserRole = () => {
    const storedRole = localStorage.getItem('userRole');
    return storedRole || 'teacher';
  };

  const userRole = getUserRole();
  const isAdmin = userRole === 'admin';



  const dashboardPath = isAdmin ? '/admin-dashboard' : userRole === 'student' ? '/student-dashboard' : '/teacher-dashboard';
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : userRole === 'student' ? 'Student Dashboard' : 'Teacher Dashboard';
  const breadcrumbItems = [
    { label: dashboardLabel, path: dashboardPath },
    { label: 'Attendance', path: '/attendance-management' }
  ];


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForClass(selectedClass);
      setAttendance({});
      setIsSaved(false);
    }
  }, [selectedClass, selectedDate]);

  const fetchStudentsForClass = async (classId) => {
    try {
      const studentsRes = await api.get('/students', { params: { classId, limit: 100 } });
      const classStudents = (studentsRes.data || []).map(s => ({
        id: s._id,
        name: s.name || 'Unknown',
        studentId: s.studentId || '-',
        email: s.email || ''
      }));
      setStudents(classStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user info to filter by teacher's classes
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const teacherId = user.profileId;

      let classesData = [];

      if (!isAdmin && userRole === 'teacher' && teacherId) {
        // For teachers: get classes from their timetable
        const timetableRes = await api.get('/timetables', { params: { teacherId, limit: 500 } });
        const timetables = timetableRes.data || [];

        // Extract unique classes
        const classMap = new Map();
        timetables.forEach(t => {
          if (t.classId?._id) classMap.set(t.classId._id, t.classId.name);
        });
        classesData = Array.from(classMap, ([id, name]) => ({ _id: id, name }));
      } else {
        // For admins: get all classes
        classesData = await classService.getAll();
      }

      const formattedClasses = classesData.map(cls => ({
        value: cls._id || cls.id,
        label: cls.name || cls.grade || 'Unknown Class'
      }));
      setClasses(formattedClasses);

      // Fetch attendance history
      const attendanceData = await attendanceService.getAll();

      if (Array.isArray(attendanceData)) {
        const formattedHistory = attendanceData.map(record => ({
          date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
          status: record.status || 'present',
          presentCount: record.presentCount || 0,
          absentCount: record.absentCount || 0,
          lateCount: record.lateCount || 0
        }));
        setAttendanceHistory(formattedHistory);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      setClasses([]);
      setStudents([]);
      setAttendanceHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status
    }));
    setIsSaved(false);
  };

  const handleBulkMark = (status) => {
    const bulkAttendance = {};
    students?.forEach((student) => {
      bulkAttendance[student.id] = status;
    });
    setAttendance(bulkAttendance);
    setIsSaved(false);
  };

  const handleSaveAttendance = () => {
    console.log('Saving attendance:', { class: selectedClass, date: selectedDate, attendance });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportReport = () => {
    console.log('Exporting attendance report');
  };

  const calculateStats = () => {
    const totalStudents = students?.length;
    const present = Object.values(attendance)?.filter((s) => s === 'present')?.length;
    const absent = Object.values(attendance)?.filter((s) => s === 'absent')?.length;
    const late = Object.values(attendance)?.filter((s) => s === 'late')?.length;
    const attendanceRate = totalStudents > 0 ? Math.round(present / totalStudents * 100) : 0;

    return { totalStudents, present, absent, late, attendanceRate };
  };

  const stats = calculateStats();
  const hasUnsavedChanges = Object.keys(attendance)?.length > 0 && !isSaved;

  const SidebarComponent = isAdmin ? AdminSidebar : userRole === 'student' ? StudentSidebar : TeacherSidebar;
  const userName = isAdmin ? 'Admin User' : 'Dr. Sarah Mitchell';
  const userRoleDisplay = isAdmin ? 'Administrator' : 'Mathematics Teacher';

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6">
            <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SidebarComponent
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <AuthHeader
        userName={userName}
        userRole={userRoleDisplay} />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Attendance Management
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Mark and track student attendance for your classes
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={showHistory ? 'default' : 'outline'}
                iconName="Calendar"
                iconPosition="left"
                onClick={() => setShowHistory(!showHistory)}>

                {showHistory ? 'Hide History' : 'View History'}
              </Button>
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={handleExportReport}>

                Export Report
              </Button>
            </div>
          </div>

          {isSaved &&
            <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-xl flex items-center gap-3">
              <Icon name="CheckCircle" size={20} color="var(--color-success)" />
              <span className="text-sm font-medium text-success">
                Attendance saved successfully for {selectedDate}
              </span>
            </div>
          }

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchData}>Retry</Button>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-6">
              <ClassSelector
                selectedClass={selectedClass}
                onClassChange={setSelectedClass}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                classes={classes} />


              {selectedClass &&
                <>
                  <AttendanceStats stats={stats} />

                  <StudentRoster
                    students={students}
                    attendance={attendance}
                    onAttendanceChange={handleAttendanceChange}
                    onBulkMark={handleBulkMark} />


                  {hasUnsavedChanges &&
                    <div className="sticky bottom-6 z-10">
                      <div className="bg-card border border-border rounded-xl shadow-elevation-3 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                            <Icon name="AlertCircle" size={20} color="var(--color-warning)" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Unsaved Changes</p>
                            <p className="text-sm text-muted-foreground">
                              You have marked attendance for {Object.keys(attendance)?.length} students
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="default"
                          iconName="Save"
                          iconPosition="left"
                          onClick={handleSaveAttendance}>

                          Save Attendance
                        </Button>
                      </div>
                    </div>
                  }

                  {showHistory &&
                    <AttendanceHistory history={attendanceHistory} />
                  }
                </>
              }

              {!selectedClass &&
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="ClipboardCheck" size={32} color="var(--color-primary)" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Select a Class to Begin
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose a class and date from the selector above to start marking attendance for your students
                  </p>
                </div>
              }
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceManagement;