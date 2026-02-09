import React from 'react';
import Modal from '../../../components/ui/Modal';
import Icon from '../../../components/AppIcon';

const ViewFeeTypeModal = ({ isOpen, onClose, feeType }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Type Details" description="" footer={null}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Tag" size={32} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{feeType?.name}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
              feeType?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}>
              {feeType?.status}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Description</label>
          <p className="text-foreground mt-1">{feeType?.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <p className="text-lg font-semibold text-foreground mt-1">{feeType?.amount?.toLocaleString()} FCFA</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Due Date</label>
            <p className="text-lg font-semibold text-foreground mt-1">{feeType?.dueDate}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Frequency</label>
          <p className="text-foreground mt-1">{feeType?.frequency}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Applicable Classes</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {feeType?.applicableClasses?.map((cls, idx) => (
              <span key={idx} className="px-3 py-1 bg-muted/50 rounded-full text-sm text-foreground">
                {cls}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewFeeTypeModal;