import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import api from '../../services/api';

const MyStudents = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const userName = localStorage.getItem('userName') || 'Teacher';
    const userRole = 'Teacher';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/teacher-dashboard' },
        { label: 'My Students', path: '/my-students' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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

            // Extract unique class IDs and names
            const classMap = new Map();
            timetables.forEach(t => {
                const id = t.classId?._id || t.classId;
                const name = t.classId?.name || 'Unknown';
                if (id) classMap.set(id, name);
            });

            const teacherClasses = Array.from(classMap, ([id, name]) => ({ _id: id, name }));
            setClasses(teacherClasses);

            // Get students from these classes
            const classIds = Array.from(classMap.keys());
            if (classIds.length > 0) {
                const studentsRes = await api.get('/students', { params: { limit: 500 } });
                const allStudents = studentsRes.data || [];

                // Filter students by teacher's classes
                const filteredStudents = allStudents.filter(s =>
                    classIds.includes(s.classId?._id || s.classId)
                );

                setStudents(filteredStudents);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesClass = selectedClass === 'all' || (s.classId?._id || s.classId) === selectedClass;
        const matchesSearch = !searchQuery ||
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesClass && matchesSearch;
    });

    // Helper to get initials from full name
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name[0]?.toUpperCase() || '?';
    };

    const LoadingSkeleton = () => (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
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
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">My Students</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Students from your assigned classes</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error flex-1">{error}</p>
                            <button onClick={fetchData} className="text-sm text-error hover:underline">Retry</button>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-card border border-border rounded-xl p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                            >
                                <option value="all">All Classes</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingSkeleton />
                    ) : filteredStudents.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
                            <p className="text-sm text-muted-foreground">No students match your search criteria.</p>
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <span className="text-sm text-muted-foreground">{filteredStudents.length} students</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Class</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr key={student._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-primary">
                                                                {getInitials(student.name)}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium text-foreground">
                                                            {student.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-muted-foreground">{student.studentId || '-'}</td>
                                                <td className="py-4 px-4">
                                                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                                                        {student.classId?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-muted-foreground">{student.email || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyStudents;
