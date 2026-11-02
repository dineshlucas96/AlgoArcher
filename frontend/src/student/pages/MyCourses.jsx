import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import studentService from '../services/studentService.js';
import { navigate } from '../../app/router.jsx';

export default function MyCourses({ path }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    studentService.getCourses()
      .then(setCourses)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StudentLayout currentPath={path} title="My Courses" subtitle="Continue practicing your enrolled courses.">
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading courses…</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No courses found</h3>
          <p>You are not enrolled in any courses yet. Contact your administrator.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {courses.map(c => {
            const pct = c.total ? Math.round(100 * (c.solved || 0) / c.total) : 0;
            return (
              <div
                key={c.id}
                className="course-card"
                onClick={() => navigate(`/courses/${c.id}`)}
              >
                <div className="course-card-code">{c.code}</div>
                <div className="course-card-title">{c.name}</div>
                <div className="course-card-progress-label">
                  <span>{c.solved || 0} of {c.total || 0} solved</span>
                  <span>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ marginTop: 16, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Tap to practice →
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}

