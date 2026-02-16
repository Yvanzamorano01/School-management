import React from 'react';
import Icon from '../../../components/AppIcon';
import './report-cards.css';

const ReportCardPreview = ({ data, schoolSettings }) => {
    if (!data) return null;

    const { student, semester, subjects, summary, attendance } = data;

    const getGradeColor = (grade) => {
        if (!grade) return '';
        if (grade.startsWith('A')) return 'grade-excellent';
        if (grade.startsWith('B')) return 'grade-good';
        if (grade.startsWith('C')) return 'grade-average';
        if (grade.startsWith('D')) return 'grade-below';
        return 'grade-fail';
    };

    return (
        <div className="report-card-preview" id="report-card-print">
            {/* Header */}
            <div className="rc-header">
                <div className="rc-school-info">
                    <h1 className="rc-school-name">
                        {schoolSettings?.schoolName || 'SchoolHub Pro'}
                    </h1>
                    <p className="rc-school-subtitle">Bulletin de Notes / Student Report Card</p>
                    <div className="rc-semester-info">
                        <span className="rc-badge">{semester?.academicYear}</span>
                        <span className="rc-badge rc-badge-accent">{semester?.name}</span>
                    </div>
                </div>
            </div>

            {/* Student Info */}
            <div className="rc-student-info">
                <div className="rc-info-grid">
                    <div className="rc-info-item">
                        <span className="rc-info-label">Nom / Name</span>
                        <span className="rc-info-value">{student?.name}</span>
                    </div>
                    <div className="rc-info-item">
                        <span className="rc-info-label">Matricule / ID</span>
                        <span className="rc-info-value">{student?.studentId}</span>
                    </div>
                    <div className="rc-info-item">
                        <span className="rc-info-label">Classe / Class</span>
                        <span className="rc-info-value">{student?.class}</span>
                    </div>
                    <div className="rc-info-item">
                        <span className="rc-info-label">Section</span>
                        <span className="rc-info-value">{student?.section}</span>
                    </div>
                    <div className="rc-info-item">
                        <span className="rc-info-label">Sexe / Gender</span>
                        <span className="rc-info-value">{student?.gender || 'N/A'}</span>
                    </div>
                    <div className="rc-info-item">
                        <span className="rc-info-label">Date Naiss. / DOB</span>
                        <span className="rc-info-value">
                            {student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Grades Table */}
            <div className="rc-grades-section">
                <h3 className="rc-section-title">
                    <Icon name="BookOpen" size={18} className="no-print" />
                    Relevé de Notes / Academic Results
                </h3>
                {subjects?.length > 0 ? (
                    <table className="rc-grades-table">
                        <thead>
                            <tr>
                                <th className="rc-th-subject">Matière / Subject</th>
                                <th className="rc-th-center">Note / Marks</th>
                                <th className="rc-th-center">Total</th>
                                <th className="rc-th-center">% </th>
                                <th className="rc-th-center">Grade</th>
                                <th className="rc-th-center">GPA</th>
                                <th>Appréciation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((s, idx) => (
                                <tr key={idx}>
                                    <td className="rc-td-subject">
                                        <strong>{s.subject}</strong>
                                        <span className="rc-subject-code">{s.code}</span>
                                    </td>
                                    <td className="rc-td-center">{s.totalMarks}</td>
                                    <td className="rc-td-center">{s.totalMaxMarks}</td>
                                    <td className="rc-td-center">{s.percentage}%</td>
                                    <td className={`rc-td-center rc-td-grade ${getGradeColor(s.grade)}`}>
                                        <strong>{s.grade}</strong>
                                    </td>
                                    <td className="rc-td-center">{s.gpa != null ? s.gpa : '-'}</td>
                                    <td className="rc-td-appreciation">{s.appreciation}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="rc-summary-row">
                                <td><strong>TOTAL / MOYENNE</strong></td>
                                <td className="rc-td-center"><strong>{summary?.totalMarks}</strong></td>
                                <td className="rc-td-center"><strong>{summary?.totalMaxMarks}</strong></td>
                                <td className="rc-td-center"><strong>{summary?.percentage}%</strong></td>
                                <td className={`rc-td-center rc-td-grade ${getGradeColor(summary?.grade)}`}>
                                    <strong>{summary?.grade}</strong>
                                </td>
                                <td className="rc-td-center"><strong>{summary?.gpa != null ? summary.gpa : '-'}</strong></td>
                                <td>
                                    {summary?.passed
                                        ? <span className="rc-pass-badge">Admis ✓</span>
                                        : <span className="rc-fail-badge">Ajourné ✗</span>
                                    }
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                ) : (
                    <div className="rc-empty">
                        <Icon name="FileX" size={32} className="no-print" />
                        <p>Aucun résultat disponible pour ce semestre.</p>
                        <p className="rc-empty-sub">No results available for this semester.</p>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="rc-stats-row">
                {/* Rank & GPA */}
                <div className="rc-stat-card">
                    <h4 className="rc-stat-title">Classement / Rank</h4>
                    <div className="rc-stat-value rc-rank">
                        {summary?.rank || '-'}<span className="rc-rank-total">/{summary?.totalStudents || '-'}</span>
                    </div>
                </div>
                <div className="rc-stat-card">
                    <h4 className="rc-stat-title">Moyenne / GPA</h4>
                    <div className="rc-stat-value">{summary?.gpa != null ? summary.gpa : '-'}<span className="rc-gpa-max">/4.0</span></div>
                </div>

                {/* Attendance */}
                <div className="rc-stat-card rc-stat-attendance">
                    <h4 className="rc-stat-title">Assiduité / Attendance</h4>
                    <div className="rc-attendance-grid">
                        <div className="rc-att-item rc-att-present">
                            <span className="rc-att-count">{attendance?.present || 0}</span>
                            <span className="rc-att-label">Présent</span>
                        </div>
                        <div className="rc-att-item rc-att-absent">
                            <span className="rc-att-count">{attendance?.absent || 0}</span>
                            <span className="rc-att-label">Absent</span>
                        </div>
                        <div className="rc-att-item rc-att-late">
                            <span className="rc-att-count">{attendance?.late || 0}</span>
                            <span className="rc-att-label">Retard</span>
                        </div>
                        <div className="rc-att-item">
                            <span className="rc-att-count">{attendance?.rate || 0}%</span>
                            <span className="rc-att-label">Taux</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Signatures */}
            <div className="rc-signatures">
                <div className="rc-signature-block">
                    <p className="rc-sig-label">Le Professeur Principal</p>
                    <p className="rc-sig-sub">Class Teacher</p>
                    <div className="rc-sig-line"></div>
                </div>
                <div className="rc-signature-block">
                    <p className="rc-sig-label">Le Directeur</p>
                    <p className="rc-sig-sub">Principal</p>
                    <div className="rc-sig-line"></div>
                </div>
                <div className="rc-signature-block">
                    <p className="rc-sig-label">Le Parent / Tuteur</p>
                    <p className="rc-sig-sub">Parent / Guardian</p>
                    <div className="rc-sig-line"></div>
                </div>
            </div>

            {/* Footer */}
            <div className="rc-footer">
                <p>Document généré le {new Date().toLocaleDateString('fr-FR')} — SchoolHub Pro</p>
            </div>
        </div>
    );
};

export default ReportCardPreview;
