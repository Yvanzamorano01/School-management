import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_LG } from '../../../utils/avatar';

const ViewParentModal = ({ isOpen, onClose, parent }) => {
  if (!parent) return null;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Parent Details"
      description="View complete parent information and linked children"
      size="lg"
      footer={
        <Button onClick={onClose}>Close</Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {hasValidPhoto(parent?.photo) ? (
              <img src={parent.photo} alt={parent?.photoAlt} className="w-full h-full object-cover" />
            ) : initials ? (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold" style={{ backgroundColor: avatarColor }}>
                {initials}
              </div>
            ) : (
              <img src={DEFAULT_AVATAR_LG} alt="Default avatar" className="w-full h-full" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-1">{parent?.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{parent?.parentId}</p>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(parent?.status)}`}>
              {parent?.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm text-foreground mt-1">{parent?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Phone</label>
            <p className="text-sm text-foreground mt-1">{parent?.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Occupation</label>
            <p className="text-sm text-foreground mt-1">{parent?.occupation || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <p className="text-sm text-foreground mt-1">{parent?.address}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-3 block">Linked Children</label>
          <div className="space-y-2">
            {parent?.children?.map((child, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="User" size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{child}</span>
                </div>
                <Button variant="ghost" size="sm" iconName="ExternalLink">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewParentModal;
