import React from 'react';
import Icon from '../../../components/AppIcon';

const TaskCard = ({ task }) => {
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

  const getDeadlineStatus = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-error' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-warning' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-warning' };
    return { text: `${diffDays} days left`, color: 'text-muted-foreground' };
  };

  const deadlineStatus = getDeadlineStatus(task?.deadline);

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-elevation-1 transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name={task?.icon} size={16} color="var(--color-primary)" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">{task?.title}</h4>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(task?.priority)}`}>
          {task?.priority}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {task?.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="Calendar" size={14} />
          <span>{new Date(task.deadline)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <span className={`text-xs font-medium ${deadlineStatus?.color}`}>
          {deadlineStatus?.text}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;