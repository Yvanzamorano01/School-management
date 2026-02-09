import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_LG } from '../../../utils/avatar';

const StudentCard = ({ student, onEdit, onView, onManageClass, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-success/10 text-success',
      'Inactive': 'bg-muted text-muted-foreground',
      'Graduated': 'bg-primary/10 text-primary',
      'Transferred': 'bg-warning/10 text-warning'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  const initials = getInitials(student?.name);
  const avatarColor = getAvatarColor(student?.name);

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-elevation-2 transition-all duration-250">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-muted">
          {hasValidPhoto(student?.photo) ? (
            <img src={student.photo} alt={student?.photoAlt} className="w-full h-full object-cover" />
          ) : initials ? (
            <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold" style={{ backgroundColor: avatarColor }}>
              {initials}
            </div>
          ) : (
            <img src={DEFAULT_AVATAR_LG} alt="Default avatar" className="w-full h-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base mb-1 truncate">{student?.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">ID: {student?.studentId}</p>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(student?.status)}`}>
            {student?.status}
          </span>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="BookOpen" size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground">{student?.class} - {student?.section}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Icon name="User" size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground truncate">{student?.parentName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Icon name="Phone" size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground">{student?.parentContact}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onView(student)} iconName="Eye" iconPosition="left" fullWidth>
          View
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(student)} iconName="Edit" iconPosition="left" fullWidth>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onManageClass(student)} iconName="BookOpen" />
        <Button variant="ghost" size="sm" onClick={() => onDelete(student)} iconName="Trash2" className="text-error hover:text-error" />
      </div>
    </div>
  );
};

export default StudentCard;
