import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExamCard = ({ exam, onEnterMarks, onViewResults }) => {
  const getStatusColor = (status) => {
    if (status === 'completed') return 'text-green-600 bg-green-50';
    if (status === 'ongoing') return 'text-orange-600 bg-orange-50';
    if (status === 'cancelled') return 'text-red-600 bg-red-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getStatusLabel = (status) => {
    if (status === 'completed') return 'Completed';
    if (status === 'ongoing') return 'Ongoing';
    if (status === 'cancelled') return 'Cancelled';
    return 'Upcoming';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const subjectName = exam?.subjectId?.name || 'N/A';
  const className = exam?.classId?.name || 'N/A';

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{exam?.title}</h3>
              <p className="text-sm text-muted-foreground">{subjectName} - {className}</p>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam?.status)}`}>
          {getStatusLabel(exam?.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{formatDate(exam?.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{exam?.duration || 60} mins</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Award" size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{exam?.totalMarks} marks</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Target" size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">Pass: {exam?.passingMarks || Math.ceil((exam?.totalMarks || 0) * 0.4)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-border">
        {exam?.status !== 'cancelled' && (
          <Button
            variant={exam?.status === 'completed' ? 'outline' : 'default'}
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={() => onEnterMarks(exam)}
            className="flex-1"
          >
            {exam?.status === 'completed' ? 'Edit Marks' : 'Enter Marks'}
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          iconName="BarChart3"
          iconPosition="left"
          onClick={() => onViewResults(exam)}
          className="flex-1"
        >
          View Results
        </Button>
      </div>
    </div>
  );
};

export default ExamCard;
