import React from 'react';
import Icon from '../../../components/AppIcon';

const ResultsTable = ({ results }) => {
  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'text-success bg-success/10',
      'A': 'text-success bg-success/10',
      'B+': 'text-primary bg-primary/10',
      'B': 'text-primary bg-primary/10',
      'C+': 'text-warning bg-warning/10',
      'C': 'text-warning bg-warning/10',
      'D': 'text-error bg-error/10',
      'F': 'text-destructive bg-destructive/10'
    };
    return gradeColors?.[grade] || 'text-muted-foreground bg-muted';
  };

  const getPerformanceIcon = (performance) => {
    if (performance === 'excellent') return { name: 'TrendingUp', color: 'text-success' };
    if (performance === 'good') return { name: 'ArrowUp', color: 'text-primary' };
    if (performance === 'average') return { name: 'Minus', color: 'text-warning' };
    return { name: 'TrendingDown', color: 'text-error' };
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-foreground">Subject</th>
              <th className="text-center px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-foreground">Code</th>
              <th className="text-center px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-foreground">Marks</th>
              <th className="text-center px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-foreground">Grade</th>
              <th className="text-center px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-foreground">GPA</th>
              <th className="text-center px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-foreground">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {results?.map((result) => {
              const perfIcon = getPerformanceIcon(result?.performance);
              return (
                <tr key={result?.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="font-medium text-sm md:text-base text-foreground">{result?.subject}</div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">{result?.teacher}</div>
                  </td>
                  <td className="text-center px-4 md:px-6 py-3 md:py-4">
                    <span className="text-xs md:text-sm text-muted-foreground font-mono">{result?.code}</span>
                  </td>
                  <td className="text-center px-4 md:px-6 py-3 md:py-4">
                    <span className="text-sm md:text-base font-semibold text-foreground">{result?.marks}/{result?.totalMarks}</span>
                  </td>
                  <td className="text-center px-4 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-semibold ${getGradeColor(result?.grade)}`}>
                      {result?.grade}
                    </span>
                  </td>
                  <td className="text-center px-4 md:px-6 py-3 md:py-4">
                    <span className="text-sm md:text-base font-semibold text-foreground">{result?.gpa}</span>
                  </td>
                  <td className="text-center px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Icon name={perfIcon?.name} size={16} className={perfIcon?.color} />
                      <span className="text-xs md:text-sm text-muted-foreground capitalize">{result?.performance}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;