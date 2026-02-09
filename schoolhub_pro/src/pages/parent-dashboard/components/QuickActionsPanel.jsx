import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: "View Results",
      description: "Check academic performance",
      icon: "Award",
      color: "bg-success/10 text-success",
      action: () => navigate('/my-results')
    },
    {
      id: 2,
      title: "Attendance History",
      description: "Track attendance records",
      icon: "Calendar",
      color: "bg-primary/10 text-primary",
      action: () => navigate('/child-details')
    },
    {
      id: 3,
      title: "Fee Payments",
      description: "Manage fee transactions",
      icon: "DollarSign",
      color: "bg-warning/10 text-warning",
      action: () => {}
    },
    {
      id: 4,
      title: "Teacher Communication",
      description: "Message teachers",
      icon: "MessageSquare",
      color: "bg-secondary/10 text-secondary",
      action: () => {}
    }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-muted/50 rounded-xl hover:bg-muted transition-smooth text-left"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${action?.color}`}>
              <Icon name={action?.icon} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-medium text-foreground mb-1">
                {action?.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {action?.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;