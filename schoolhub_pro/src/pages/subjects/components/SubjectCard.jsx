import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubjectCard = ({ subject, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Book" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{subject?.name}</h3>
              <p className="text-sm text-muted-foreground">{subject?.code} • {subject?.className}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{subject?.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon name="FileText" size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{subject?.totalChapters} Chapters</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{subject?.hoursPerWeek}h/week</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="UserCheck" size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{subject?.teachersAssigned} Teachers</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Users" size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{subject?.studentsEnrolled} Students</span>
        </div>
      </div>

      {/* Chapters preview */}
      {subject?.chapters?.length > 0 && (
        <div className="border-t border-border pt-4 mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">CHAPTERS</p>
          <div className="space-y-1">
            {subject.chapters.slice(0, 3).map((ch, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="CheckCircle2" size={12} className="text-green-600" />
                <span>Ch. {ch?.number}: {ch?.title}</span>
              </div>
            ))}
            {subject.chapters.length > 3 && (
              <span className="text-xs text-primary">+{subject.chapters.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          iconName="Eye"
          iconPosition="left"
          onClick={() => onView(subject)}
          className="flex-1"
        >
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Pencil"
          iconPosition="left"
          onClick={() => onEdit(subject)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          iconName="Trash2"
          iconPosition="left"
          onClick={() => onDelete(subject)}
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default SubjectCard;
