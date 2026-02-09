import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import attendanceService from '../../services/attendanceService';

const MyAttendance = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
    const [selectedMonth, setSelectedMonth] = useState('all');

    const userName = localStorage.getItem('userName') || 'Student';
    const userRole = 'Student';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/student-dashboard' },
        { label: 'My Attendance', path: '/my-attendance' }
    ];

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError(null);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const profileId = user.profileId;

            if (!profileId) {
                setError('No student profile found. Please log out and log in again.');
                return;
            }

            const data = await attendanceService.getByStudent(profileId);
            const records = Array.isArray(data) ? data : [];
            setAttendanceHistory(records);

            // Calculate stats
            const total = records.length;
            const present = records.filter(r => r.status === 'present').length;
            const absent = records.filter(r => r.status === 'absent').length;
            const late = records.filter(r => r.status === 'late').length;
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;
            setStats({ total, present, absent, late, rate });
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError(err.message || 'Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            present: 'bg-success/10 text-success',
            absent: 'bg-error/10 text-error',
            late: 'bg-warning/10 text-warning',
            excused: 'bg-primary/10 text-primary'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-muted text-muted-foreground'}`}>
                {status || 'N/A'}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    const months = [
        { value: 'all', label: 'All Months' },
        { value: '0', label: 'January' },
        { value: '1', label: 'February' },
        { value: '2', label: 'March' },
        { value: '3', label: 'April' },
        { value: '4', label: 'May' },
        { value: '5', label: 'June' },
        { value: '6', label: 'July' },
        { value: '7', label: 'August' },
        { value: '8', label: 'September' },
        { value: '9', label: 'October' },
        { value: '10', label: 'November' },
        { value: '11', label: 'December' }
    ];

    const filteredHistory = selectedMonth === 'all'
        ? attendanceHistory
        : attendanceHistory.filter(r => {
            const month = new Date(r.date).getMonth();
            return month.toString() === selectedMonth;
        });

    const LoadingSkeleton = () => (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6">
                        <div className="h-4 bg-muted rounded w-20 mb-3"></div>
                        <div className="h-8 bg-muted rounded w-16"></div>
                    </div>
                ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded mb-2"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <StudentSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <AuthHeader userName={userName} userRole={userRole} />

            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="main-content-inner">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">My Attendance</h1>
                        <p className="text-sm md:text-base text-muted-foreground">View your attendance history and statistics</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error flex-1">{error}</p>
                            <button onClick={fetchAttendance} className="text-sm text-error hover:underline">Retry</button>
                        </div>
                    )}

                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-card border border-border rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Icon name="Calendar" size={16} className="text-primary" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">Total Days</span>
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                            <Icon name="CheckCircle" size={16} className="text-success" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">Present</span>
                                    </div>
                                    <div className="text-2xl font-bold text-success">{stats.present}</div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
                                            <Icon name="XCircle" size={16} className="text-error" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">Absent</span>
                                    </div>
                                    <div className="text-2xl font-bold text-error">{stats.absent}</div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                                            <Icon name="Clock" size={16} className="text-warning" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">Late</span>
                                    </div>
                                    <div className="text-2xl font-bold text-warning">{stats.late}</div>
                                </div>
                            </div>

                            {/* Attendance Rate */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">Attendance Rate</h3>
                                    <span className={`text-2xl font-bold ${stats.rate >= 80 ? 'text-success' : stats.rate >= 60 ? 'text-warning' : 'text-error'}`}>
                                        {stats.rate}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${stats.rate >= 80 ? 'bg-success' : stats.rate >= 60 ? 'bg-warning' : 'bg-error'}`}
                                        style={{ width: `${stats.rate}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {stats.rate >= 80 ? 'Excellent attendance! Keep it up.' : stats.rate >= 60 ? 'Good attendance, but there is room for improvement.' : 'Your attendance needs improvement.'}
                                </p>
                            </div>

                            {/* History Table */}
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="p-4 md:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h2 className="text-lg font-semibold text-foreground">Attendance History</h2>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
                                    >
                                        {months.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {filteredHistory.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold text-foreground mb-2">No attendance records</h3>
                                        <p className="text-sm text-muted-foreground">No attendance data available for the selected period.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-muted/50">
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredHistory.map((record, index) => (
                                                    <tr key={record._id || index} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                        <td className="py-4 px-4 text-foreground">{formatDate(record.date)}</td>
                                                        <td className="py-4 px-4">{getStatusBadge(record.status)}</td>
                                                        <td className="py-4 px-4 text-muted-foreground text-sm">{record.remarks || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyAttendance;
