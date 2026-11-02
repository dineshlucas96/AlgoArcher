import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import studentService from '../services/studentService.js';
import { navigate } from '../../app/router.jsx';

function HeatmapGrid({ entries }) {
  const counts = Object.fromEntries(entries.map(x => [x.date, x.count]));
  const today  = new Date();
  today.setHours(12, 0, 0, 0);
  const start  = new Date(today);
  start.setDate(today.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const cells = [];
  for (let week = 0; week < 53; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      if (date > today || date < new Date(today.getTime() - 364 * 86400000)) continue;
      const key = date.toISOString().slice(0, 10);
      const n   = counts[key] || 0;
      const level = n === 0 ? 'l0' : n === 1 ? 'l1' : n <= 3 ? 'l2' : n <= 5 ? 'l3' : 'l4';
      cells.push({ key, n, level });
    }
  }

  return (
    <div>
      <div className="heatmap-grid">
        {cells.map(c => (
          <div
            key={c.key}
            className={`heatmap-cell ${c.level}`}
            title={`${c.key}: ${c.n} submission${c.n !== 1 ? 's' : ''}`}
          />
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        {['l0','l1','l2','l3','l4'].map(l => <div key={l} className={`heatmap-cell ${l}`} />)}
        <span>More</span>
      </div>
    </div>
  );
}

export default function StudentDashboard({ path }) {
  const [dashboard, setDashboard] = useState(null);
  const [heatmap, setHeatmap]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([studentService.getDashboard(), studentService.getHeatmap()])
      .then(([d, h]) => { setDashboard(d); setHeatmap(h); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <StudentLayout currentPath={path} title="Dashboard">
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading dashboard…</div>
    </StudentLayout>
  );

  if (error) return (
    <StudentLayout currentPath={path} title="Dashboard">
      <div className="alert alert-error">{error}</div>
    </StudentLayout>
  );

  const courses = dashboard?.courses || [];
  const solved  = courses.reduce((n, c) => n + (c.solved || 0), 0);
  const total   = courses.reduce((n, c) => n + (c.total || 0), 0);
  const streak  = dashboard?.streak || 0;
  const rank    = dashboard?.overall_rank || dashboard?.rank || '—';

  return (
    <StudentLayout currentPath={path} title="Dashboard" subtitle="Track your progress and practice activity.">
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            Current Streak 🔥
          </div>
          <div className="streak-value">{streak}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 6 }}>days</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            Problems Solved
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {solved}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 6 }}>of {total} problems</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            Overall Rank
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {rank}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 6 }}>among students</div>
        </div>
      </div>

      {/* Course progress */}
      {courses.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: 'var(--navy)', marginBottom: 20 }}>Course Progress</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
                  <div className="course-card-badges" style={{ marginTop: 12 }}>
                    <span className="badge badge-easy">Easy {c.easy || 0}</span>
                    <span className="badge badge-medium">Medium {c.medium || 0}</span>
                    <span className="badge badge-hard">Hard {c.hard || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="card">
        <h2 style={{ color: 'var(--navy)', marginBottom: 16, fontSize: '1.1rem' }}>Submission Activity</h2>
        <div className="heatmap-container">
          <HeatmapGrid entries={heatmap} />
        </div>
      </div>
    </StudentLayout>
  );
}

