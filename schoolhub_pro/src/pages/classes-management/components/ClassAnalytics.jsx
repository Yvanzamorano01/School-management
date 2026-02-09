import React from 'react';
import Icon from '../../../components/AppIcon';

const ClassAnalytics = ({ totalClasses, totalStudents, totalSections, activeClasses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Total Classes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Classes</p>
            <p className="text-2xl font-bold text-gray-900">{totalClasses}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="BookOpen" size={24} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* Total Students */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={24} className="text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Sections */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Sections</p>
            <p className="text-2xl font-bold text-gray-900">{totalSections}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="Layers" size={24} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Active Classes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Active Classes</p>
            <p className="text-2xl font-bold text-gray-900">{activeClasses}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Icon name="CheckCircle" size={24} className="text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAnalytics;