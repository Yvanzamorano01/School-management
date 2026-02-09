import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_SM } from '../../../utils/avatar';

const StudentRoster = ({ 
  students = [], 
  attendance = {},
  onAttendanceChange,
  onBulkMark,
  isReadOnly = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students?.filter(student =>
    student?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    student?.rollNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-success text-success-foreground';
      case 'absent':
        return 'bg-error text-error-foreground';
      case 'late':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return 'CheckCircle';
      case 'absent':
        return 'XCircle';
      case 'late':
        return 'Clock';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Student Roster</h3>
            <p className="text-sm text-muted-foreground">
              {filteredStudents?.length} of {students?.length} students
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              />
            </div>

            {!isReadOnly && (
              <Button
                variant="outline"
                iconName="CheckCheck"
                iconPosition="left"
                onClick={() => onBulkMark('present')}
                className="whitespace-nowrap"
              >
                Mark All Present
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Roll Number
              </th>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              {!isReadOnly && (
                <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStudents?.map((student) => {
              const status = attendance?.[student?.id] || 'unmarked';
              
              return (
                <tr key={student?.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                        {hasValidPhoto(student?.photo) ? (
                          <img src={student.photo} alt={student?.photoAlt} className="w-full h-full object-cover" />
                        ) : getInitials(student?.name) ? (
                          <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: getAvatarColor(student?.name) }}>
                            {getInitials(student?.name)}
                          </div>
                        ) : (
                          <img src={DEFAULT_AVATAR_SM} alt="Default avatar" className="w-full h-full" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{student?.name}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">{student?.rollNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-foreground hidden sm:table-cell">
                    {student?.rollNumber}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(status)}`}>
                        <Icon name={getStatusIcon(status)} size={14} />
                        <span className="capitalize">{status}</span>
                      </span>
                    </div>
                  </td>
                  {!isReadOnly && (
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onAttendanceChange(student?.id, 'present')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-smooth ${
                            status === 'present' ?'bg-success text-success-foreground' :'bg-muted text-muted-foreground hover:bg-success/20'
                          }`}
                          title="Mark Present"
                        >
                          <Icon name="Check" size={16} />
                        </button>
                        <button
                          onClick={() => onAttendanceChange(student?.id, 'absent')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-smooth ${
                            status === 'absent' ?'bg-error text-error-foreground' :'bg-muted text-muted-foreground hover:bg-error/20'
                          }`}
                          title="Mark Absent"
                        >
                          <Icon name="X" size={16} />
                        </button>
                        <button
                          onClick={() => onAttendanceChange(student?.id, 'late')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-smooth ${
                            status === 'late' ?'bg-warning text-warning-foreground' :'bg-muted text-muted-foreground hover:bg-warning/20'
                          }`}
                          title="Mark Late"
                        >
                          <Icon name="Clock" size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredStudents?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No students found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRoster;