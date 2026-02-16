import React from 'react';
import Icon from '../../../components/AppIcon';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_SM } from '../../../utils/avatar';
import { formatCurrency } from '../../../utils/format';

const RecentTransactionItem = ({ transaction, currency }) => {
  const getPaymentMethodIcon = (method) => {
    const icons = {
      'Cash': 'Banknote',
      'Bank Transfer': 'Building2',
      'Mobile Money': 'Smartphone',
      'Cheque': 'FileText'
    };
    return icons?.[method] || 'DollarSign';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'text-success bg-success/10',
      'Pending': 'text-warning bg-warning/10',
      'Failed': 'text-error bg-error/10'
    };
    return colors?.[status] || 'text-muted-foreground bg-muted';
  };

  const initials = getInitials(transaction?.studentName);
  const avatarColor = getAvatarColor(transaction?.studentName);

  return (
    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-muted/50 rounded-xl transition-smooth">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted">
        {hasValidPhoto(transaction?.studentImage) ? (
          <img src={transaction.studentImage} alt={transaction?.studentImageAlt} className="w-full h-full object-cover" />
        ) : initials ? (
          <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: avatarColor }}>
            {initials}
          </div>
        ) : (
          <img src={DEFAULT_AVATAR_SM} alt="Default avatar" className="w-full h-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm md:text-base font-medium text-foreground truncate">{transaction?.studentName}</h4>
          <span className="text-sm md:text-base font-semibold text-foreground whitespace-nowrap">
            {formatCurrency(transaction?.amount, currency)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs md:text-sm text-muted-foreground">{transaction?.feeType}</span>
          <span className="text-muted-foreground">&bull;</span>
          <div className="flex items-center gap-1">
            <Icon name={getPaymentMethodIcon(transaction?.paymentMethod)} size={14} className="text-muted-foreground" />
            <span className="text-xs md:text-sm text-muted-foreground">{transaction?.paymentMethod}</span>
          </div>
          <span className="text-muted-foreground">&bull;</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(transaction?.status)}`}>
            {transaction?.status}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-1">{transaction?.date}</p>
      </div>
    </div>
  );
};

export default RecentTransactionItem;
