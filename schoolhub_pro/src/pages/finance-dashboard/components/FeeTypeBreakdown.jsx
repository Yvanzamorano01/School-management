import React from 'react';
import { formatCurrency } from '../../../utils/format';

const FeeTypeBreakdown = ({ feeTypes, currency }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">Fee Type Breakdown</h3>
      <div className="space-y-3 md:space-y-4">
        {feeTypes?.map((fee, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: fee?.color }}
                />
                <span className="text-sm md:text-base text-foreground">{fee?.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm md:text-base font-semibold text-foreground">
                  {formatCurrency(fee?.collected, currency)}
                </p>
                <p className="text-xs text-muted-foreground">{fee?.percentage}%</p>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${fee?.percentage}%`,
                  backgroundColor: fee?.color
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Outstanding: {formatCurrency(fee?.outstanding, currency)}</span>
              <span>Total: {formatCurrency(fee?.total, currency)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeeTypeBreakdown;