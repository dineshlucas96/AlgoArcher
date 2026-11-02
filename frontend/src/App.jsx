import React, { useState, useEffect } from 'react';
import authService from './auth/services/authService.js';
import { navigate, useRoute } from './app/router.jsx';

// Auth Pages
import Login from './auth/pages/Login.jsx';
import ChangePassword from './auth/pages/ChangePassword.jsx';

// Admin Pages
import AdminDashboard from './admin/pages/Dashboard.jsx';
import BulkImport from './admin/pages/BulkImport.jsx';
import Analytics from './admin/pages/Analytics.jsx';
import AdminSettings from './admin/pages/Settings.jsx';
import AdminStudents from './admin/pages/Students.jsx';
import AdminFaculty from './admin/pages/Faculty.jsx';
import AdminCourses from './admin/pages/Courses.jsx';

// Faculty Pages
import FacultyDashboard from './faculty/pages/Dashboard.jsx';
import FacultyMyCourses from './faculty/pages/MyCourses.jsx';
import FacultyCourseDetails from './faculty/pages/CourseDetails.jsx';
import FacultyProfile from './faculty/pages/Profile.jsx';
import { FacultyStudents, FacultySubmissions } from './faculty/pages/Students.jsx';
import FacultyProblems from './faculty/pages/Problems.jsx';
import FacultyReports from './faculty/pages/Reports.jsx';

// Student Pages
import StudentDashboard from './student/pages/Dashboard.jsx';
import StudentMyCourses from './student/pages/MyCourses.jsx';
import StudentPractice from './student/pages/Practice.jsx';
import CourseDetails from './student/pages/CourseDetails.jsx';
import CodingWorkspace from './student/pages/CodingWorkspace.jsx';
import Leaderboard from './student/pages/Leaderboard.jsx';
import Achievements from './student/pages/Achievements.jsx';
import StudentProfile from './student/pages/Profile.jsx';
import StudentSubmissions from './student/pages/Submissions.jsx';

export default function App() {
  const { path } = useRoute();
  const [currentUser, setCurrentUser] = useState(() => authService.getUser());

  const token = authService.getToken();
  const role  = authService.getRole();

  // If user role doesn't match restricted routes, safely redirect in effect
  useEffect(() => {
    if (!token || !currentUser) return;

    if (currentUser.must_change_pw && path !== '/change-password') {
      navigate('/change-password');
      return;
    }

    if (path === '/' || path === '/login') {
      navigate(authService.homePathForRole(role));
      return;
    }

    if (path.startsWith('/admin') && role !== 'admin') {
      navigate(authService.homePathForRole(role));
      return;
    }

    if (path.startsWith('/faculty') && role !== 'faculty') {
      navigate(authService.homePathForRole(role));
      return;
    }
  }, [path, token, currentUser, role]);

  // If not authenticated, always show Login (or handle login callback)
  if (!token || !currentUser) {
    return <Login onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  // If user must change password
  if (currentUser.must_change_pw) {
    return <ChangePassword />;
  }

  if (path === '/change-password') {
    return <ChangePassword />;
  }

  // --- ROUTE MATCHING ---
  // Root or login path -> render role home component
  if (path === '/' || path === '/login') {
    if (role === 'admin') return <AdminDashboard path={path} />;
    if (role === 'faculty') return <FacultyDashboard path={path} />;
    return <StudentDashboard path={path} />;
  }

  // 1. CODING WORKSPACE: /courses/:cid/problems/:pid
  const problemMatch = path.match(/^\/courses\/(\d+)\/problems\/(\d+)$/);
  if (problemMatch) {
    return (
      <CodingWorkspace
        path={path}
        courseId={problemMatch[1]}
        problemId={problemMatch[2]}
      />
    );
  }

  // 2. LEADERBOARD: /courses/:cid/leaderboard
  const leaderboardMatch = path.match(/^\/courses\/(\d+)\/leaderboard$/);
  if (leaderboardMatch) {
    return (
      <Leaderboard
        path={path}
        courseId={leaderboardMatch[1]}
      />
    );
  }

  // 3. COURSE PROBLEMS (Student): /courses/:cid
  const courseMatch = path.match(/^\/courses\/(\d+)$/);
  if (courseMatch) {
    return (
      <CourseDetails
        path={path}
        courseId={courseMatch[1]}
      />
    );
  }

  // 4. FACULTY COURSE DETAILS: /faculty/courses/:cid
  const facultyCourseMatch = path.match(/^\/faculty\/courses\/(\d+)$/);
  if (facultyCourseMatch) {
    if (role !== 'faculty') {
      return <StudentDashboard path={path} />;
    }
    return (
      <FacultyCourseDetails
        path={path}
        courseId={facultyCourseMatch[1]}
      />
    );
  }

  // 5. ADMIN PORTAL ROUTES (Role guard: only admin)
  if (path.startsWith('/admin')) {
    if (role !== 'admin') {
      if (role === 'faculty') return <FacultyDashboard path={path} />;
      return <StudentDashboard path={path} />;
    }
    if (path === '/admin' || path === '/admin/dashboard') {
      return <AdminDashboard path={path} />;
    }
    if (path === '/admin/import' || path === '/admin/upload/students' || path === '/admin/upload/faculty') {
      return <BulkImport path={path} />;
    }
    if (path === '/admin/students') {
      return <AdminStudents path={path} />;
    }
    if (path === '/admin/faculty') {
      return <AdminFaculty path={path} />;
    }
    if (path === '/admin/courses') {
      return <AdminCourses path={path} />;
    }
    if (path === '/admin/analytics') {
      return <Analytics path={path} />;
    }
    if (path === '/admin/settings') {
      return <AdminSettings path={path} />;
    }
    return <AdminDashboard path={path} />;
  }

  // 6. FACULTY PORTAL ROUTES (Role guard: only faculty)
  if (path.startsWith('/faculty')) {
    if (role !== 'faculty') {
      if (role === 'admin') return <AdminDashboard path={path} />;
      return <StudentDashboard path={path} />;
    }
    if (path === '/faculty' || path === '/faculty/dashboard') {
      return <FacultyDashboard path={path} />;
    }
    if (path === '/faculty/courses') {
      return <FacultyMyCourses path={path} />;
    }
    if (path === '/faculty/students') {
      return <FacultyStudents path={path} />;
    }
    if (path === '/faculty/problems') {
      return <FacultyProblems path={path} />;
    }
    if (path === '/faculty/reports') {
      return <FacultyReports path={path} />;
    }
    if (path === '/faculty/submissions') {
      return <FacultySubmissions path={path} />;
    }
    if (path === '/faculty/profile') {
      return <FacultyProfile path={path} />;
    }
    return <FacultyDashboard path={path} />;
  }

  // 7. STUDENT PORTAL ROUTES
  if (path === '/student' || path === '/student/dashboard') {
    return <StudentDashboard path={path} />;
  }
  if (path === '/student/courses') {
    return <StudentMyCourses path={path} />;
  }
  if (path === '/student/practice') {
    return <StudentPractice path={path} />;
  }
  if (path === '/student/achievements') {
    return <Achievements path={path} />;
  }
  if (path === '/student/submissions') {
    return <StudentSubmissions path={path} />;
  }
  if (path === '/student/profile') {
    return <StudentProfile path={path} />;
  }

  // Fallback to role home
  if (role === 'admin') return <AdminDashboard path={path} />;
  if (role === 'faculty') return <FacultyDashboard path={path} />;
  return <StudentDashboard path={path} />;
}
