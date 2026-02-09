import React, { useState, useMemo, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/AppIcon';
import gradeScaleService from '../../services/gradeScaleService';

const GradeSystem = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    grade: '',
    minScore: '',
    maxScore: '',
    gpaPoints: '',
    description: ''
  });

  const [gradesData, setGradesData] = useState([]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gradeScaleService.getAll();
      const formatted = data.map(g => ({
        id: g._id || g.id,
        grade: g.grade,
        minScore: g.minScore,
        maxScore: g.maxScore,
        gpaPoints: g.gpaPoints,
        description: g.description,
        color: getGradeColorClass(g.gpaPoints)
      }));
      setGradesData(formatted.sort((a, b) => b.minScore - a.minScore));
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to load grade system');
      setGradesData([]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColorClass = (gpa) => {
    if (gpa >= 3.7) return 'text-success';
    if (gpa >= 2.7) return 'text-primary';
    if (gpa >= 1.7) return 'text-accent';
    if (gpa >= 1.0) return 'text-warning';
    return 'text-error';
  };


  const stats = useMemo(() => {
    const totalGrades = gradesData?.length;
    const passingGrades = gradesData?.filter((g) => g?.gpaPoints >= 1.0)?.length;
    const highestGPA = gradesData?.length ? Math.max(...gradesData?.map((g) => g?.gpaPoints)) : 0;
    const lowestPassingScore = gradesData?.filter((g) => g?.gpaPoints >= 1.0)?.length
      ? Math.min(...gradesData?.filter((g) => g?.gpaPoints >= 1.0)?.map((g) => g?.minScore))
      : 0;
    return { totalGrades, passingGrades, highestGPA, lowestPassingScore };
  }, [gradesData]);

  const handleEdit = (grade) => {
    setSelectedGrade(grade);
    setFormData({
      grade: grade?.grade || '',
      minScore: grade?.minScore?.toString() || '',
      maxScore: grade?.maxScore?.toString() || '',
      gpaPoints: grade?.gpaPoints?.toString() || '',
      description: grade?.description || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (grade) => {
    setSelectedGrade(grade);
    setShowDeleteModal(true);
  };

  const handleSaveGrade = async () => {
    try {
      const gradeData = {
        grade: formData.grade,
        minScore: parseInt(formData.minScore),
        maxScore: parseInt(formData.maxScore),
        gpaPoints: parseFloat(formData.gpaPoints),
        description: formData.description
      };
      if (selectedGrade) {
        await gradeScaleService.update(selectedGrade.id, gradeData);
      } else {
        await gradeScaleService.create(gradeData);
      }
      setShowAddModal(false);
      setSelectedGrade(null);
      setFormData({ grade: '', minScore: '', maxScore: '', gpaPoints: '', description: '' });
      fetchGrades();
    } catch (err) {
      console.error('Error saving grade:', err);
      alert('Failed to save grade');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await gradeScaleService.delete(selectedGrade.id);
      setShowDeleteModal(false);
      setSelectedGrade(null);
      fetchGrades();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete grade');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Grade System', path: '/grade-system' }
  ];

  const getGradeColor = (gpa) => {
    if (gpa >= 3.7) return 'bg-success/10 text-success border-success/20';
    if (gpa >= 2.7) return 'bg-primary/10 text-primary border-primary/20';
    if (gpa >= 1.7) return 'bg-accent/10 text-accent-foreground border-accent/20';
    if (gpa >= 1.0) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-error/10 text-error border-error/20';
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border">
          <div className="h-12 w-12 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <AuthHeader onLogout={() => {}} />
      <main className="main-content">
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Grade System</h1>
              <p className="text-sm md:text-base text-muted-foreground">Define grading scales and GPA calculations</p>
            </div>
            <Button onClick={() => { setSelectedGrade(null); setFormData({ grade: '', minScore: '', maxScore: '', gpaPoints: '', description: '' }); setShowAddModal(true); }} iconName="Plus" iconPosition="left" size="lg">
              Add Grade
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchGrades}>Retry</Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="Award" size={24} className="text-primary mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.totalGrades}</div>
              <div className="text-sm text-muted-foreground">Total Grades</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="CheckCircle" size={24} className="text-success mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.passingGrades}</div>
              <div className="text-sm text-muted-foreground">Passing Grades</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="TrendingUp" size={24} className="text-accent mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.highestGPA?.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Highest GPA</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="Target" size={24} className="text-secondary mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.lowestPassingScore}%</div>
              <div className="text-sm text-muted-foreground">Min Passing Score</div>
            </div>
          </div>

          {/* Grade Scale Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Grading Scale</h2>
            </div>
            {loading ? <LoadingSkeleton /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Score Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">GPA Points</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {gradesData?.map((grade) => (
                      <tr key={grade?.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border text-lg font-bold ${getGradeColor(grade?.gpaPoints)}`}>{grade?.grade}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-foreground">{grade?.minScore}% - {grade?.maxScore}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-lg font-semibold text-foreground">{grade?.gpaPoints?.toFixed(1)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-muted-foreground">{grade?.description}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(grade)}><Icon name="Pencil" size={16} /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(grade)}><Icon name="Trash2" size={16} className="text-error" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setSelectedGrade(null); }} title={selectedGrade ? 'Edit Grade' : 'Add Grade'}>
        <div className="space-y-4">
          <Input label="Grade Letter" value={formData?.grade} onChange={(e) => setFormData({ ...formData, grade: e?.target?.value })} placeholder="e.g., A+, B-, C" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Score (%)" type="number" min="0" max="100" value={formData?.minScore} onChange={(e) => setFormData({ ...formData, minScore: e?.target?.value })} />
            <Input label="Max Score (%)" type="number" min="0" max="100" value={formData?.maxScore} onChange={(e) => setFormData({ ...formData, maxScore: e?.target?.value })} />
          </div>
          <Input label="GPA Points" type="number" step="0.1" min="0" max="4" value={formData?.gpaPoints} onChange={(e) => setFormData({ ...formData, gpaPoints: e?.target?.value })} />
          <Input label="Description" value={formData?.description} onChange={(e) => setFormData({ ...formData, description: e?.target?.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSaveGrade}>{selectedGrade ? 'Update' : 'Add'} Grade</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedGrade(null); }} title="Delete Grade">
        <div className="space-y-4">
          <p className="text-muted-foreground">Are you sure you want to delete grade <span className="font-bold text-foreground">{selectedGrade?.grade}</span>?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GradeSystem;
