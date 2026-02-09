import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, sectionName, className }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Delete Section"
      description="" 
      footer={null}
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="AlertTriangle" size={32} className="text-red-600" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you sure you want to delete this section?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            You are about to delete <span className="font-semibold">{sectionName}</span> from <span className="font-semibold">{className}</span>.
          </p>
        </div>

        {/* Warning Box */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="AlertCircle" size={20} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-2">This action cannot be undone!</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>All students in this section will need to be reassigned</li>
                <li>Teacher assignments will be removed</li>
                <li>Historical data may be affected</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Icon name="Trash2" size={18} />
            Delete Section
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;