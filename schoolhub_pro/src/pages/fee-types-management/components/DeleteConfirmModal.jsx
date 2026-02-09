import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, feeTypeName }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Delete Fee Type"
      description={
        <div className="flex items-center gap-3 p-4 bg-error/10 rounded-lg">
          <Icon name="AlertTriangle" size={24} color="var(--color-error)" />
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong>{feeTypeName}</strong>? This action cannot be undone.
          </p>
        </div>
      }
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="default" onClick={onConfirm} fullWidth className="bg-error hover:bg-error/90">
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;