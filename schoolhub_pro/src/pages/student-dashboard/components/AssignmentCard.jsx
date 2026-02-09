import React from 'react';
import Icon from '../../../components/AppIcon';

const AssignmentCard = ({ assignments }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Upcoming Assignments</h3>
        <Icon name="FileText" size={20} className="text-muted-foreground md:w-6 md:h-6" />
      </div>
      <div className="space-y-3 md:space-y-4">
        {assignments?.map((assignment) => (
          <div key={assignment?.id} className={`border rounded-lg p-3 md:p-4 ${getPriorityColor(assignment?.priority)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-medium mb-1 truncate">{assignment?.title}</h4>
                <p className="text-xs md:text-sm opacity-80">{assignment?.subject}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-md bg-background/50 whitespace-nowrap ml-2">
                {assignment?.priority?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs md:text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={14} className="flex-shrink-0" />
                <span>{getDaysRemaining(assignment?.dueDate)}</span>
              </div>
              <span className="whitespace-nowrap">{new Date(assignment.dueDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentCard;