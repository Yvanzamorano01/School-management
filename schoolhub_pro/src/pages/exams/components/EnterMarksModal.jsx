import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import studentService from '../../../services/studentService';
import examService from '../../../services/examService';

const EnterMarksModal = ({ isOpen, onClose, exam, onSaved }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && exam) {
      fetchStudentsAndResults();
    }
  }, [isOpen, exam]);

  const fetchStudentsAndResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const classId = exam.classId?._id || exam.classId;

      const [studentsData, existingResults] = await Promise.all([
        studentService.getAll({ classId }),
        examService.getResults(exam._id || exam.id)
      ]);

      // Build a map of existing results by studentId
      const resultsMap = {};
      (existingResults || []).forEach(r => {
        const sid = r.studentId?._id || r.studentId;
        resultsMap[sid] = r;
      });

      // Merge students with their existing marks
      const merged = (studentsData || []).map(s => {
        const sid = s._id || s.id;
        const existing = resultsMap[sid];
        return {
          id: sid,
          name: s.name,
          rollNumber: s.rollNumber || s.studentId || '',
          marks: existing ? String(existing.marksObtained) : '',
          remarks: existing?.remarks || '',
          status: existing ? 'present' : 'present',
          hasExistingResult: !!existing
        };
      });

      setStudents(merged);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, marks) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, marks } : s));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, remarks } : s));
  };

  const handleStatusToggle = (studentId) => {
    setStudents(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, status: s.status === 'present' ? 'absent' : 'present', marks: s.status === 'present' ? '' : s.marks }
        : s
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const examId = exam._id || exam.id;

      // Only send marks for present students who have marks entered
      const marks = students
        .filter(s => s.status === 'present' && s.marks !== '')
        .map(s => ({
          studentId: s.id,
          marksObtained: parseInt(s.marks),
          ...(s.remarks ? { remarks: s.remarks } : {})
        }));

      if (marks.length === 0) {
        alert('Please enter marks for at least one student');
        setSaving(false);
        return;
      }

      await examService.enterMarks(examId, marks);
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Error saving marks:', err);
      alert(err?.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  if (!exam) return null;

  const subjectName = exam.subjectId?.name || 'N/A';
  const className = exam.classId?.name || 'N/A';
  const presentStudents = students.filter(s => s.status === 'present');
  const absentStudents = students.filter(s => s.status === 'absent');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enter Marks - ${exam.title}`}
      description={`${subjectName} - ${className} | Total Marks: ${exam.totalMarks}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Marks'}
          </Button>
        </>
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
          <Button variant="ghost" size="sm" onClick={fetchStudentsAndResults}>Retry</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Students:</span>
                <span className="ml-2 font-semibold text-foreground">{students.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Present:</span>
                <span className="ml-2 font-semibold text-green-600">{presentStudents.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Absent:</span>
                <span className="ml-2 font-semibold text-red-600">{absentStudents.length}</span>
              </div>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Users" size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No students enrolled in this class</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {students.map((student) => (
                <div key={student.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {student.rollNumber || '#'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{student.name}</p>
                          {student.rollNumber && (
                            <p className="text-xs text-muted-foreground">Roll: {student.rollNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStatusToggle(student.id)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-smooth ${
                          student.status === 'present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {student.status === 'present' ? 'Present' : 'Absent'}
                      </button>

                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Marks"
                          value={student.marks}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          disabled={student.status === 'absent'}
                          min="0"
                          max={exam.totalMarks}
                        />
                      </div>

                      <div className="w-32">
                        <Input
                          type="text"
                          placeholder="Remarks"
                          value={student.remarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          disabled={student.status === 'absent'}
                        />
                      </div>

                      <div className="w-8 text-center">
                        {student.marks && student.status === 'present' && (
                          parseInt(student.marks) >= (exam.passingMarks || Math.ceil(exam.totalMarks * 0.4)) ? (
                            <Icon name="CheckCircle2" size={20} className="text-green-600" />
                          ) : (
                            <Icon name="XCircle" size={20} className="text-red-600" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default EnterMarksModal;
