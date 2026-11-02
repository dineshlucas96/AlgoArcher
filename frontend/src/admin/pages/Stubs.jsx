import React from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';

function ComingSoon({ title, icon, description, note }) {
  return (
    <div className="empty-state" style={{ minHeight: 400 }}>
      <div className="empty-state-icon" style={{ fontSize: '2rem' }}>{icon}</div>
      <h3>{title}</h3>
      <p style={{ maxWidth: 400 }}>{description}</p>
      {note && (
        <div className="alert alert-info" style={{ marginTop: 20, maxWidth: 420, textAlign: 'left' }}>
          <strong>Note:</strong> {note}
        </div>
      )}
    </div>
  );
}

export function AdminStudents({ path }) {
  return (
    <AdminLayout currentPath={path} title="Students" subtitle="View and manage student accounts.">
      <ComingSoon
        icon="🎓"
        title="Student Management"
        description="Use the Bulk Import section to import students, or view the Dashboard for student performance data."
        note="Individual student CRUD endpoints are not yet available. Use the Admin Dashboard for filtered student progress."
      />
    </AdminLayout>
  );
}

export function AdminFaculty({ path }) {
  return (
    <AdminLayout currentPath={path} title="Faculty" subtitle="View and manage faculty accounts.">
      <ComingSoon
        icon="👨‍🏫"
        title="Faculty Management"
        description="Use the Bulk Import section to import faculty members with their course and department mappings."
        note="Faculty listing endpoints are not yet available. Import faculty using the Bulk Import tool."
      />
    </AdminLayout>
  );
}

export function AdminCourses({ path }) {
  return (
    <AdminLayout currentPath={path} title="Courses" subtitle="View and manage courses.">
      <ComingSoon
        icon="📚"
        title="Course Management"
        description="Courses are automatically created when students or faculty are imported via Excel. Direct course management endpoints are not yet available."
        note="Courses inherit from the bulk import process. Course CRUD API is pending."
      />
    </AdminLayout>
  );
}

