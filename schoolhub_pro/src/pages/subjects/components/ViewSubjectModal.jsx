import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import studentService from '../../../services/studentService';

const ViewSubjectModal = ({ isOpen, onClose, subject }) => {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && subject?.classId) {
      fetchStudents();
    }
    if (!isOpen) {
      setStudents([]);
      setSearchQuery('');
    }
  }, [isOpen, subject?.classId]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await studentService.getAll({ classId: subject.classId });
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  if (!subject) return null;

  const filteredStudents = students.filter(s =>
    s?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    s?.studentId?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subject?.name}
      description={`${subject?.code} • ${subject?.className}`}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>Close</Button>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {subject?.description && (
          <p className="text-sm text-muted-foreground">{subject.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="FileText" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Total Chapters</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{subject?.totalChapters}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Clock" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Hours/Week</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{subject?.hoursPerWeek}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="UserCheck" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Teachers</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{subject?.teachersAssigned}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Users" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Students</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{subject?.studentsEnrolled}</p>
          </div>
        </div>

        {/* Chapters */}
        {subject?.chapters?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Chapters & Descriptions</h3>
            <div className="space-y-2">
              {subject.chapters.map((chapter, index) => (
                <div key={chapter?._id || index} className="bg-muted rounded-lg p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">
                      Chapter {chapter?.number}: {chapter?.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chapter?.topics} topics</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{chapter?.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="GraduationCap" size={16} className="text-primary" />
              Enrolled Students ({students.length})
            </h3>
          </div>

          {/* Search students */}
          {students.length > 5 && (
            <div className="mb-3">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {loadingStudents ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-1"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredStudents.map((student, index) => (
                <div key={student._id || student.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-primary">
                        {student?.name?.split(' ')?.map(n => n?.[0])?.join('') || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{student?.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {student?.studentId && <span>{student.studentId}</span>}
                        {student?.rollNumber && <span>Roll: {student.rollNumber}</span>}
                        {student?.sectionId?.name && <span>{student.sectionId.name}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    student?.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    student?.status === 'Inactive' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {student?.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-muted rounded-lg">
              <Icon name="Users" size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No students match your search' : 'No students enrolled in this class'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewSubjectModal;
