import React, { useState, useEffect } from 'react';
import FacultyLayout from '../layouts/FacultyLayout.jsx';
import facultyService from '../services/facultyService.js';
import { navigate } from '../../app/router.jsx';

export default function FacultyDashboard({ path }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    facultyService.getCourses()
      .then(setCourses)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const user = (() => { try { return JSON.parse(localStorage.getItem('aa_user') || '{}'); } catch { return {}; } })();

  return (
    <FacultyLayout
      currentPath={path}
      title="Dashboard"
      subtitle={`Welcome back, ${user.name || 'Faculty'}`}
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            My Courses
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)' }}>
            {loading ? '—' : courses.length}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Status
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>Active</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Semester in progress</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Role
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <span className="badge badge-gold" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>Faculty</span>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: 'var(--navy)', margin: 0 }}>My Courses</h2>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/faculty/courses')}>
            View All
          </button>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>Loading courses…</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses assigned</h3>
            <p>Ask your administrator to assign courses to you.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {courses.slice(0, 6).map((c, i) => (
              <div
                key={c.id}
                className="faculty-course-card"
                onClick={() => navigate(`/faculty/courses/${c.id}`)}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  {c.code}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: 16, lineHeight: 1.3 }}>
                  {c.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-navy">View Dashboard →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}

