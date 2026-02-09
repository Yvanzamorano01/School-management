import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClassCard = ({ classData }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
            {classData?.subject}
          </h3>
          <p className="text-sm text-muted-foreground">
            {classData?.grade} - {classData?.section}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(classData?.status)}`}>
          {classData?.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Users" size={18} color="var(--color-primary)" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Students</p>
            <p className="text-sm md:text-base font-semibold text-foreground">{classData?.studentCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Icon name="Calendar" size={18} color="var(--color-secondary)" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Classes/Week</p>
            <p className="text-sm md:text-base font-semibold text-foreground">{classData?.classesPerWeek}</p>
          </div>
        </div>
      </div>
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Recent Activity</p>
        <p className="text-sm text-foreground">{classData?.recentActivity}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="default"
          size="sm"
          iconName="ClipboardCheck"
          iconPosition="left"
          fullWidth
          onClick={() => navigate('/attendance-management')}
        >
          Attendance
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="FileText"
          iconPosition="left"
          fullWidth
          onClick={() => navigate('/course-materials')}
        >
          Materials
        </Button>
      </div>
    </div>
  );
};

export default ClassCard;