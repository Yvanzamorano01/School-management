import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_LG } from '../../../utils/avatar';

const ChildSummaryCard = ({ child }) => {
  const navigate = useNavigate();

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return 'text-success';
    if (rate >= 75) return 'text-warning';
    return 'text-error';
  };

  const getGradeColor = (grade) => {
    if (grade >= 85) return 'text-success';
    if (grade >= 70) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-6 hover:shadow-elevation-2 transition-smooth">
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-4 md:mb-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          {hasValidPhoto(child?.photo) ? (
            <img src={child.photo} alt={child?.photoAlt} className="w-full h-full object-cover" />
          ) : getInitials(child?.name) ? (
            <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold" style={{ backgroundColor: getAvatarColor(child?.name) }}>
              {getInitials(child?.name)}
            </div>
          ) : (
            <img src={DEFAULT_AVATAR_LG} alt="Default avatar" className="w-full h-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">{child?.name}</h3>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="BookOpen" size={14} />
              {child?.class}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Hash" size={14} />
              {child?.rollNumber}
            </span>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${child?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}>
              {child?.status}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-muted/50 rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground">Attendance</span>
          </div>
          <div className={`text-xl md:text-2xl font-bold ${getAttendanceColor(child?.attendanceRate)}`}>
            {child?.attendanceRate}%
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Award" size={16} className="text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground">Avg Grade</span>
          </div>
          <div className={`text-xl md:text-2xl font-bold ${getGradeColor(child?.averageGrade)}`}>
            {child?.averageGrade}%
          </div>
        </div>
      </div>
      {child?.upcomingEvents?.length > 0 && (
        <div className="mb-4 md:mb-6">
          <h4 className="text-sm font-medium text-foreground mb-2 md:mb-3">Upcoming Events</h4>
          <div className="space-y-2">
            {child?.upcomingEvents?.slice(0, 2)?.map((event, index) => (
              <div key={index} className="flex items-start gap-2 text-xs md:text-sm">
                <Icon name="Calendar" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-foreground font-medium">{event?.title}</div>
                  <div className="text-muted-foreground">{event?.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">

        <Button
          variant="outline"
          size="sm"
          iconName="DollarSign"
          iconPosition="left"
          className="flex-1 sm:flex-initial"
        >
          Fees
        </Button>
      </div>
    </div>
  );
};

export default ChildSummaryCard;