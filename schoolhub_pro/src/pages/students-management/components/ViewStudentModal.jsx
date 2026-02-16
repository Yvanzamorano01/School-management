import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getInitials, getAvatarColor, hasValidPhoto, DEFAULT_AVATAR_LG } from '../../../utils/avatar';
import studentService from '../../../services/studentService';
import materialsService from '../../../services/materialsService';

const ViewStudentModal = ({ isOpen, onClose, student }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState([]);
  const [attendanceApiData, setAttendanceApiData] = useState(null);
  const [feesApiData, setFeesApiData] = useState(null);
  const [materialsData, setMaterialsData] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!isOpen || !student?.id) return;

      setLoading(true);
      try {
        const [results, attendance, fees, history] = await Promise.all([
          studentService.getStudentResults(student.id),
          studentService.getStudentAttendance(student.id),
          studentService.getStudentFees(student.id),
          studentService.getStudentHistory(student.id)
        ]);

        console.log('API History Response for', student.name, ':', history);

        setResultsData(results || []);
        setAttendanceApiData(attendance || null);
        setFeesApiData(fees || null);
        setHistoryData(history || []);

        // Fetch materials by student's classId
        if (student.classId) {
          const allMaterials = await materialsService.getAll({ classId: student.classId });
          setMaterialsData(Array.isArray(allMaterials) ? allMaterials : []);
        } else {
          setMaterialsData([]);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setResultsData([]);
        setAttendanceApiData(null);
        setFeesApiData(null);
        setMaterialsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [isOpen, student?.id]);

  if (!student) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'User' },
    { id: 'results', label: 'Academic Results', icon: 'Award' },
    { id: 'attendance', label: 'Attendance', icon: 'CalendarCheck' },
    { id: 'fees', label: 'Fees & Payments', icon: 'CreditCard' },
    { id: 'materials', label: 'Course Materials', icon: 'FolderOpen' },
    { id: 'history', label: 'History', icon: 'History' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-success/10 text-success',
      'Inactive': 'bg-muted text-muted-foreground',
      'Graduated': 'bg-primary/10 text-primary',
      'Transferred': 'bg-warning/10 text-warning'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon name={icon} size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-sm text-foreground font-medium break-words">{value || 'N/A'}</div>
      </div>
    </div>
  );

  const academicResults = resultsData?.map(result => ({
    subject: result?.examId?.subjectId?.name || 'N/A',
    score: result?.marksObtained || 0,
    maxScore: result?.examId?.totalMarks || 100,
    grade: result?.grade || ''
  })) || [];

  const attendanceData = attendanceApiData ? {
    totalDays: attendanceApiData?.summary?.total || 0,
    present: attendanceApiData?.summary?.present || 0,
    absent: attendanceApiData?.summary?.absent || 0,
    late: attendanceApiData?.summary?.late || 0,
    percentage: attendanceApiData?.summary?.attendanceRate || 0,
    recentRecords: attendanceApiData?.records?.slice(0, 5)?.map(record => ({
      date: new Date(record?.date)?.toLocaleDateString() || 'N/A',
      status: record?.status || 'N/A'
    })) || []
  } : null;

  const feesData = feesApiData ? {
    totalFees: feesApiData?.summary?.totalAmount || 0,
    paid: feesApiData?.summary?.paidAmount || 0,
    pending: feesApiData?.summary?.balance || 0,
    records: feesApiData?.fees?.map(fee => ({
      type: fee?.feeTypeId?.name || 'N/A',
      amount: fee?.totalAmount || 0,
      status: fee?.status || 'Pending',
      date: fee?.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A',
      dueDate: fee?.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'
    })) || []
  } : null;

  const courseMaterials = materialsData;

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'text-success';
    if (grade?.startsWith('B')) return 'text-primary';
    if (grade?.startsWith('C')) return 'text-accent';
    return 'text-warning';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Personal Information</h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <InfoRow icon="Calendar" label="Date of Birth" value={student?.dateOfBirth} />
                <InfoRow icon="User" label="Gender" value={student?.gender} />
                <InfoRow icon="Droplet" label="Blood Group" value={student?.bloodGroup} />
                <InfoRow icon="MapPin" label="Address" value={student?.address} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Academic Information</h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <InfoRow icon="BookOpen" label="Class" value={student?.class} />
                <InfoRow icon="Grid" label="Section" value={student?.section} />
                <InfoRow icon="Calendar" label="Admission Date" value={student?.admissionDate} />
                <InfoRow icon="Award" label="Roll Number" value={student?.rollNumber} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Parent/Guardian Information</h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <InfoRow icon="User" label="Parent Name" value={student?.parentName} />
                <InfoRow icon="Users" label="Relationship" value={student?.relationship} />
                <InfoRow icon="Phone" label="Contact Number" value={student?.parentContact} />
                <InfoRow icon="Mail" label="Email Address" value={student?.parentEmail} />
              </div>
            </div>
          </div>
        );

      case 'results':
        if (loading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
          );
        }

        if (!academicResults?.length) {
          return (
            <div className="text-center py-12">
              <Icon name="Award" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No academic results available</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-success/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {academicResults?.length > 0
                    ? ((academicResults?.reduce((sum, r) => sum + (r?.score / r?.maxScore * 100), 0) / academicResults?.length) || 0)?.toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Average Score</div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{academicResults?.length}</div>
                <div className="text-xs text-muted-foreground">Total Exams</div>
              </div>
              <div className="bg-accent/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent-foreground">
                  {academicResults?.reduce((sum, r) => sum + r?.score, 0) || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Marks</div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Subject</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Score</th>
                    {academicResults?.some(r => r?.grade) && (
                      <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Grade</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {academicResults?.map((result, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-4 py-3 text-sm text-foreground">{result?.subject}</td>
                      <td className="px-4 py-3 text-sm text-center text-foreground">
                        {result?.score}/{result?.maxScore}
                      </td>
                      {academicResults?.some(r => r?.grade) && (
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${getGradeColor(result?.grade)}`}>
                            {result?.grade || '-'}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'attendance':
        if (loading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
          );
        }

        if (!attendanceData) {
          return (
            <div className="text-center py-12">
              <Icon name="CalendarCheck" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No attendance data available</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-success/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">{attendanceData?.present || 0}</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>
              <div className="bg-error/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-error">{attendanceData?.absent || 0}</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>
              <div className="bg-warning/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-warning">{attendanceData?.late || 0}</div>
                <div className="text-xs text-muted-foreground">Late</div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{attendanceData?.percentage?.toFixed(1) || 0}%</div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-sm font-medium text-foreground">Attendance Progress</h5>
                <span className="text-sm text-muted-foreground">{attendanceData?.present || 0}/{attendanceData?.totalDays || 0} days</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full"
                  style={{ width: `${attendanceData?.percentage || 0}%` }}
                />
              </div>
            </div>

            {attendanceData?.recentRecords?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-foreground mb-3">Recent Attendance</h5>
                <div className="bg-muted/30 rounded-lg divide-y divide-border">
                  {attendanceData?.recentRecords?.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-foreground">{record?.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record?.status === 'Present' ? 'bg-success/10 text-success' :
                        record?.status === 'Absent' ? 'bg-error/10 text-error' :
                          'bg-warning/10 text-warning'
                        }`}>
                        {record?.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'fees':
        if (loading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
          );
        }

        if (!feesData) {
          return (
            <div className="text-center py-12">
              <Icon name="CreditCard" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No fees data available</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{(feesData?.totalFees || 0)?.toLocaleString()} FCFA</div>
                <div className="text-xs text-muted-foreground">Total Fees</div>
              </div>
              <div className="bg-success/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">{(feesData?.paid || 0)?.toLocaleString()} FCFA</div>
                <div className="text-xs text-muted-foreground">Paid</div>
              </div>
              <div className="bg-warning/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-warning">{(feesData?.pending || 0)?.toLocaleString()} FCFA</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>

            {feesData?.records?.length > 0 ? (
              <div className="bg-muted/30 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Fee Type</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feesData?.records?.map((record, idx) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="px-4 py-3 text-sm text-foreground">{record?.type}</td>
                        <td className="px-4 py-3 text-sm text-right text-foreground">{(record?.amount || 0)?.toLocaleString()} FCFA</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${record?.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            }`}>
                            {record?.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                          {record?.date || record?.dueDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No fee records available</p>
              </div>
            )}
          </div>
        );

      case 'materials':
        if (loading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
          );
        }

        if (!courseMaterials?.length) {
          return (
            <div className="text-center py-12">
              <Icon name="FolderOpen" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No course materials available</p>
            </div>
          );
        }

        return (
          <div className="space-y-3">
            {courseMaterials?.map((material, idx) => {
              const materialTypeIcon = {
                'Course': 'BookOpen',
                'Assignment': 'ClipboardList',
                'Worksheet': 'FileSpreadsheet',
                'Solution': 'CheckCircle',
                'Other': 'FileText'
              };
              const iconName = materialTypeIcon[material?.type] || 'FileText';

              return (
                <div
                  key={material?._id || idx}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name={iconName} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{material?.title || 'Untitled'}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {material?.type && <span>{material.type}</span>}
                      {material?.subjectId?.name && (
                        <>
                          <span>•</span>
                          <span>{material.subjectId.name}</span>
                        </>
                      )}
                      {material?.createdAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {material?.fileUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(material.fileUrl, '_blank')}
                    >
                      <Icon name="ExternalLink" size={16} />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground px-2">No file</span>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'history':
        if (loading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
          );
        }

        if (!historyData?.length) {
          return (
            <div className="text-center py-12">
              <Icon name="History" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No academic history available</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="relative border-l-2 border-muted ml-3 space-y-8 pl-6 py-2">
              {historyData.map((record, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {record.academicYearId?.name || 'Unknown Year'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {record.classId?.name} - {record.sectionId?.name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${record.status === 'Promoted' ? 'bg-success/10 text-success' :
                      record.status === 'Retained' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                      {record.status}
                    </span>
                  </div>
                  {record.remarks && (
                    <p className="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                      {record.remarks}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(record.promotionDate || record.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Details"
      size="lg"
      footer={
        <Button onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Student Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {hasValidPhoto(student?.photo) ? (
              <img src={student.photo} alt={student?.photoAlt} className="w-full h-full object-cover" />
            ) : getInitials(student?.name) ? (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold" style={{ backgroundColor: getAvatarColor(student?.name) }}>
                {getInitials(student?.name)}
              </div>
            ) : (
              <img src={DEFAULT_AVATAR_LG} alt="Default avatar" className="w-full h-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
              {student?.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>ID: {student?.studentId}</span>
              <span>•</span>
              <span>{student?.class} - {student?.section}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(student?.status)}`}>
            {student?.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab?.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span className="hidden sm:inline">{tab?.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
};

export default ViewStudentModal;
