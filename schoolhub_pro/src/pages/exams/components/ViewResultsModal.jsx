import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import examService from '../../../services/examService';

const ViewResultsModal = ({ isOpen, onClose, exam }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && exam) {
      fetchResults();
    }
  }, [isOpen, exam]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const examId = exam._id || exam.id;
      const data = await examService.getResults(examId);
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (!exam) return null;

  const subjectName = exam.subjectId?.name || 'N/A';
  const className = exam.classId?.name || 'N/A';
  const totalMarks = exam.totalMarks || 100;
  const passingMarks = exam.passingMarks || Math.ceil(totalMarks * 0.4);

  // Calculate stats from real results
  const presentResults = results.filter(r => r.marksObtained != null);
  const passedStudents = presentResults.filter(r => r.isPassed || r.marksObtained >= passingMarks).length;
  const failedStudents = presentResults.filter(r => !(r.isPassed || r.marksObtained >= passingMarks)).length;

  const allMarks = presentResults.map(r => r.marksObtained);
  const averageMarks = allMarks.length > 0
    ? (allMarks.reduce((sum, m) => sum + m, 0) / allMarks.length).toFixed(1)
    : 0;
  const highestMarks = allMarks.length > 0 ? Math.max(...allMarks) : 0;
  const lowestMarks = allMarks.length > 0 ? Math.min(...allMarks) : 0;

  const getStatusInfo = (result) => {
    const passed = result.isPassed || result.marksObtained >= passingMarks;
    if (passed) return { label: 'Pass', color: 'text-green-600 bg-green-50' };
    return { label: 'Fail', color: 'text-red-600 bg-red-50' };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Results - ${exam.title}`}
      description={`${subjectName} - ${className}`}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>Close</Button>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
              <div className="h-4 w-1/3 bg-background rounded mb-2" />
              <div className="h-4 w-1/4 bg-background rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
          <Icon name="AlertCircle" size={20} className="text-error" />
          <p className="text-sm text-error">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchResults}>Retry</Button>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No results yet</h3>
          <p className="text-sm text-muted-foreground">Marks have not been entered for this exam</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="CheckCircle2" size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-900">Passed</span>
              </div>
              <p className="text-2xl font-semibold text-green-600">{passedStudents}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="XCircle" size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-900">Failed</span>
              </div>
              <p className="text-2xl font-semibold text-red-600">{failedStudents}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Users" size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-semibold text-blue-600">{results.length}</p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Average:</span>
                <span className="ml-2 font-semibold text-foreground">{averageMarks}/{totalMarks}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Highest:</span>
                <span className="ml-2 font-semibold text-green-600">{highestMarks}/{totalMarks}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Lowest:</span>
                <span className="ml-2 font-semibold text-red-600">{lowestMarks}/{totalMarks}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Student Results</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result) => {
                const studentName = result.studentId?.name || 'Unknown';
                const rollNumber = result.studentId?.rollNumber || result.studentId?.studentId || '';
                const percentage = result.percentage != null
                  ? result.percentage.toFixed(1)
                  : ((result.marksObtained / totalMarks) * 100).toFixed(1);
                const statusInfo = getStatusInfo(result);

                return (
                  <div key={result._id || result.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {rollNumber || '#'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{studentName}</p>
                          {rollNumber && (
                            <p className="text-xs text-muted-foreground">Roll: {rollNumber}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">
                            {result.marksObtained}/{totalMarks}
                          </p>
                          <p className="text-xs text-muted-foreground">{percentage}%</p>
                        </div>
                        {result.grade && (
                          <div className="w-12 text-center">
                            <span className="text-sm font-semibold text-primary">{result.grade}</span>
                          </div>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ViewResultsModal;
