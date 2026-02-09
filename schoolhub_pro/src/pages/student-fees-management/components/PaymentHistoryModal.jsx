import React from 'react';
import Modal from '../../../components/ui/Modal';
import Icon from '../../../components/AppIcon';

const PaymentHistoryModal = ({ isOpen, onClose, student }) => {
  const mockPaymentHistory = [
    {
      id: 1,
      date: '2025-01-15',
      amount: 15000,
      method: 'Bank Transfer',
      feeType: 'Tuition',
      receiptNo: 'RCP-2025-001'
    },
    {
      id: 2,
      date: '2024-12-20',
      amount: 8000,
      method: 'Cash',
      feeType: 'Transport',
      receiptNo: 'RCP-2024-456'
    },
    {
      id: 3,
      date: '2024-11-30',
      amount: 2500,
      method: 'Mobile Money',
      feeType: 'Exam Fees',
      receiptNo: 'RCP-2024-389'
    }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Payment History"
      description="" 
      footer={null}
    >
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-lg">
            {student?.studentAvatar}
          </div>
          <div>
            <div className="font-semibold text-foreground text-lg">{student?.studentName}</div>
            <div className="text-sm text-muted-foreground">{student?.class} - {student?.section}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total Fees</div>
            <div className="font-semibold text-foreground">{student?.totalFees?.toLocaleString()} FCFA</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Paid</div>
            <div className="font-semibold text-success">{student?.paidAmount?.toLocaleString()} FCFA</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
            <div className="font-semibold text-error">{student?.outstandingBalance?.toLocaleString()} FCFA</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground mb-3">Transaction History</h3>
        {mockPaymentHistory?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-2 opacity-50" />
            <p>No payment history available</p>
          </div>
        ) : (
          mockPaymentHistory?.map((payment) => (
            <div key={payment?.id} className="p-4 bg-surface border border-border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{payment?.amount?.toLocaleString()} FCFA</div>
                    <div className="text-sm text-muted-foreground">{payment?.feeType}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{payment?.date}</div>
                  <div className="text-xs text-muted-foreground">{payment?.method}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Receipt: {payment?.receiptNo}</span>
                <button className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                  <Icon name="Download" size={14} />
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-border">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default PaymentHistoryModal;