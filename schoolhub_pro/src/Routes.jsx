import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AdminDashboard from './pages/admin-dashboard';
import Login from './pages/login';
import CourseMaterials from './pages/course-materials';
import ClassesManagement from './pages/classes-management';
import SectionsManagement from './pages/sections-management';
import FinanceOverview from './pages/finance-overview';
import ParentDashboard from './pages/parent-dashboard';
import FinanceDashboard from './pages/finance-dashboard';
import MyResults from './pages/my-results';
import StudentDashboard from './pages/student-dashboard';
import StudentsManagement from './pages/students-management';
import AttendanceManagement from './pages/attendance-management';
import TeacherDashboard from './pages/teacher-dashboard';
import TimetablesManagement from './pages/timetables-management';
import FeesManagement from './pages/fees-management';
import SchoolSettings from './pages/school-settings';
import TeachersManagement from './pages/teachers-management';
import ParentsManagement from './pages/parents-management';
import Exams from './pages/exams';
import Subjects from './pages/subjects';
import FeeTypesManagement from './pages/fee-types-management';
import StudentFeesManagement from './pages/student-fees-management';
import ReportsManagement from './pages/reports-management';
import ReportCards from './pages/report-cards';
import AdminsManagement from './pages/admins-management';
import GradeSystem from './pages/grade-system';
import Notices from './pages/notices';
import AcademicYears from './pages/academic-years';
import Semesters from './pages/semesters';
import Register from './pages/register';
import MyFees from './pages/my-fees';
import MyAttendance from './pages/my-attendance';
import MyClasses from './pages/my-classes';
import MyStudents from './pages/my-students';
import MyTimetable from './pages/my-timetable';
import GradesManagement from './pages/grades-management';
import ChildFees from './pages/child-fees';
import ChildAttendance from './pages/child-attendance';
import ChildResults from './pages/child-results';
import ChildTimetable from './pages/child-timetable';


const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/course-materials" element={<CourseMaterials />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/classes-management" element={<ClassesManagement />} />
          <Route path="/sections-management" element={<SectionsManagement />} />
          <Route path="/finance-overview" element={<FinanceOverview />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/finance-dashboard" element={<FinanceDashboard />} />
          <Route path="/my-results" element={<MyResults />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/students-management" element={<StudentsManagement />} />
          <Route path="/teachers-management" element={<TeachersManagement />} />
          <Route path="/parents-management" element={<ParentsManagement />} />
          <Route path="/attendance-management" element={<AttendanceManagement />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/timetables-management" element={<TimetablesManagement />} />
          <Route path="/fees-management" element={<FeesManagement />} />
          <Route path="/fee-types-management" element={<FeeTypesManagement />} />
          <Route path="/student-fees-management" element={<StudentFeesManagement />} />
          <Route path="/reports-management" element={<ReportsManagement />} />
          <Route path="/report-cards" element={<ReportCards />} />
          <Route path="/school-settings" element={<SchoolSettings />} />
          <Route path="/admins-management" element={<AdminsManagement />} />
          <Route path="/grade-system" element={<GradeSystem />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/academic-years" element={<AcademicYears />} />
          <Route path="/semesters" element={<Semesters />} />
          <Route path="/my-fees" element={<MyFees />} />
          <Route path="/my-attendance" element={<MyAttendance />} />
          <Route path="/my-classes" element={<MyClasses />} />
          <Route path="/my-students" element={<MyStudents />} />
          <Route path="/my-timetable" element={<MyTimetable />} />
          <Route path="/grades-management" element={<GradesManagement />} />
          <Route path="/child-fees" element={<ChildFees />} />
          <Route path="/child-attendance" element={<ChildAttendance />} />
          <Route path="/child-results" element={<ChildResults />} />
          <Route path="/child-timetable" element={<ChildTimetable />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;