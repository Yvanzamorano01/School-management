import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ClassSelector = ({ 
  selectedClass, 
  onClassChange, 
  selectedDate, 
  onDateChange,
  classes = []
}) => {
  const today = new Date()?.toISOString()?.split('T')?.[0];

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon name="Calendar" size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Mark Attendance</h2>
          <p className="text-sm text-muted-foreground">Select class and date to begin</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Select Class"
          placeholder="Choose a class"
          options={classes}
          value={selectedClass}
          onChange={onClassChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Attendance Date <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e?.target?.value)}
              max={today}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              required
            />
            <Icon 
              name="CalendarDays" 
              size={18} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSelector;