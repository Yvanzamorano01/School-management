import React from 'react';
import Icon from '../../../components/AppIcon';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_SM } from '../../../utils/avatar';

const RecentTransactionItem = ({ transaction }) => {
  const getStatusColor = () => {
    if (transaction?.status === 'completed') return 'text-success';
    if (transaction?.status === 'pending') return 'text-warning';
    return 'text-error';
  };

  const getStatusBg = () => {
    if (transaction?.status === 'completed') return 'bg-success/10';
    if (transaction?.status === 'pending') return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getPaymentMethodIcon = () => {
    if (transaction?.paymentMethod === 'Cash') return 'Banknote';
    if (transaction?.paymentMethod === 'Bank Transfer') return 'Building2';
    if (transaction?.paymentMethod === 'Mobile Money') return 'Smartphone';
    return 'CreditCard';
  };

  const initials = getInitials(transaction?.studentName);
  const avatarColor = getAvatarColor(transaction?.studentName);

  return (
    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-muted/50 rounded-lg transition-smooth">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-muted">
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
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card border-2 border-card rounded-full flex items-center justify-center">
          <Icon name={getPaymentMethodIcon()} size={12} color="var(--color-primary)" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-foreground truncate">
            {transaction?.studentName}
          </h4>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {transaction?.amount?.toLocaleString()} FCFA
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{transaction?.feeType}</span>
          <span className="text-xs text-muted-foreground">&bull;</span>
          <span className="text-xs text-muted-foreground">{transaction?.paymentMethod}</span>
          <span className="text-xs text-muted-foreground">&bull;</span>
          <span className="text-xs text-muted-foreground">{transaction?.date}</span>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-md ${getStatusBg()} flex-shrink-0`}>
        <span className={`text-xs font-medium capitalize ${getStatusColor()}`}>
          {transaction?.status}
        </span>
      </div>
    </div>
  );
};

export default RecentTransactionItem;
