import React from 'react';
import Icon from '../../../components/AppIcon';


const SectionTableRow = ({ section, onView, onEdit, onDelete }) => {
  const enrollmentPercentage = section?.capacity > 0 
    ? Math.round((section?.enrolled / section?.capacity) * 100) 
    : 0;

  const getEnrollmentColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-orange-600 bg-orange-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Section Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Icon name="Layers" size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{section?.name}</p>
            <p className="text-xs text-gray-500">Room {section?.room}</p>
          </div>
        </div>
      </td>

      {/* Parent Class */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          {section?.className}
        </span>
      </td>

      {/* Room */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Icon name="DoorOpen" size={16} className="mr-2 text-gray-400" />
          {section?.room}
        </div>
      </td>

      {/* Capacity */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{section?.capacity}</div>
      </td>

      {/* Enrolled */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900 mr-2">{section?.enrolled}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnrollmentColor(enrollmentPercentage)}`}>
            {enrollmentPercentage}%
          </span>
        </div>
      </td>

      {/* Assigned Teachers */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          {section?.teachers?.length > 0 ? (
            section?.teachers?.slice(0, 2)?.map((teacher, idx) => (
              <div key={teacher?.id || idx} className="flex items-center text-xs text-gray-600">
                <Icon name="User" size={12} className="mr-1 text-gray-400" />
                <span className="truncate max-w-[150px]">
                  {teacher?.name}{teacher?.subject ? ` (${teacher.subject})` : ''}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No teachers assigned</span>
          )}
          {section?.teachers?.length > 2 && (
            <span className="text-xs text-blue-600">+{section?.teachers?.length - 2} more</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(section)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Icon name="Eye" size={18} />
          </button>
          <button
            onClick={() => onEdit(section)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit Section"
          >
            <Icon name="Pencil" size={18} />
          </button>
          <button
            onClick={() => onDelete(section)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Section"
          >
            <Icon name="Trash2" size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SectionTableRow;