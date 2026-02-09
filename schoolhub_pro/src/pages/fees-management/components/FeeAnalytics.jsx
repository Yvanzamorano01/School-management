import React from 'react';
import Icon from '../../../components/AppIcon';

const FeeAnalytics = () => {
  // TODO: Data should come from API
  const analyticsData = [];
  const classWiseData = [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData?.map((item, index) => (
          <div key={index} className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${item?.color}/10 flex items-center justify-center`}>
                <Icon name={item?.icon} size={20} color={`var(--color-${item?.color})`} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{item?.label}</div>
                <div className="text-xl font-bold text-foreground">{item?.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-4">Class-wise Fee Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Class</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Students</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Total Fees</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Collected</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Pending</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              {classWiseData?.map((row, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{row?.class}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row?.students}</td>
                  <td className="py-3 px-4 text-foreground font-semibold">{row?.totalFees}</td>
                  <td className="py-3 px-4 text-success">{row?.collected}</td>
                  <td className="py-3 px-4 text-warning">{row?.pending}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      {row?.rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeAnalytics;