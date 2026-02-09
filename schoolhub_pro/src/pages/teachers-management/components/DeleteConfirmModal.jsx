import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, teacherName }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Teacher"
      description="This action cannot be undone"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete Teacher
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 mx-auto">
          <Icon name="AlertTriangle" size={24} className="text-error" />
        </div>
        <p className="text-center text-foreground">
          Are you sure you want to delete <span className="font-semibold">{teacherName}</span>?
        </p>
        <p className="text-center text-sm text-muted-foreground">
          This will permanently remove the teacher from the system.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;