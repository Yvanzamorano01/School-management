import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ReportCardPreview from './components/ReportCardPreview';
import reportCardService from '../../services/reportCardService';
import classService from '../../services/classService';
import studentService from '../../services/studentService';
import semesterService from '../../services/semesterService';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReportCards = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const schoolSettings = useSchoolSettings();

    // Filters
    const [classOptions, setClassOptions] = useState([]);
    const [studentOptions, setStudentOptions] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    // Data
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Role
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = storedUser.role === 'super_admin' ? 'admin' : (storedUser.role || 'admin');
    const SidebarComponent = userRole === 'admin' ? AdminSidebar : TeacherSidebar;
    const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : '/teacher-dashboard';

    const breadcrumbItems = [
        { label: 'Dashboard', path: dashboardPath },
        { label: 'Report Cards', path: '/report-cards' }
    ];

    // Fetch classes & semesters on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [classesRes, semestersRes] = await Promise.all([
                    classService.getAll(),
                    semesterService.getAll()
                ]);
                const classesArr = classesRes?.data || classesRes?.docs || (Array.isArray(classesRes) ? classesRes : []);
                const semestersArr = semestersRes?.data || semestersRes?.docs || (Array.isArray(semestersRes) ? semestersRes : []);

                setClassOptions(classesArr.map(c => ({
                    value: c._id || c.id, label: c.name
                })));
                setSemesterOptions(semestersArr.map(s => ({
                    value: s._id || s.id, label: `${s.name} (${s.status})`
                })));
            } catch (err) {
                console.error('Error loading filters:', err);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch students when class changes
    useEffect(() => {
        if (!selectedClass) {
            setStudentOptions([]);
            setSelectedStudent('');
            return;
        }
        const fetchStudents = async () => {
            try {
                const studentsRes = await studentService.getAll({ classId: selectedClass });
                const studentsArr = studentsRes?.docs || studentsRes?.data || (Array.isArray(studentsRes) ? studentsRes : []);
                setStudentOptions(studentsArr.map(s => ({
                    value: s._id || s.id, label: `${s.name} (${s.studentId})`
                })));
            } catch (err) {
                console.error('Error loading students:', err);
                setStudentOptions([]);
            }
        };
        fetchStudents();
    }, [selectedClass]);

    const handleGenerate = async () => {
        if (!selectedStudent || !selectedSemester) return;

        try {
            setLoading(true);
            setError(null);
            const data = await reportCardService.getStudentReportCard(selectedStudent, selectedSemester);
            setReportData(data);
        } catch (err) {
            console.error('Error generating report card:', err);
            setError(err.response?.data?.message || 'Failed to generate report card.');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const [exporting, setExporting] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('report-card-print');
        if (!element) return;

        try {
            setExporting(true);

            // Temporarily force white background and visible styles for capture
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - margin * 2;

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = contentWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;

            if (scaledHeight <= pdfHeight - margin * 2) {
                // Fits on one page
                pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, scaledHeight);
            } else {
                // Multi-page: slice the canvas
                const pageContentHeight = pdfHeight - margin * 2;
                const sourcePageHeight = pageContentHeight / ratio;
                let position = 0;
                let page = 0;

                while (position < imgHeight) {
                    if (page > 0) pdf.addPage();

                    const sliceHeight = Math.min(sourcePageHeight, imgHeight - position);
                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = imgWidth;
                    sliceCanvas.height = sliceHeight;
                    const ctx = sliceCanvas.getContext('2d');
                    ctx.drawImage(canvas, 0, position, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);

                    const sliceData = sliceCanvas.toDataURL('image/png');
                    const sliceScaledHeight = sliceHeight * ratio;
                    pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceScaledHeight);

                    position += sourcePageHeight;
                    page++;
                }
            }

            const studentName = reportData?.student?.name || 'student';
            const semesterName = reportData?.semester?.name || 'semester';
            pdf.save(`bulletin-${studentName.replace(/\s+/g, '_')}-${semesterName.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            alert('Failed to export PDF. Please try printing instead.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SidebarComponent
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <AuthHeader userName="Admin User" userRole="Administrator" />

            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="main-content-inner">
                    <Breadcrumb items={breadcrumbItems} />

                    {/* Page Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 no-print">
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                                Bulletins de Notes
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground">
                                Generate and print student report cards
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-card rounded-xl border border-border p-4 md:p-6 mb-6 no-print">
                        <div className="flex items-center gap-2 mb-4">
                            <Icon name="Filter" size={18} className="text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Sélection / Selection</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <Select
                                label="Classe / Class"
                                options={[{ value: '', label: 'Sélectionner une classe...' }, ...classOptions]}
                                value={selectedClass}
                                onChange={(val) => {
                                    setSelectedClass(val);
                                    setSelectedStudent('');
                                    setReportData(null);
                                }}
                            />
                            <Select
                                label="Élève / Student"
                                options={[{ value: '', label: selectedClass ? 'Sélectionner un élève...' : 'Choisir une classe d\'abord' }, ...studentOptions]}
                                value={selectedStudent}
                                onChange={(val) => {
                                    setSelectedStudent(val);
                                    setReportData(null);
                                }}
                                disabled={!selectedClass}
                            />
                            <Select
                                label="Semestre / Semester"
                                options={[{ value: '', label: 'Sélectionner un semestre...' }, ...semesterOptions]}
                                value={selectedSemester}
                                onChange={(val) => {
                                    setSelectedSemester(val);
                                    setReportData(null);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleGenerate}
                                disabled={!selectedStudent || !selectedSemester || loading}
                                iconName={loading ? 'Loader2' : 'FileText'}
                                iconPosition="left"
                            >
                                {loading ? 'Génération...' : 'Générer le Bulletin'}
                            </Button>
                            {reportData && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleExportPDF}
                                        disabled={exporting}
                                        iconName={exporting ? 'Loader2' : 'Download'}
                                        iconPosition="left"
                                    >
                                        {exporting ? 'Export en cours...' : 'Exporter PDF'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handlePrint}
                                        iconName="Printer"
                                        iconPosition="left"
                                    >
                                        Imprimer / Print
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 no-print">
                            <Icon name="AlertCircle" size={20} className="text-error" />
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!reportData && !loading && !error && (
                        <div className="bg-card rounded-xl border border-border p-12 text-center no-print">
                            <Icon name="FileText" size={56} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun bulletin généré</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Sélectionnez une classe, un élève et un semestre, puis cliquez sur "Générer le Bulletin" pour prévisualiser et imprimer le bulletin de notes.
                            </p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="bg-card rounded-xl border border-border p-12 text-center no-print">
                            <Icon name="Loader2" size={40} className="mx-auto text-primary animate-spin mb-4" />
                            <p className="text-sm text-muted-foreground">Génération du bulletin en cours...</p>
                        </div>
                    )}

                    {/* Report Card Preview */}
                    {reportData && !loading && (
                        <ReportCardPreview data={reportData} schoolSettings={schoolSettings} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReportCards;
