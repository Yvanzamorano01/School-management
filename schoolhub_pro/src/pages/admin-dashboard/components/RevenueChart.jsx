import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../utils/format';

const RevenueChart = ({ data, currency }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-elevation-1">
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Revenue Trends</h3>
        <p className="text-sm text-muted-foreground">Monthly revenue overview</p>
      </div>
      <div className="w-full h-64 md:h-80" aria-label="Monthly Revenue Area Chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              formatter={(value) => [formatCurrency(value, currency), 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;