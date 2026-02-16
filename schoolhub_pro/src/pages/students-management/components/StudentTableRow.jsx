import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_SM } from '../../../utils/avatar';

const StudentTableRow = ({ student, onEdit, onView, onManageClass, onDelete, onToggleActive, toggleLoading }) => {
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
    <>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted">
            {hasValidPhoto(student?.photo) ? (
              <img src={student.photo} alt={student?.photoAlt} className="w-full h-full object-cover" />
            ) : initials ? (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: avatarColor }}>
                {initials}
              </div>
            ) : (
              <img src={DEFAULT_AVATAR_SM} alt="Default avatar" className="w-full h-full" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground text-sm md:text-base truncate">{student?.name}</div>
            <div className="text-xs md:text-sm text-muted-foreground truncate">ID: {student?.studentId}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-foreground">{student?.class}</div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-foreground">{student?.section}</div>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(student?.status)}`}>
          {student?.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-foreground">{student?.parentName}</div>
        <div className="text-xs text-muted-foreground">{student?.parentContact}</div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => onView(student)} iconName="Eye" />
          <Button variant="ghost" size="icon" onClick={() => onEdit(student)} iconName="Edit" />
          <Button variant="ghost" size="icon" onClick={() => onManageClass(student)} iconName="BookOpen" />
          {onToggleActive && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleActive(student)}
              disabled={toggleLoading}
              title={student?.status === 'Active' ? 'Deactivate account' : 'Activate account'}>
              <Icon
                name={student?.status === 'Active' ? 'UserX' : 'UserCheck'}
                size={16}
                className={student?.status === 'Active' ? 'text-warning' : 'text-success'}
              />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onDelete(student)} iconName="Trash2" className="text-error hover:text-error" />
        </div>
      </td>
    </>
  );
};

export default StudentTableRow;
