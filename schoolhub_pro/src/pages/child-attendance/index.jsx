import React, { useState, useEffect } from 'react';
import ParentSidebar from '../../components/navigation/ParentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import api from '../../services/api';

const ChildAttendance = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [attendance, setAttendance] = useState([]);

    const userName = localStorage.getItem('userName') || 'Parent';
    const userRole = 'Parent';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/parent-dashboard' },
        { label: 'Child Attendance', path: '/child-attendance' }
    ];

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchAttendance();
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const parentId = user.profileId;

            if (!parentId) {
                setError('No parent profile found.');
                return;
            }

            const response = await api.get('/students', { params: { parentId, limit: 50 } });
            const childrenData = response.data || [];
            setChildren(childrenData);

            if (childrenData.length > 0) {
                setSelectedChild(childrenData[0]._id);
            }
        } catch (err) {
            console.error('Error fetching children:', err);
            setError(err.message || 'Failed to load children');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            const response = await api.get(`/attendance/student/${selectedChild}`);
            setAttendance(response.data?.data || []);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setAttendance([]);
        }
    };

    const selectedChildData = children.find(c => c._id === selectedChild);
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const totalDays = attendance.length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays + lateDays) / totalDays * 100) : 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-success/10 text-success';
            case 'absent': return 'bg-error/10 text-error';
            case 'late': return 'bg-warning/10 text-warning';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <ParentSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <AuthHeader userName={userName} userRole={userRole} />

            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="main-content-inner">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Child Attendance</h1>
                            <p className="text-sm md:text-base text-muted-foreground">View your children's attendance records</p>
                        </div>
                        {children.length > 0 && (
                            <select
                                value={selectedChild}
                                onChange={(e) => setSelectedChild(e.target.value)}
                                className="px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                            >
                                {children.map(child => (
                                    <option key={child._id} value={child._id}>
                                        {child.name || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
                            </div>
                        </div>
                    ) : children.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No children found</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon name="Calendar" size={16} className="text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Total Days</span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">{totalDays}</p>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon name="CheckCircle" size={16} className="text-success" />
                                        <span className="text-xs text-muted-foreground">Present</span>
                                    </div>
                                    <p className="text-2xl font-bold text-success">{presentDays}</p>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon name="XCircle" size={16} className="text-error" />
                                        <span className="text-xs text-muted-foreground">Absent</span>
                                    </div>
                                    <p className="text-2xl font-bold text-error">{absentDays}</p>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon name="Clock" size={16} className="text-warning" />
                                        <span className="text-xs text-muted-foreground">Late</span>
                                    </div>
                                    <p className="text-2xl font-bold text-warning">{lateDays}</p>
                                </div>
                            </div>

                            {/* Attendance Rate */}
                            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-foreground">Attendance Rate</h3>
                                    <span className={`text-2xl font-bold ${attendanceRate >= 80 ? 'text-success' : attendanceRate >= 60 ? 'text-warning' : 'text-error'}`}>
                                        {attendanceRate}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${attendanceRate >= 80 ? 'bg-success' : attendanceRate >= 60 ? 'bg-warning' : 'bg-error'}`}
                                        style={{ width: `${attendanceRate}%` }}
                                    />
                                </div>
                            </div>

                            {/* Attendance History */}
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-border">
                                    <h3 className="font-semibold text-foreground">
                                        Attendance History - {selectedChildData?.name || 'Unknown'}
                                    </h3>
                                </div>
                                {attendance.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No attendance records found
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-muted/50">
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Class</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendance.slice(0, 30).map((record, idx) => (
                                                    <tr key={idx} className="border-b border-border">
                                                        <td className="py-4 px-4 text-foreground">
                                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="py-4 px-4 text-muted-foreground">{record.className || '-'}</td>
                                                        <td className="py-4 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(record.status)}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-muted-foreground">{record.remarks || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChildAttendance;
