import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import studentService from '../../services/studentService';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';
import { formatCurrency } from '../../utils/format';

const MyFees = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { currency } = useSchoolSettings();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fees, setFees] = useState([]);
    const [summary, setSummary] = useState({ total: 0, paid: 0, pending: 0 });

    const userName = localStorage.getItem('userName') || 'Student';
    const userRole = 'Student';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/student-dashboard' },
        { label: 'My Fees', path: '/my-fees' }
    ];

    useEffect(() => {
        fetchFees();
    }, [currency]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            setError(null);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const profileId = user.profileId;

            if (!profileId) {
                setError('No student profile found. Please log out and log in again.');
                return;
            }

            const feesData = await studentService.getStudentFees(profileId);
            // getStudentFees returns { fees: [...], summary } or array
            const feesList = Array.isArray(feesData) ? feesData : (feesData?.fees || []);
            setFees(feesList);

            // Calculate summary
            const total = feesList.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
            const paid = feesList.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
            const pending = total - paid;
            setSummary({ total, paid, pending });
        } catch (err) {
            console.error('Error fetching fees:', err);
            setError(err.message || 'Failed to load fee information');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (fee) => {
        const paid = fee.paidAmount || 0;
        const total = fee.totalAmount || 0;

        if (paid >= total) {
            return <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Paid</span>;
        } else if (paid > 0) {
            return <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">Partial</span>;
        }
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-error/10 text-error">Unpaid</span>;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const LoadingSkeleton = () => (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6">
                        <div className="h-4 bg-muted rounded w-24 mb-3"></div>
                        <div className="h-8 bg-muted rounded w-32"></div>
                    </div>
                ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="h-6 bg-muted rounded w-40 mb-4"></div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded mb-2"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <StudentSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <AuthHeader userName={userName} userRole={userRole} />

            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="main-content-inner">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">My Fees</h1>
                        <p className="text-sm md:text-base text-muted-foreground">View your fee details and payment status</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error flex-1">{error}</p>
                            <button onClick={fetchFees} className="text-sm text-error hover:underline">Retry</button>
                        </div>
                    )}

                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Icon name="Receipt" size={20} className="text-primary" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Total Fees</span>
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">{formatCurrency(summary.total, currency)}</div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                                            <Icon name="CheckCircle" size={20} className="text-success" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Paid</span>
                                    </div>
                                    <div className="text-2xl font-bold text-success">{formatCurrency(summary.paid, currency)}</div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                                            <Icon name="Clock" size={20} className="text-warning" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Pending</span>
                                    </div>
                                    <div className="text-2xl font-bold text-warning">{formatCurrency(summary.pending, currency)}</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {summary.total > 0 && (
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-foreground">Payment Progress</span>
                                        <span className="text-sm text-muted-foreground">
                                            {Math.round((summary.paid / summary.total) * 100)}% paid
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-success rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((summary.paid / summary.total) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Fee Details Table */}
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="p-4 md:p-6 border-b border-border">
                                    <h2 className="text-lg font-semibold text-foreground">Fee Details</h2>
                                </div>

                                {fees.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold text-foreground mb-2">No fees assigned</h3>
                                        <p className="text-sm text-muted-foreground">You don't have any fees assigned yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-muted/50">
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Fee Type</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Paid</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Balance</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Due Date</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fees.map((fee, index) => (
                                                    <tr key={fee._id || index} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                    <Icon name="CreditCard" size={16} className="text-primary" />
                                                                </div>
                                                                <span className="font-medium text-foreground">
                                                                    {fee.feeTypeId?.name || fee.feeType || 'Fee'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-foreground font-medium">
                                                            {formatCurrency(fee.totalAmount || 0, currency)}
                                                        </td>
                                                        <td className="py-4 px-4 text-success font-medium">
                                                            {formatCurrency(fee.paidAmount || 0, currency)}
                                                        </td>
                                                        <td className="py-4 px-4 text-warning font-medium">
                                                            {formatCurrency((fee.totalAmount || 0) - (fee.paidAmount || 0), currency)}
                                                        </td>
                                                        <td className="py-4 px-4 text-muted-foreground">
                                                            {formatDate(fee.dueDate)}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            {getStatusBadge(fee)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Icon name="Info" size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-2">Payment Information</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            For payment inquiries or to make a payment, please contact the school's finance office.
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Payment methods accepted: Cash, Bank Transfer, Mobile Money
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyFees;
