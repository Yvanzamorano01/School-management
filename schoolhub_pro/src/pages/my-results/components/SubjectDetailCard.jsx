import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const SubjectDetailCard = ({ subject }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'text-success bg-success/10',
      'A': 'text-success bg-success/10',
      'B+': 'text-primary bg-primary/10',
      'B': 'text-primary bg-primary/10',
      'C+': 'text-warning bg-warning/10',
      'C': 'text-warning bg-warning/10',
      'D': 'text-error bg-error/10',
      'F': 'text-destructive bg-destructive/10'
    };
    return gradeColors?.[grade] || 'text-muted-foreground bg-muted';
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-elevation-2 transition-smooth">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">{subject?.name}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{subject?.code} • {subject?.teacher}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getGradeColor(subject?.grade)}`}>
            {subject?.grade}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Total Marks</div>
            <div className="text-lg md:text-xl font-bold text-foreground">{subject?.marks}/{subject?.totalMarks}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">GPA</div>
            <div className="text-lg md:text-xl font-bold text-foreground">{subject?.gpa}</div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 md:space-y-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-250">
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-foreground mb-2">Exam Breakdown</h4>
              <div className="space-y-2">
                {subject?.examBreakdown?.map((exam, index) => (
                  <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-muted/30 rounded-lg">
                    <span className="text-xs md:text-sm text-foreground">{exam?.name}</span>
                    <span className="text-xs md:text-sm font-semibold text-foreground">{exam?.score}/{exam?.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {subject?.teacherComment && (
              <div>
                <h4 className="text-xs md:text-sm font-semibold text-foreground mb-2">Teacher's Comment</h4>
                <div className="p-3 md:p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs md:text-sm text-muted-foreground italic">&quot;{subject?.teacherComment}&quot;</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          fullWidth
          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          iconPosition="right"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'View Details'}
        </Button>
      </div>
    </div>
  );
};

export default SubjectDetailCard;