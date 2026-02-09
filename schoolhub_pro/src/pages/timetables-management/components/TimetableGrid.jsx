import React, { forwardRef } from 'react';
import Icon from '../../../components/AppIcon';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_LABELS = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' };

const TYPE_COLORS = {
  lecture: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  lab: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  tutorial: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
};

export const FULL_SCHEDULE = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '09:55' },
  { start: '09:55', end: '10:05', isBreak: true, label: 'Break - 10 min' },
  { start: '10:05', end: '11:05' },
  { start: '11:05', end: '12:00' },
  { start: '12:00', end: '13:00', isBreak: true, label: 'Lunch Break - 1h' },
  { start: '14:00', end: '14:55' },
  { start: '14:55', end: '15:05', isBreak: true, label: 'Break - 10 min' },
  { start: '15:05', end: '16:05' },
  { start: '16:05', end: '17:00' },
];

const TimetableGrid = forwardRef(({ data = [], onSlotClick, onDeleteSlot }, ref) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No classes scheduled</h3>
        <p className="text-sm text-muted-foreground">Start by adding classes to the timetable</p>
      </div>
    );
  }

  // Build lookup: { "Monday_08:00-09:00": entry }
  const lookup = {};
  data.forEach(entry => {
    const key = `${entry.day}_${entry.startTime}-${entry.endTime}`;
    lookup[key] = entry;
  });

  const activeDays = DAYS.filter(day => data.some(e => e.day === day));

  // Show schedule from first to last used course slot, including breaks in between
  const usedKeys = new Set(data.map(e => `${e.startTime}-${e.endTime}`));
  const usedIndices = FULL_SCHEDULE
    .map((s, i) => (!s.isBreak && usedKeys.has(`${s.start}-${s.end}`)) ? i : -1)
    .filter(i => i !== -1);
  const firstIdx = Math.min(...usedIndices);
  const lastIdx = Math.max(...usedIndices);
  const visibleSchedule = FULL_SCHEDULE.slice(firstIdx, lastIdx + 1);

  return (
    <div className="overflow-x-auto" ref={ref}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-border bg-muted p-3 text-left font-semibold text-foreground min-w-[100px]">
              Time
            </th>
            {activeDays.map(day => (
              <th key={day} className="border border-border bg-muted p-3 text-center font-semibold text-foreground min-w-[150px]">
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleSchedule.map(slot => {
            const key = `${slot.start}-${slot.end}`;

            if (slot.isBreak) {
              return (
                <tr key={key}>
                  <td
                    colSpan={activeDays.length + 1}
                    className="border border-border bg-gray-200 dark:bg-gray-700 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300"
                  >
                    {slot.label}
                  </td>
                </tr>
              );
            }

            return (
              <tr key={key}>
                <td className="border border-border p-3 text-sm font-medium text-foreground bg-muted/50 whitespace-nowrap">
                  {slot.start} - {slot.end}
                </td>
                {activeDays.map(day => {
                  const entry = lookup[`${day}_${key}`];
                  if (!entry) {
                    return (
                      <td key={day} className="border border-border p-2 bg-surface">
                        <div className="h-16"></div>
                      </td>
                    );
                  }
                  const colorClass = TYPE_COLORS[entry.type] || TYPE_COLORS.lecture;
                  return (
                    <td key={day} className="border border-border p-2">
                      <div
                        className={`${colorClass} border rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow relative group`}
                        onClick={() => onSlotClick?.(entry)}
                      >
                        <div className="font-semibold text-sm text-foreground truncate">
                          {entry.subjectId?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {entry.teacherId?.name || ''}
                        </div>
                        {entry.room && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Icon name="MapPin" size={10} />
                            {entry.room}
                          </div>
                        )}
                        {entry.type !== 'lecture' && (
                          <span className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5 block">
                            {entry.type === 'lab' ? 'TP' : 'TD'}
                          </span>
                        )}
                        {/* Action buttons on hover */}
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); onSlotClick?.(entry); }}
                            className="p-1 rounded bg-primary/10 text-primary"
                            title="Edit"
                          >
                            <Icon name="Pencil" size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteSlot?.(entry); }}
                            className="p-1 rounded bg-error/10 text-error"
                            title="Delete"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

TimetableGrid.displayName = 'TimetableGrid';

export default TimetableGrid;
