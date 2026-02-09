import React from 'react';

const ClassRevenueTable = ({ classData }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">Revenue by Class</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">Class</th>
              <th className="text-right py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">Students</th>
              <th className="text-right py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">Collected</th>
              <th className="text-right py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">Outstanding</th>
              <th className="text-right py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">Collection %</th>
            </tr>
          </thead>
          <tbody>
            {classData?.map((item, index) => (
              <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/50 transition-smooth">
                <td className="py-3 px-2 md:px-4 text-sm md:text-base font-medium text-foreground">{item?.className}</td>
                <td className="py-3 px-2 md:px-4 text-sm md:text-base text-right text-foreground whitespace-nowrap">{item?.students}</td>
                <td className="py-3 px-2 md:px-4 text-sm md:text-base text-right font-semibold text-success whitespace-nowrap">{item?.collected?.toLocaleString()} FCFA</td>
                <td className="py-3 px-2 md:px-4 text-sm md:text-base text-right font-semibold text-error whitespace-nowrap">{item?.outstanding?.toLocaleString()} FCFA</td>
                <td className="py-3 px-2 md:px-4 text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item?.collectionRate >= 80 ? 'bg-success/10 text-success' :
                    item?.collectionRate >= 60 ? 'bg-warning/10 text-warning': 'bg-error/10 text-error'
                  }`}>
                    {item?.collectionRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassRevenueTable;