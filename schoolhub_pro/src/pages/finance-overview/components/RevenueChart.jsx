import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../utils/format';

const RevenueChart = ({ data, currency }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="text-sm font-medium text-foreground mb-2">{payload?.[0]?.payload?.month}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-xs text-muted-foreground">Collected:</span>
              <span className="text-xs font-semibold text-foreground">
                {formatCurrency(payload?.[0]?.value, currency)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-warning" />
              <span className="text-xs text-muted-foreground">Pending:</span>
              <span className="text-xs font-semibold text-foreground">
                {formatCurrency(payload?.[1]?.value, currency)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-elevation-1">
      <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Revenue Trends</h3>
      <div className="w-full h-64 md:h-80" aria-label="Monthly Revenue Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="month"
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}k` : value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="square"
            />
            <Bar
              dataKey="collected"
              fill="var(--color-primary)"
              radius={[8, 8, 0, 0]}
              name="Collected"
            />
            <Bar
              dataKey="pending"
              fill="var(--color-warning)"
              radius={[8, 8, 0, 0]}
              name="Pending"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;