import React, { useState, useEffect } from 'react';
import ParentSidebar from '../../components/navigation/ParentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import api from '../../services/api';

const ChildTimetable = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [timetable, setTimetable] = useState([]);

    const userName = localStorage.getItem('userName') || 'Parent';
    const userRole = 'Parent';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/parent-dashboard' },
        { label: 'Child Timetable', path: '/child-timetable' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchTimetable();
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

    const fetchTimetable = async () => {
        try {
            const child = children.find(c => c._id === selectedChild);
            if (!child?.classId?._id && !child?.classId) return;

            const classId = child.classId?._id || child.classId;
            const response = await api.get('/timetables', { params: { classId, limit: 100 } });
            const entries = response.data || [];

            const sorted = entries.sort((a, b) => {
                const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
                if (dayOrder !== 0) return dayOrder;
                return a.startTime?.localeCompare(b.startTime);
            });

            setTimetable(sorted);
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setTimetable([]);
        }
    };

    const selectedChildData = children.find(c => c._id === selectedChild);

    const groupedByDay = days.reduce((acc, day) => {
        acc[day] = timetable.filter(t => t.day === day);
        return acc;
    }, {});

    const getTypeColor = (type) => {
        switch (type) {
            case 'lecture': return 'bg-primary/10 border-primary/20';
            case 'lab': return 'bg-success/10 border-success/20';
            case 'tutorial': return 'bg-warning/10 border-warning/20';
            default: return 'bg-muted border-border';
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
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Child Timetable</h1>
                            <p className="text-sm md:text-base text-muted-foreground">View your children's class schedule</p>
                        </div>
                        {children.length > 0 && (
                            <select
                                value={selectedChild}
                                onChange={(e) => setSelectedChild(e.target.value)}
                                className="px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                            >
                                {children.map(child => (
                                    <option key={child._id} value={child._id}>
                                        {child.firstName} {child.lastName}
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
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
                        </div>
                    ) : children.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No children found</p>
                        </div>
                    ) : (
                        <>
                            {/* Child Info */}
                            <div className="bg-card border border-border rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="font-medium text-primary">
                                            {selectedChildData?.firstName?.[0]}{selectedChildData?.lastName?.[0]}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {selectedChildData?.firstName} {selectedChildData?.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedChildData?.classId?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Timetable */}
                            {timetable.length === 0 ? (
                                <div className="bg-card border border-border rounded-xl p-12 text-center">
                                    <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No timetable found</h3>
                                    <p className="text-sm text-muted-foreground">The timetable hasn't been set up for this class yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {days.map(day => {
                                        const dayEntries = groupedByDay[day];
                                        if (dayEntries.length === 0) return null;

                                        return (
                                            <div key={day} className="bg-card border border-border rounded-xl overflow-hidden">
                                                <div className="px-4 py-3 border-b border-border bg-muted/30">
                                                    <h3 className="font-semibold text-foreground">{day}</h3>
                                                </div>
                                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {dayEntries.map((entry, idx) => (
                                                        <div key={idx} className={`p-4 rounded-lg border ${getTypeColor(entry.type)}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-foreground">
                                                                    {entry.startTime} - {entry.endTime}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground capitalize">
                                                                    {entry.type || 'lecture'}
                                                                </span>
                                                            </div>
                                                            <p className="font-semibold text-foreground mb-1">
                                                                {entry.subjectId?.name || 'Unknown'}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Icon name="User" size={12} />
                                                                <span>{entry.teacherId?.name || 'TBD'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                <Icon name="MapPin" size={12} />
                                                                <span>{entry.room || 'TBD'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChildTimetable;
