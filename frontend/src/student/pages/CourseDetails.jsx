import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import studentService from '../services/studentService.js';
import { navigate } from '../../app/router.jsx';

export default function CourseDetails({ path, courseId }) {
  const [problems, setProblems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cid = Number(courseId);

  useEffect(() => {
    if (!cid) return;
    setLoading(true);
    setError('');
    studentService.getCourseProblems(cid)
      .then(setProblems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [cid]);

  return (
    <StudentLayout
      currentPath={path}
      title="Course Problems"
      subtitle="Select a problem to start practicing and coding."
      headerActions={
        <button
          className="btn btn-gold btn-sm"
          onClick={() => navigate(`/courses/${cid}/leaderboard`)}
        >
          🏆 Course Leaderboard
        </button>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading problems…</div>
      ) : !problems || problems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No problems found</h3>
          <p>There are no practice problems published for this course yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>
              Practice Problems ({problems.length})
            </h4>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {problems.filter(p => p.solved).length} of {problems.length} solved
            </span>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Title</th>
                  <th style={{ width: 120 }}>Difficulty</th>
                  <th style={{ width: 100, textAlign: 'center' }}>Points</th>
                  <th style={{ width: 120, textAlign: 'center' }}>Status</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, idx) => {
                  const diffClass =
                    p.difficulty === 'easy' ? 'badge-easy' :
                    p.difficulty === 'medium' ? 'badge-medium' : 'badge-hard';

                  return (
                    <tr
                      key={p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/courses/${cid}/problems/${p.id}`)}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.9375rem' }}>
                          {p.title}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${diffClass}`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                        {p.points}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {p.solved ? (
                          <span className="badge badge-solved">✓ Solved</span>
                        ) : (
                          <span className="badge badge-neutral">Unsolved</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`btn ${p.solved ? 'btn-outline' : 'btn-primary'} btn-sm`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${cid}/problems/${p.id}`);
                          }}
                        >
                          {p.solved ? 'Review' : 'Solve'} →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

