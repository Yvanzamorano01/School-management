import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_LG } from '../../../utils/avatar';

const ViewTeacherModal = ({ isOpen, onClose, teacher }) => {
  if (!teacher) return null;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Teacher Details"
      description="View complete teacher information"
      size="lg"
      footer={
        <Button onClick={onClose}>Close</Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {hasValidPhoto(teacher?.photo) ? (
              <img src={teacher.photo} alt={teacher?.photoAlt} className="w-full h-full object-cover" />
            ) : initials ? (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold" style={{ backgroundColor: avatarColor }}>
                {initials}
              </div>
            ) : (
              <img src={DEFAULT_AVATAR_LG} alt="Default avatar" className="w-full h-full" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-1">{teacher?.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{teacher?.teacherId}</p>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(teacher?.status)}`}>
              {teacher?.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm text-foreground mt-1">{teacher?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Phone</label>
            <p className="text-sm text-foreground mt-1">{teacher?.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Qualification</label>
            <p className="text-sm text-foreground mt-1">{teacher?.qualification}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Experience</label>
            <p className="text-sm text-foreground mt-1">{teacher?.experience}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Join Date</label>
            <p className="text-sm text-foreground mt-1">{teacher?.joinDate}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Subjects</label>
          <div className="flex flex-wrap gap-2">
            {teacher?.subjects?.map((subject, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary">
                {subject}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Classes</label>
          <div className="flex flex-wrap gap-2">
            {teacher?.classes?.map((cls, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/10 text-secondary">
                {cls}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewTeacherModal;
