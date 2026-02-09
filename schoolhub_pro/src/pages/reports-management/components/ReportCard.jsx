import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportCard = ({ report, onGenerate }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic':
        return 'bg-primary/10 text-primary';
      case 'financial':
        return 'bg-success/10 text-success';
      case 'administrative':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'academic':
        return 'Academic';
      case 'financial':
        return 'Financial';
      case 'administrative':
        return 'Administrative';
      default:
        return category;
    }
  };

  return (
    <div className="bg-background rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name={report?.icon} size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{report?.name}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryColor(report?.category)}`}>
              {getCategoryLabel(report?.category)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{report?.description}</p>

      <div className="mb-4">
        <span className="text-xs text-muted-foreground">Parameters:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {report?.parameters?.map((param, idx) => (
            <span key={idx} className="px-2 py-1 bg-muted/50 rounded text-xs text-foreground">
              {param}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <span className="text-xs text-muted-foreground">Last Generated:</span>
        <span className="text-xs font-medium text-foreground">{report?.lastGenerated}</span>
      </div>

      <Button
        onClick={() => onGenerate?.(report)}
        fullWidth
        iconName="FileText"
      >
        Generate Report
      </Button>
    </div>
  );
};

export default ReportCard;