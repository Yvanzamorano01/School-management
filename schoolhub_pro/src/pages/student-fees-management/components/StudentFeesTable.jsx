import React from 'react';
import Button from '../../../components/ui/Button';


const StudentFeesTable = ({ data, onRecordPayment, onViewHistory }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'paid': { bg: 'bg-success/10', text: 'text-success', label: 'Paid' },
      'partially-paid': { bg: 'bg-warning/10', text: 'text-warning', label: 'Partially Paid' },
      'unpaid': { bg: 'bg-error/10', text: 'text-error', label: 'Unpaid' }
    };
    const config = statusConfig?.[status] || statusConfig?.['unpaid'];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">Student</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Class</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Total Fees</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Paid Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Outstanding</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Last Payment</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-muted-foreground">
                No students found
              </td>
            </tr>
          ) : (
            data?.map((student) => (
              <tr key={student?.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {student?.studentAvatar}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{student?.studentName}</div>
                      <div className="text-xs text-muted-foreground">
                        {student?.assignedFees?.join(', ')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {student?.class} - {student?.section}
                </td>
                <td className="py-3 px-4 text-foreground font-semibold">
                  {student?.totalFees?.toLocaleString()} FCFA
                </td>
                <td className="py-3 px-4 text-success font-semibold">
                  {student?.paidAmount?.toLocaleString()} FCFA
                </td>
                <td className="py-3 px-4 text-error font-semibold">
                  {student?.outstandingBalance?.toLocaleString()} FCFA
                </td>
                <td className="py-3 px-4">
                  {getStatusBadge(student?.paymentStatus)}
                </td>
                <td className="py-3 px-4 text-muted-foreground text-sm">
                  {student?.lastPaymentDate || 'No payment yet'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      iconName="CreditCard"
                      onClick={() => onRecordPayment?.(student)}
                      title="Record Payment"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      iconName="Eye"
                      onClick={() => onViewHistory?.(student)}
                      title="View History"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentFeesTable;