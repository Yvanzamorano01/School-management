import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/format';

const FeeTypeCard = ({ title, collected, pending, total, collectionRate, icon, currency }) => {
  const getStatusColor = () => {
    if (collectionRate >= 80) return 'var(--color-success)';
    if (collectionRate >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-elevation-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name={icon} size={20} color="var(--color-primary)" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">Total: {formatCurrency(total, currency)}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Collected</span>
          <span className="text-sm font-semibold text-success">{formatCurrency(collected, currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Pending</span>
          <span className="text-sm font-semibold text-warning">{formatCurrency(pending, currency)}</span>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Collection Rate</span>
            <span className="text-xs font-semibold" style={{ color: getStatusColor() }}>
              {collectionRate}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${collectionRate}%`,
                backgroundColor: getStatusColor()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeTypeCard;