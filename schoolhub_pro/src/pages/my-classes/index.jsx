import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import classService from '../../services/classService';
import api from '../../services/api';

const MyClasses = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classes, setClasses] = useState([]);

    const userName = localStorage.getItem('userName') || 'Teacher';
    const userRole = 'Teacher';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/teacher-dashboard' },
        { label: 'My Classes', path: '/my-classes' }
    ];

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const teacherId = user.profileId;

            if (!teacherId) {
                setError('No teacher profile found. Please log out and log in again.');
                return;
            }

            // Get timetable entries to find classes this teacher teaches
            const timetableRes = await api.get('/timetables', { params: { teacherId, limit: 500 } });
            const timetables = timetableRes.data || [];

            // Extract unique class IDs
            const classIds = [...new Set(timetables.map(t => t.classId?._id || t.classId).filter(Boolean))];

            // Get all classes and filter to teacher's classes
            const allClasses = await classService.getAll();
            const teacherClasses = allClasses.filter(c => classIds.includes(c._id));

            // Get students to count per class
            const studentsRes = await api.get('/students', { params: { limit: 500 } });
            const allStudents = studentsRes.data || [];

            // Enrich with subjects taught and actual student count
            const enrichedClasses = teacherClasses.map(cls => {
                const classEntries = timetables.filter(t => (t.classId?._id || t.classId) === cls._id);
                const subjectsTaught = [...new Set(classEntries.map(t => t.subjectId?.name || 'Unknown'))];
                const sessionsPerWeek = classEntries.length;

                // Count students in this class
                const studentsInClass = allStudents.filter(s =>
                    (s.classId?._id || s.classId) === cls._id
                ).length;

                return {
                    ...cls,
                    subjectsTaught,
                    sessionsPerWeek,
                    studentCount: studentsInClass
                };
            });

            setClasses(enrichedClasses);
        } catch (err) {
            console.error('Error fetching classes:', err);
            setError(err.message || 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                    <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <TeacherSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <AuthHeader userName={userName} userRole={userRole} />

            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="main-content-inner">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">My Classes</h1>
                        <p className="text-sm md:text-base text-muted-foreground">View classes you are assigned to teach</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error flex-1">{error}</p>
                            <button onClick={fetchClasses} className="text-sm text-error hover:underline">Retry</button>
                        </div>
                    )}

                    {loading ? (
                        <LoadingSkeleton />
                    ) : classes.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No classes assigned</h3>
                            <p className="text-sm text-muted-foreground">You don't have any classes assigned yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((cls) => (
                                <div key={cls._id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Icon name="Users" size={24} className="text-primary" />
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                                            Active
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-foreground mb-2">{cls.name}</h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Icon name="Users" size={14} />
                                            <span>{cls.studentCount} students</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Icon name="Calendar" size={14} />
                                            <span>{cls.sessionsPerWeek} sessions/week</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <p className="text-xs text-muted-foreground mb-2">Subjects you teach:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {cls.subjectsTaught.map((subject, idx) => (
                                                <span key={idx} className="px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyClasses;
