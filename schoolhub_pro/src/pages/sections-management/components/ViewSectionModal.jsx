import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Icon from '../../../components/AppIcon';
import sectionService from '../../../services/sectionService';

const ViewSectionModal = ({ isOpen, onClose, section }) => {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (isOpen && section?.id) {
      fetchStudents();
    }
  }, [isOpen, section?.id]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await sectionService.getStudents(section.id);
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const enrollmentPercentage = section?.capacity > 0
    ? Math.round((section?.enrolled / section?.capacity) * 100)
    : 0;

  const getEnrollmentStatus = (percentage) => {
    if (percentage >= 90) return { label: 'Nearly Full', color: 'red' };
    if (percentage >= 75) return { label: 'High Enrollment', color: 'orange' };
    if (percentage >= 50) return { label: 'Moderate', color: 'yellow' };
    return { label: 'Available', color: 'green' };
  };

  const status = getEnrollmentStatus(enrollmentPercentage);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Section Details" description="" size="lg" footer={null}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Header Info */}
        <div className="flex items-start justify-between pb-4 border-b">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Icon name="Layers" size={32} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{section?.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Parent Class:</span> {section?.className}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${status?.color}-100 text-${status?.color}-800`}>
            {status?.label}
          </span>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Icon name="DoorOpen" size={18} className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Room Number</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{section?.room}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Icon name="Users" size={18} className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Capacity</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{section?.capacity} students</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Icon name="UserCheck" size={18} className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Enrolled</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{section?.enrolled} students</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Icon name="TrendingUp" size={18} className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Enrollment Rate</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{enrollmentPercentage}%</p>
          </div>
        </div>

        {/* Enrollment Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Enrollment Progress</span>
            <span className="text-sm text-gray-600">{section?.enrolled} / {section?.capacity}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all bg-${status?.color}-500`}
              style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Assigned Teachers */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Icon name="Users" size={18} className="mr-2" />
            Assigned Teachers ({section?.teachers?.length || 0})
          </h4>
          {section?.teachers?.length > 0 ? (
            <div className="space-y-2">
              {section?.teachers?.map((teacher, index) => (
                <div key={teacher?.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-600">
                        {teacher?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{teacher?.name}</p>
                      <p className="text-xs text-gray-600">{teacher?.subject}</p>
                    </div>
                  </div>
                  <Icon name="CheckCircle" size={18} className="text-green-600" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <Icon name="UserX" size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">No teachers assigned yet</p>
            </div>
          )}
        </div>

        {/* Students List */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Icon name="GraduationCap" size={18} className="mr-2" />
            Enrolled Students ({students?.length || 0})
          </h4>
          {loadingStudents ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : students?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {students.map((student, index) => (
                <div key={student._id || student.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-green-600">
                        {student?.name?.split(' ')?.map(n => n?.[0])?.join('') || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student?.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {student?.studentId && <span>{student.studentId}</span>}
                        {student?.rollNumber && <span>Roll: {student.rollNumber}</span>}
                        {student?.gender && <span>{student.gender}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    student?.status === 'Active' ? 'bg-green-100 text-green-700' :
                    student?.status === 'Inactive' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {student?.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <Icon name="UserX" size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">No students enrolled yet</p>
            </div>
          )}
        </div>

        {/* Available Seats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="Info" size={20} className="text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Available Seats</p>
              <p>This section has <span className="font-bold">{Math.max((section?.capacity || 0) - (section?.enrolled || 0), 0)}</span> seats available for new student enrollment.</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSectionModal;
