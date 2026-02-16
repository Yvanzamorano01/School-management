import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import StudentFeeRow from './components/StudentFeeRow';
import AssignFeeModal from './components/AssignFeeModal';
import PaymentModal from './components/PaymentModal';
import paymentService from '../../services/paymentService';
import classService from '../../services/classService';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';
import { formatCurrency } from '../../utils/format';

const StudentFeesManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currency } = useSchoolSettings();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = localStorage.getItem('userName') || 'Admin User';
  const userRole = localStorage.getItem('userRole') || 'admin';

  const breadcrumbItems = [
    { label: 'Admin Dashboard', path: '/admin-dashboard' },
    { label: 'Student Fees Management', path: '/student-fees-management' }
  ];

  const [classOptions, setClassOptions] = useState([{ value: 'all', label: 'All Classes' }]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Partially Paid', label: 'Partially Paid' },
    { value: 'Unpaid', label: 'Unpaid' }
  ];

  const [studentFees, setStudentFees] = useState([]);

  useEffect(() => {
    fetchStudentFees();
    fetchClasses();
  }, [currency]);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAll();
      const classes = Array.isArray(data) ? data : [];
      setClassOptions([
        { value: 'all', label: 'All Classes' },
        ...classes.map(c => ({ value: c.name?.toLowerCase(), label: c.name }))
      ]);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getStudentFees();
      const fees = Array.isArray(data) ? data : [];

      // Aggregate fee records by student
      const studentMap = {};
      fees.forEach(fee => {
        const sId = fee.studentId?._id || fee.studentId;
        const key = typeof sId === 'object' ? sId._id : sId;
        if (!key) return;
        if (!studentMap[key]) {
          studentMap[key] = {
            id: key,
            studentName: fee.studentId?.firstName
              ? `${fee.studentId.firstName} ${fee.studentId.lastName || ''}`
              : (fee.studentId?.name || 'N/A'),
            studentId: fee.studentId?.studentId || 'N/A',
            class: fee.studentId?.classId?.name || fee.classId?.name || 'N/A',
            section: fee.studentId?.sectionId?.name || '',
            assignedFees: [],
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            status: 'Unpaid'
          };
        }
        const feeTypeName = fee.feeTypeId?.name || 'Fee';
        if (!studentMap[key].assignedFees.includes(feeTypeName)) {
          studentMap[key].assignedFees.push(feeTypeName);
        }
        studentMap[key].totalAmount += fee.totalAmount || 0;
        studentMap[key].paidAmount += fee.paidAmount || 0;
        studentMap[key].pendingAmount += fee.balance || ((fee.totalAmount || 0) - (fee.paidAmount || 0));
      });

      // Determine overall status per student
      const formatted = Object.values(studentMap).map(s => ({
        ...s,
        status: s.paidAmount >= s.totalAmount ? 'Paid'
          : s.paidAmount > 0 ? 'Partially Paid'
            : 'Unpaid'
      }));

      setStudentFees(formatted);
    } catch (err) {
      console.error('Failed to fetch student fees:', err);
      setError(err.message || 'Failed to load student fees');
      setStudentFees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFees = () => {
    setShowAssignModal(true);
  };

  const handleRecordPayment = (student) => {
    setSelectedStudent(student);
    setShowPaymentModal(true);
  };

  const handleSaveAssignment = (assignmentData) => {
    console.log('Assigning fees:', assignmentData);
    setShowAssignModal(false);
  };

  const handleSavePayment = async (paymentData) => {
    try {
      await paymentService.create(paymentData);
      await fetchStudentFees();
      setShowPaymentModal(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Failed to record payment:', err);
      alert('Failed to record payment. Please try again.');
    }
  };

  const filteredStudents = studentFees?.filter(student => {
    const matchesClass = filterClass === 'all' || student?.class?.toLowerCase()?.includes(filterClass?.replace('-', ' '));
    const matchesStatus = filterStatus === 'all' || student?.status === filterStatus;
    const matchesSearch = student?.studentName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      student?.studentId?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesClass && matchesStatus && matchesSearch;
  });

  const totalStudents = studentFees?.length;
  const paidStudents = studentFees?.filter(s => s?.status === 'Paid')?.length;
  const partiallyPaidStudents = studentFees?.filter(s => s?.status === 'Partially Paid')?.length;
  const unpaidStudents = studentFees?.filter(s => s?.status === 'Unpaid')?.length;
  const totalCollected = studentFees?.reduce((sum, s) => sum + s?.paidAmount, 0);
  const totalPending = studentFees?.reduce((sum, s) => sum + s?.pendingAmount, 0);

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-6">
            <div className="h-10 bg-muted rounded mb-4"></div>
            <div className="h-8 bg-muted rounded w-20"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-6">
            <div className="h-6 bg-muted rounded mb-2 w-40"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        ))}
      </div>
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="h-10 bg-muted rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded mb-2"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AuthHeader
          userName={userName}
          userRole={userRole === 'admin' ? 'Administrator' : userRole}
          onLogout={() => { window.location.href = '/login'; }}
        />
        <Breadcrumb items={breadcrumbItems} />

        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Student Fees Management</h1>
              <p className="text-muted-foreground mt-1">Manage student fee assignments and track payment status</p>
            </div>
            <Button iconName="Plus" onClick={handleAssignFees}>
              Assign Fees
            </Button>
          </div>

          {error && (
            <div className="bg-error/10 border border-error rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="AlertCircle" size={20} color="var(--color-error)" />
                <div>
                  <p className="text-error font-medium">Failed to load student fees</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={fetchStudentFees}>
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name="Users" size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Total Students</h3>
                      <p className="text-sm text-muted-foreground">Enrolled</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
                </div>

                <div className="bg-surface rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Paid</h3>
                      <p className="text-sm text-muted-foreground">Fully paid</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{paidStudents}</div>
                </div>

                <div className="bg-surface rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Icon name="Clock" size={20} color="var(--color-warning)" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Partially Paid</h3>
                      <p className="text-sm text-muted-foreground">In progress</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{partiallyPaidStudents}</div>
                </div>

                <div className="bg-surface rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                      <Icon name="XCircle" size={20} color="var(--color-error)" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Unpaid</h3>
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{unpaidStudents}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="DollarSign" size={24} color="var(--color-success)" />
                    <h3 className="font-semibold text-foreground">Total Collected</h3>
                  </div>
                  <div className="text-3xl font-bold text-success">{formatCurrency(totalCollected, currency)}</div>
                </div>

                <div className="bg-surface rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="AlertCircle" size={24} color="var(--color-warning)" />
                    <h3 className="font-semibold text-foreground">Total Pending</h3>
                  </div>
                  <div className="text-3xl font-bold text-warning">{formatCurrency(totalPending, currency)}</div>
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by student name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e?.target?.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Select
                    options={classOptions}
                    value={filterClass}
                    onChange={setFilterClass}
                    className="w-full md:w-48"
                  />
                  <Select
                    options={statusOptions}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    className="w-full md:w-48"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">STUDENT</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">CLASS</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ASSIGNED FEES</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">TOTAL AMOUNT</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">PAID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">PENDING</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">STATUS</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents?.map((student) => (
                        <StudentFeeRow
                          key={student?.id}
                          student={student}
                          onRecordPayment={handleRecordPayment}
                          currency={currency}
                        />
                      ))}
                    </tbody>
                  </table>

                  {filteredStudents?.length === 0 && (
                    <div className="text-center py-12">
                      <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No students found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showAssignModal && (
        <AssignFeeModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSave={handleSaveAssignment}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedStudent(null);
          }}
          onSave={handleSavePayment}
          student={selectedStudent}
          currency={currency}
        />
      )}
    </div>
  );
};

export default StudentFeesManagement;