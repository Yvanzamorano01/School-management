import React from 'react';
import Button from '../../../components/ui/Button';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_SM } from '../../../utils/avatar';

const TeacherTableRow = ({ teacher, onView, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-success/10 text-success',
      'Inactive': 'bg-muted text-muted-foreground'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  const initials = getInitials(teacher?.name);
  const avatarColor = getAvatarColor(teacher?.name);

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors duration-250">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted">
            {hasValidPhoto(teacher?.photo) ? (
              <img src={teacher.photo} alt={teacher?.photoAlt} className="w-full h-full object-cover" />
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
              {teacher?.name}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground truncate">
              {teacher?.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="text-sm text-foreground">{teacher?.phone}</div>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {teacher?.subjects?.map((subject, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary"
            >
              {subject}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-4 hidden xl:table-cell">
        <div className="text-sm text-foreground">
          {teacher?.classes?.join(', ')}
        </div>
      </td>
      <td className="px-4 py-4 hidden sm:table-cell">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(teacher?.status)}`}>
          {teacher?.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => onView(teacher)} iconName="Eye" className="hidden sm:flex" />
          <Button variant="ghost" size="icon" onClick={() => onEdit(teacher)} iconName="Edit" />
          <Button variant="ghost" size="icon" onClick={() => onDelete(teacher)} iconName="Trash2" className="text-error hover:text-error" />
        </div>
      </td>
    </tr>
  );
};

export default TeacherTableRow;
