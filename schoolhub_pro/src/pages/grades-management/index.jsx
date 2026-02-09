import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const GradesManagement = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState({});

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedExam, setSelectedExam] = useState('');

    const userName = localStorage.getItem('userName') || 'Teacher';
    const userRole = 'Teacher';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/teacher-dashboard' },
        { label: 'Grades Management', path: '/grades-management' }
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSubject && selectedExam) {
            fetchStudentsAndGrades();
        }
    }, [selectedClass, selectedSubject, selectedExam]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const teacherId = user.profileId;

            if (!teacherId) {
                setError('No teacher profile found.');
                return;
            }

            // Get teacher's timetable to find classes and subjects
            const timetableRes = await api.get('/timetables', { params: { teacherId, limit: 500 } });
            const timetables = timetableRes.data || [];

            // Extract unique classes
            const classMap = new Map();
            const subjectMap = new Map();
            timetables.forEach(t => {
                if (t.classId?._id) classMap.set(t.classId._id, t.classId.name);
                if (t.subjectId?._id) subjectMap.set(t.subjectId._id, t.subjectId.name);
            });

            setClasses(Array.from(classMap, ([id, name]) => ({ _id: id, name })));
            setSubjects(Array.from(subjectMap, ([id, name]) => ({ _id: id, name })));

            // Get exams
            const examsRes = await api.get('/exams', { params: { limit: 100 } });
            setExams(examsRes.data || []);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentsAndGrades = async () => {
        try {
            // Get students in selected class
            const studentsRes = await api.get('/students', { params: { classId: selectedClass, limit: 100 } });
            const classStudents = studentsRes.data || [];
            setStudents(classStudents);

            // Try to get existing results
            try {
                const resultsRes = await api.get('/results', {
                    params: { examId: selectedExam, subjectId: selectedSubject }
                });
                const existingResults = resultsRes.data || [];

                // Map existing grades
                const gradesMap = {};
                existingResults.forEach(r => {
                    const studentId = r.studentId?._id || r.studentId;
                    if (studentId) {
                        gradesMap[studentId] = r.marks || '';
                    }
                });
                setGrades(gradesMap);
            } catch {
                setGrades({});
            }
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const handleGradeChange = (studentId, value) => {
        setGrades(prev => ({ ...prev, [studentId]: value }));
        setSuccess(null);
    };

    const handleSaveGrades = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const results = students.map(student => ({
                studentId: student._id,
                examId: selectedExam,
                subjectId: selectedSubject,
                marks: parseFloat(grades[student._id]) || 0
            }));

            await api.post('/results/bulk', { results });
            setSuccess('Grades saved successfully!');
        } catch (err) {
            console.error('Error saving grades:', err);
            setError(err.message || 'Failed to save grades');
        } finally {
            setSaving(false);
        }
    };

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
        <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-muted rounded-lg"></div>
                ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-muted rounded mb-2"></div>
                ))}
            </div>
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
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Grades Management</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Enter and manage student grades</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-3">
                            <Icon name="CheckCircle" size={20} className="text-success" />
                            <p className="text-sm text-success">{success}</p>
                        </div>
                    )}

                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <>
                            {/* Filters */}
                            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-4">SELECT CLASS, SUBJECT & EXAM</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Class</label>
                                        <select
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                                        <select
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Exam</label>
                                        <select
                                            value={selectedExam}
                                            onChange={(e) => setSelectedExam(e.target.value)}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                                        >
                                            <option value="">Select Exam</option>
                                            {exams.map(e => (
                                                <option key={e._id} value={e._id}>{e.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Grades Table */}
                            {selectedClass && selectedSubject && selectedExam && (
                                <div className="bg-card border border-border rounded-xl overflow-hidden">
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{students.length} students</span>
                                        <Button
                                            onClick={handleSaveGrades}
                                            disabled={saving || students.length === 0}
                                            iconName={saving ? "Loader" : "Save"}
                                        >
                                            {saving ? 'Saving...' : 'Save Grades'}
                                        </Button>
                                    </div>

                                    {students.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground">No students found in this class</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-muted/50">
                                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Grade (0-100)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {students.map((student) => (
                                                        <tr key={student._id} className="border-b border-border">
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
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={grades[student._id] || ''}
                                                                    onChange={(e) => handleGradeChange(student._id, e.target.value)}
                                                                    placeholder="Enter grade"
                                                                    className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!selectedClass || !selectedSubject || !selectedExam ? (
                                <div className="bg-card border border-border rounded-xl p-12 text-center">
                                    <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Select filters to begin</h3>
                                    <p className="text-sm text-muted-foreground">Choose a class, subject, and exam to enter grades</p>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GradesManagement;
