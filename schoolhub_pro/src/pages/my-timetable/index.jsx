import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import api from '../../services/api';

const MyTimetable = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [selectedDay, setSelectedDay] = useState('all');

    const userName = localStorage.getItem('userName') || 'Teacher';
    const userRole = 'Teacher';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/teacher-dashboard' },
        { label: 'My Timetable', path: '/my-timetable' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            setError(null);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const teacherId = user.profileId;

            if (!teacherId) {
                setError('No teacher profile found. Please log out and log in again.');
                return;
            }

            const response = await api.get('/timetables', { params: { teacherId, limit: 500 } });
            const entries = response.data || [];

            // Sort by day and start time
            const sorted = entries.sort((a, b) => {
                const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
                if (dayOrder !== 0) return dayOrder;
                return a.startTime?.localeCompare(b.startTime);
            });

            setTimetable(sorted);
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setError(err.message || 'Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    const filteredTimetable = selectedDay === 'all'
        ? timetable
        : timetable.filter(t => t.day === selectedDay);

    const groupedByDay = days.reduce((acc, day) => {
        acc[day] = filteredTimetable.filter(t => t.day === day);
        return acc;
    }, {});

    const getTypeColor = (type) => {
        switch (type) {
            case 'lecture': return 'bg-primary/10 text-primary';
            case 'lab': return 'bg-success/10 text-success';
            case 'tutorial': return 'bg-warning/10 text-warning';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const LoadingSkeleton = () => (
        <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                    <div className="h-6 bg-muted rounded w-24 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2].map((j) => (
                            <div key={j} className="h-20 bg-muted rounded"></div>
                        ))}
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

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">My Timetable</h1>
                            <p className="text-sm md:text-base text-muted-foreground">Your weekly teaching schedule</p>
                        </div>
                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                        >
                            <option value="all">All Days</option>
                            {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error flex-1">{error}</p>
                            <button onClick={fetchTimetable} className="text-sm text-error hover:underline">Retry</button>
                        </div>
                    )}

                    {loading ? (
                        <LoadingSkeleton />
                    ) : timetable.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No schedule found</h3>
                            <p className="text-sm text-muted-foreground">You don't have any classes scheduled yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {days.map(day => {
                                const dayEntries = groupedByDay[day];
                                if (selectedDay !== 'all' && selectedDay !== day) return null;
                                if (dayEntries.length === 0 && selectedDay === 'all') return null;

                                return (
                                    <div key={day} className="bg-card border border-border rounded-xl overflow-hidden">
                                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                                            <h2 className="text-lg font-semibold text-foreground">{day}</h2>
                                        </div>

                                        {dayEntries.length === 0 ? (
                                            <div className="p-6 text-center text-muted-foreground">
                                                No classes scheduled
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {dayEntries.map((entry, idx) => (
                                                    <div key={idx} className="p-4 hover:bg-muted/20 transition-colors">
                                                        <div className="flex items-start gap-4">
                                                            <div className="text-center min-w-[80px]">
                                                                <div className="text-lg font-bold text-foreground">{entry.startTime}</div>
                                                                <div className="text-xs text-muted-foreground">to {entry.endTime}</div>
                                                            </div>

                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-semibold text-foreground">
                                                                        {entry.subjectId?.name || 'Unknown Subject'}
                                                                    </h3>
                                                                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${getTypeColor(entry.type)}`}>
                                                                        {entry.type || 'lecture'}
                                                                    </span>
                                                                </div>

                                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                                    <span className="flex items-center gap-1">
                                                                        <Icon name="Users" size={14} />
                                                                        {entry.classId?.name || 'N/A'}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Icon name="MapPin" size={14} />
                                                                        {entry.room || 'TBD'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyTimetable;
