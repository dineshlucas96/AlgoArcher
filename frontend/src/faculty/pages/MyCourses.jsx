import React, { useState, useEffect } from 'react';
import FacultyLayout from '../layouts/FacultyLayout.jsx';
import facultyService from '../services/facultyService.js';
import { navigate } from '../../app/router.jsx';

export default function MyCourses({ path }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    facultyService.getCourses()
      .then(setCourses)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <FacultyLayout
      currentPath={path}
      title="My Courses"
      subtitle="Courses assigned to you this semester."
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading courses…</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No courses assigned</h3>
          <p>Ask your administrator to assign courses to you via bulk import.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {courses.map(c => (
            <div
              key={c.id}
              className="faculty-course-card"
              onClick={() => navigate(`/faculty/courses/${c.id}`)}
            >
              <div className="faculty-course-card-header">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    {c.code}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--navy)', lineHeight: 1.3 }}>
                    {c.name}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
                <span className="badge badge-navy" style={{ fontSize: '0.8125rem' }}>
                  View Student Dashboard →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </FacultyLayout>
  );
}

