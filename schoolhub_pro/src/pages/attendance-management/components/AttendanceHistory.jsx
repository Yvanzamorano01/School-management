import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AttendanceHistory = ({ history = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date()?.getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date()?.getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0)?.getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1)?.getDay();
  };

  const getAttendanceForDate = (date) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1)?.padStart(2, '0')}-${String(date)?.padStart(2, '0')}`;
    return history?.find(h => h?.date === dateStr);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-success/20 text-success border-success/30';
      case 'absent':
        return 'bg-error/20 text-error border-error/30';
      case 'late':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const today = new Date();
  const isCurrentMonth = selectedMonth === today?.getMonth() && selectedYear === today?.getFullYear();

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Attendance History</h3>
          <p className="text-sm text-muted-foreground">Calendar view of attendance records</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronLeft"
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          />
          <div className="px-4 py-2 bg-background rounded-lg border border-border min-w-[140px] text-center">
            <span className="text-sm font-medium text-foreground">
              {months?.[selectedMonth]} {selectedYear}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronRight"
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay })?.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth })?.map((_, index) => {
          const date = index + 1;
          const attendance = getAttendanceForDate(date);
          const isToday = isCurrentMonth && date === today?.getDate();
          const isFuture = new Date(selectedYear, selectedMonth, date) > today;

          return (
            <div
              key={date}
              className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-smooth ${
                isFuture
                  ? 'bg-muted/30 text-muted-foreground/50 border-border/50'
                  : attendance
                  ? getStatusColor(attendance?.status)
                  : 'bg-background text-foreground border-border hover:border-primary/50'
              } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              <span className="text-xs md:text-sm font-medium">{date}</span>
              {attendance && (
                <Icon
                  name={
                    attendance?.status === 'present' ?'CheckCircle'
                      : attendance?.status === 'absent' ?'XCircle' :'Clock'
                  }
                  size={12}
                  className="mt-0.5"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
          <span className="text-xs text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-error/20 border border-error/30" />
          <span className="text-xs text-muted-foreground">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
          <span className="text-xs text-muted-foreground">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-background border border-border" />
          <span className="text-xs text-muted-foreground">Not Marked</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;