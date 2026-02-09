import React, { useState, useEffect } from 'react';
import ParentSidebar from '../../components/navigation/ParentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import api from '../../services/api';

const ChildResults = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [results, setResults] = useState([]);

    const userName = localStorage.getItem('userName') || 'Parent';
    const userRole = 'Parent';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/parent-dashboard' },
        { label: 'Child Results', path: '/child-results' }
    ];

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchResults();
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

    const fetchResults = async () => {
        try {
            const response = await api.get('/results', { params: { studentId: selectedChild } });
            setResults(response.data || []);
        } catch (err) {
            console.error('Error fetching results:', err);
            setResults([]);
        }
    };

    const selectedChildData = children.find(c => c._id === selectedChild);
    const averageScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.marks || 0), 0) / results.length)
        : 0;

    const getGradeColor = (marks) => {
        if (marks >= 80) return 'text-success';
        if (marks >= 60) return 'text-primary';
        if (marks >= 40) return 'text-warning';
        return 'text-error';
    };

    const getGrade = (marks) => {
        if (marks >= 90) return 'A+';
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B';
        if (marks >= 60) return 'C';
        if (marks >= 50) return 'D';
        return 'F';
    };

    // Group results by exam
    const groupedResults = results.reduce((acc, result) => {
        const examName = result.examId?.name || 'Unknown Exam';
        if (!acc[examName]) acc[examName] = [];
        acc[examName].push(result);
        return acc;
    }, {});

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
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Child Results</h1>
                            <p className="text-sm md:text-base text-muted-foreground">View your children's academic results</p>
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
                            <div className="h-32 bg-muted rounded-xl"></div>
                            <div className="h-64 bg-muted rounded-xl"></div>
                        </div>
                    ) : children.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No children found</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Card */}
                            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            {selectedChildData?.name || 'Unknown'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedChildData?.classId?.name || 'N/A'} • {results.length} results
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                                        <p className={`text-3xl font-bold ${getGradeColor(averageScore)}`}>
                                            {averageScore}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Results by Exam */}
                            {Object.keys(groupedResults).length === 0 ? (
                                <div className="bg-card border border-border rounded-xl p-12 text-center">
                                    <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No results yet</h3>
                                    <p className="text-sm text-muted-foreground">Results will appear here once exams are graded.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedResults).map(([examName, examResults]) => (
                                        <div key={examName} className="bg-card border border-border rounded-xl overflow-hidden">
                                            <div className="p-4 border-b border-border bg-muted/30">
                                                <h3 className="font-semibold text-foreground">{examName}</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-muted/50">
                                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Subject</th>
                                                            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Marks</th>
                                                            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Grade</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {examResults.map((result, idx) => (
                                                            <tr key={idx} className="border-b border-border">
                                                                <td className="py-4 px-4 font-medium text-foreground">
                                                                    {result.subjectId?.name || 'Unknown Subject'}
                                                                </td>
                                                                <td className={`py-4 px-4 text-center font-bold ${getGradeColor(result.marks)}`}>
                                                                    {result.marks || 0}%
                                                                </td>
                                                                <td className="py-4 px-4 text-center">
                                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.marks >= 80 ? 'bg-success/10 text-success' :
                                                                        result.marks >= 60 ? 'bg-primary/10 text-primary' :
                                                                            result.marks >= 40 ? 'bg-warning/10 text-warning' :
                                                                                'bg-error/10 text-error'
                                                                        }`}>
                                                                        {getGrade(result.marks)}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChildResults;
