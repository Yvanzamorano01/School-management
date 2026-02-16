import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_SM } from '../../../utils/avatar';

const ParentTableRow = ({ parent, onView, onEdit, onDelete, onToggleActive, toggleLoading }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-success/10 text-success',
      'Inactive': 'bg-muted text-muted-foreground'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  const initials = getInitials(parent?.name);
  const avatarColor = getAvatarColor(parent?.name);

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors duration-250">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted">
            {hasValidPhoto(parent?.photo) ? (
              <img src={parent.photo} alt={parent?.photoAlt} className="w-full h-full object-cover" />
            ) : initials ? (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: avatarColor }}>
                {initials}
              </div>
            ) : (
              <img src={DEFAULT_AVATAR_SM} alt="Default avatar" className="w-full h-full" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground text-sm md:text-base truncate">
              {parent?.name}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground truncate">
              {parent?.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="text-sm text-foreground">{parent?.phone}</div>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="text-sm text-foreground">
          {parent?.children?.join(', ') || 'No children linked'}
        </div>
      </td>
      <td className="px-4 py-4 hidden sm:table-cell">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(parent?.status)}`}>
          {parent?.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => onView(parent)} iconName="Eye" />
          <Button variant="ghost" size="icon" onClick={() => onEdit(parent)} iconName="Edit" />
          {onToggleActive && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleActive(parent)}
              disabled={toggleLoading}
              title={parent?.status === 'Active' ? 'Deactivate account' : 'Activate account'}>
              <Icon
                name={parent?.status === 'Active' ? 'UserX' : 'UserCheck'}
                size={16}
                className={parent?.status === 'Active' ? 'text-warning' : 'text-success'}
              />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onDelete(parent)} iconName="Trash2" className="text-error hover:text-error" />
        </div>
      </td>
    </tr>
  );
};

export default ParentTableRow;
