import React, { useState, useEffect } from 'react';
import ParentSidebar from '../../components/navigation/ParentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Icon from '../../components/AppIcon';
import api from '../../services/api';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';
import { formatCurrency } from '../../utils/format';

const ChildFees = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { currency } = useSchoolSettings();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [fees, setFees] = useState([]);

    const userName = localStorage.getItem('userName') || 'Parent';
    const userRole = 'Parent';

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/parent-dashboard' },
        { label: 'Child Fees', path: '/child-fees' }
    ];

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchFees();
        }
    }, [selectedChild, currency]);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const parentId = user.profileId;

            if (!parentId) {
                setError('No parent profile found.');
                return;
            }

            const response = await api.get('/students', { params: { parentId, limit: 50 } });
            const childrenData = response.data || [];
            setChildren(childrenData);

            if (childrenData.length > 0) {
                setSelectedChild(childrenData[0]._id);
            }
        } catch (err) {
            console.error('Error fetching children:', err);
            setError(err.message || 'Failed to load children');
        } finally {
            setLoading(false);
        }
    };

    const fetchFees = async () => {
        try {
            const response = await api.get('/student-fees', { params: { studentId: selectedChild } });
            setFees(response.data || []);
        } catch (err) {
            console.error('Error fetching fees:', err);
            setFees([]);
        }
    };

    const selectedChildData = children.find(c => c._id === selectedChild);
    const totalAmount = fees.reduce((sum, f) => sum + (f.totalAmount || f.amount || 0), 0);
    const paidAmount = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const pendingAmount = totalAmount - paidAmount;

    return (
        <div className="min-h-screen bg-background">
            <ParentSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <AuthHeader userName={userName} userRole={userRole} />

            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="main-content-inner">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Child Fees</h1>
                            <p className="text-sm md:text-base text-muted-foreground">View your children's school fees</p>
                        </div>
                        {children.length > 0 && (
                            <select
                                value={selectedChild}
                                onChange={(e) => setSelectedChild(e.target.value)}
                                className="px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                            >
                                {children.map(child => (
                                    <option key={child._id} value={child._id}>
                                        {child.firstName} {child.lastName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
                            </div>
                        </div>
                    ) : children.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No children found</h3>
                            <p className="text-sm text-muted-foreground">No children are linked to your account.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Icon name="Receipt" size={20} className="text-primary" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Total Fees</span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totalAmount, currency)}</p>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                            <Icon name="CheckCircle" size={20} className="text-success" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Paid</span>
                                    </div>
                                    <p className="text-2xl font-bold text-success">{formatCurrency(paidAmount, currency)}</p>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                            <Icon name="Clock" size={20} className="text-warning" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Pending</span>
                                    </div>
                                    <p className="text-2xl font-bold text-warning">{formatCurrency(pendingAmount, currency)}</p>
                                </div>
                            </div>

                            {/* Fees Table */}
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-border">
                                    <h3 className="font-semibold text-foreground">
                                        Fees for {selectedChildData?.firstName} {selectedChildData?.lastName}
                                    </h3>
                                </div>
                                {fees.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No fees found for this child
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-muted/50">
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Fee Type</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Paid</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fees.map((fee, idx) => (
                                                    <tr key={idx} className="border-b border-border">
                                                        <td className="py-4 px-4 font-medium text-foreground">{fee.feeTypeId?.name || 'Fee'}</td>
                                                        <td className="py-4 px-4 text-muted-foreground">{formatCurrency(fee.totalAmount || fee.amount || 0, currency)}</td>
                                                        <td className="py-4 px-4 text-muted-foreground">{formatCurrency(fee.paidAmount || 0, currency)}</td>
                                                        <td className="py-4 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${fee.status === 'paid' ? 'bg-success/10 text-success' :
                                                                fee.status === 'partial' ? 'bg-warning/10 text-warning' :
                                                                    'bg-error/10 text-error'
                                                                }`}>
                                                                {fee.status || 'pending'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChildFees;
