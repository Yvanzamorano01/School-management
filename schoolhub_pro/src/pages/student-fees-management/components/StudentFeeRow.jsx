import React from 'react';
import Icon from '../../../components/AppIcon';

const StudentFeeRow = ({ student, onRecordPayment }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-success/10 text-success';
      case 'Partially Paid':
        return 'bg-warning/10 text-warning';
      case 'Unpaid':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {student?.studentName?.split(' ')?.map(n => n?.[0])?.join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{student?.studentName}</p>
            <p className="text-sm text-muted-foreground">{student?.studentId}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div>
          <p className="font-medium text-foreground">{student?.class}</p>
          <p className="text-sm text-muted-foreground">Section {student?.section}</p>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-wrap gap-1">
          {student?.assignedFees?.slice(0, 2)?.map((fee, idx) => (
            <span key={idx} className="px-2 py-1 bg-muted/50 rounded text-xs text-foreground">
              {fee}
            </span>
          ))}
          {student?.assignedFees?.length > 2 && (
            <span className="px-2 py-1 bg-muted/50 rounded text-xs text-foreground">
              +{student?.assignedFees?.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="font-semibold text-foreground">{student?.totalAmount?.toLocaleString()} FCFA</span>
      </td>
      <td className="py-4 px-4">
        <span className="font-semibold text-success">{student?.paidAmount?.toLocaleString()} FCFA</span>
      </td>
      <td className="py-4 px-4">
        <span className="font-semibold text-warning">{student?.pendingAmount?.toLocaleString()} FCFA</span>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student?.status)}`}>
          {student?.status}
        </span>
      </td>
      <td className="py-4 px-4">
        <button
          onClick={() => onRecordPayment?.(student)}
          className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Icon name="CreditCard" size={16} />
          Paiement
        </button>
      </td>
    </tr>
  );
};

export default StudentFeeRow;