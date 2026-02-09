import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import SemesterSelector from './components/SemesterSelector';
import SubjectFilter from './components/SubjectFilter';
import PerformanceStats from './components/PerformanceStats';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import ResultsTable from './components/ResultsTable';
import SubjectDetailCard from './components/SubjectDetailCard';
import ExportResults from './components/ExportResults';
import Icon from '../../components/AppIcon';
import resultsService from '../../services/resultsService';

const GPA_MAP = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D': 1.0, 'F': 0.0
};

const getPerformanceLevel = (pct) => {
  if (pct >= 80) return 'excellent';
  if (pct >= 65) return 'good';
  if (pct >= 50) return 'average';
  return 'poor';
};

const MyResults = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = localStorage.getItem('userName') || 'Student';
  const userRole = 'Student';

  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rawResults, setRawResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [semestersRes, subjectsRes, resultsRes] = await Promise.all([
        resultsService.getSemesters(),
        resultsService.getSubjects(),
        resultsService.getStudentResults(selectedSemester)
      ]);

      setSemesters(semestersRes || []);
      setSubjects(subjectsRes || []);
      setRawResults(resultsRes || []);
    } catch (err) {
      console.error('Error fetching results data:', err);
      setError(err.message || 'Failed to load results data');
      setSemesters([]);
      setSubjects([]);
      setRawResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform raw ExamResult data into component-friendly format
  const transformedResults = rawResults.map(r => ({
    id: r._id,
    subject: r.examId?.subjectId?.name || 'Unknown',
    code: r.examId?.subjectId?.code || '',
    teacher: '',
    marks: r.marksObtained || 0,
    totalMarks: r.examId?.totalMarks || 100,
    grade: r.grade || 'F',
    gpa: GPA_MAP[r.grade] ?? 0.0,
    percentage: r.percentage || 0,
    performance: getPerformanceLevel(r.percentage || 0),
    isPassed: r.isPassed,
    examTitle: r.examId?.title || '',
    remarks: r.remarks || '',
    subjectId: r.examId?.subjectId?._id || r.examId?.subjectId
  }));

  // Filter by subject
  const filteredResults = selectedSubject === 'all'
    ? transformedResults
    : transformedResults.filter(r => String(r.subjectId) === String(selectedSubject));

  // Build performance stats from transformed results
  const performanceStats = (() => {
    if (transformedResults.length === 0) return {};
    const avg = Math.round(transformedResults.reduce((sum, r) => sum + r.percentage, 0) / transformedResults.length);
    const passed = transformedResults.filter(r => r.isPassed).length;
    const totalGpa = transformedResults.reduce((sum, r) => sum + r.gpa, 0) / transformedResults.length;
    return {
      gpa: totalGpa.toFixed(2),
      rank: '-',
      totalStudents: '-',
      passed,
      total: transformedResults.length,
      average: avg
    };
  })();

  // Build analytics data
  const analyticsData = (() => {
    if (transformedResults.length === 0) return {};

    // Grade distribution
    const gradeCounts = {};
    transformedResults.forEach(r => {
      gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1;
    });
    const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
    const gradeDistribution = gradeOrder
      .filter(g => gradeCounts[g])
      .map(g => ({ grade: g, count: gradeCounts[g] }));

    // Performance by subject (as trend)
    const subjectMap = {};
    transformedResults.forEach(r => {
      const name = r.subject.length > 12 ? r.subject.substring(0, 12) + '...' : r.subject;
      if (!subjectMap[name]) subjectMap[name] = { total: 0, gpaTotal: 0, count: 0 };
      subjectMap[name].total += r.percentage;
      subjectMap[name].gpaTotal += r.gpa;
      subjectMap[name].count += 1;
    });
    const performanceTrend = Object.entries(subjectMap).map(([name, data]) => ({
      month: name,
      average: Math.round(data.total / data.count),
      gpa: +(data.gpaTotal / data.count).toFixed(1)
    }));

    return { gradeDistribution, performanceTrend };
  })();

  // Build subject options for filter using _id
  const subjectOptions = (subjects || []).map(s => ({
    id: s._id || s.id,
    name: s.name,
    code: s.code
  }));

  // Build card view data grouped by subject
  const subjectCards = (() => {
    const map = {};
    transformedResults.forEach(r => {
      const key = r.code || r.subject;
      if (!map[key]) {
        map[key] = {
          id: key,
          name: r.subject,
          code: r.code,
          teacher: r.teacher,
          grade: r.grade,
          marks: r.marks,
          totalMarks: r.totalMarks,
          gpa: r.gpa,
          examBreakdown: []
        };
      }
      map[key].examBreakdown.push({
        name: r.examTitle,
        score: r.marks,
        total: r.totalMarks
      });
      // Keep best grade
      if ((GPA_MAP[r.grade] || 0) > (GPA_MAP[map[key].grade] || 0)) {
        map[key].grade = r.grade;
        map[key].gpa = r.gpa;
      }
      // Aggregate marks
      const allExams = map[key].examBreakdown;
      map[key].marks = Math.round(allExams.reduce((s, e) => s + e.score, 0) / allExams.length);
      map[key].totalMarks = 100;
    });
    return Object.values(map);
  })();

  const filteredCards = selectedSubject === 'all'
    ? subjectCards
    : subjectCards.filter(c => {
      const sub = subjectOptions.find(s => String(s.id) === String(selectedSubject));
      return sub && c.code === sub.code;
    });

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/student-dashboard' },
    { label: 'My Results', path: '/my-results' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <AuthHeader userName={userName} userRole={userRole} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="main-content-inner">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
              <div>
                <div className="h-10 bg-muted animate-pulse rounded-lg w-64 mb-2"></div>
                <div className="h-5 bg-muted animate-pulse rounded-lg w-96"></div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border mb-6 md:mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border mb-6 md:mb-8">
              <div className="h-64 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="h-96 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <StudentSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <AuthHeader userName={userName} userRole={userRole} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="main-content-inner">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="AlertCircle" size={32} className="text-error" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Failed to Load Results</h3>
                <p className="text-sm text-muted-foreground mb-6">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth inline-flex items-center gap-2"
                >
                  <Icon name="RefreshCw" size={18} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <AuthHeader userName={userName} userRole={userRole} />
      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">My Academic Results</h1>
              <p className="text-sm md:text-base text-muted-foreground">View your grades, performance analytics, and academic progress</p>
            </div>
            <ExportResults />
          </div>

          <PerformanceStats stats={performanceStats} />

          <PerformanceAnalytics analytics={analyticsData} />

          <div className="bg-card rounded-xl p-4 md:p-6 border border-border mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
              <SemesterSelector
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSemesterChange={setSelectedSemester}
              />

              <SubjectFilter
                subjects={subjectOptions}
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
              />

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-smooth ${
                    viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="Table view"
                >
                  <Icon name="Table" size={20} />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-smooth ${
                    viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="Card view"
                >
                  <Icon name="LayoutGrid" size={20} />
                </button>
              </div>
            </div>

            {viewMode === 'table' ? (
              filteredResults.length > 0 ? (
                <ResultsTable results={filteredResults} />
              ) : (
                <div className="text-center py-12">
                  <Icon name="FileSearch" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
                  <p className="text-sm text-muted-foreground">No results available for the selected filters</p>
                </div>
              )
            ) : (
              filteredCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredCards.map((card) => (
                    <SubjectDetailCard key={card.id} subject={card} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="FileSearch" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
                  <p className="text-sm text-muted-foreground">No results available for the selected filters</p>
                </div>
              )
            )}
          </div>

          <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Info" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Grading System Information</h3>
                <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                  <p>• A+ (95-100): 4.0 GPA - Excellent</p>
                  <p>• A (90-94): 4.0 GPA - Tres Bien</p>
                  <p>• A- (85-89): 3.7 GPA - Tres Bien</p>
                  <p>• B+ (80-84): 3.3 GPA - Bien</p>
                  <p>• B (75-79): 3.0 GPA - Bien</p>
                  <p>• B- (70-74): 2.7 GPA - Assez Bien</p>
                  <p>• C+ (65-69): 2.3 GPA - Passable</p>
                  <p>• C (60-64): 2.0 GPA - Passable</p>
                  <p>• D (50-54): 1.0 GPA - Mediocre</p>
                  <p>• F (0-49): 0.0 GPA - Echec</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyResults;
