import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import adminService from '../services/adminService.js';

function BarChart({ data }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, padding: '0 4px' }}>
      {data.map(d => (
        <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{d.value}</span>
          <div style={{
            width: '100%',
            height: `${Math.max((d.value / max) * 80, 4)}px`,
            background: 'var(--navy)',
            borderRadius: '4px 4px 0 0',
            opacity: 0.85,
            transition: 'height 0.3s ease',
          }} />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics({ path }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    adminService.getDashboard({ page: 1 })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout currentPath={path} title="Analytics" subtitle="Platform performance and student insights.">
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading analytics…</div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout currentPath={path} title="Analytics">
      <div className="alert alert-error">{error}</div>
    </AdminLayout>
  );

  const students = data?.students || [];

  // Dept distribution
  const deptCount = {};
  students.forEach(s => { deptCount[s.dept] = (deptCount[s.dept] || 0) + 1; });
  const deptData = Object.entries(deptCount).map(([label, value]) => ({ label, value })).slice(0, 8);

  // Year distribution
  const yearCount = {};
  students.forEach(s => { yearCount[s.year] = (yearCount[s.year] || 0) + 1; });
  const yearData = Object.entries(yearCount).sort().map(([label, value]) => ({ label: `Yr ${label}`, value }));

  // Difficulty distribution (cumulative from all students)
  const totals = students.reduce((acc, s) => ({
    easy: acc.easy + (s.easy || 0),
    medium: acc.medium + (s.medium || 0),
    hard: acc.hard + (s.hard || 0),
  }), { easy: 0, medium: 0, hard: 0 });
  const difficultyData = [
    { label: 'Easy', value: totals.easy },
    { label: 'Medium', value: totals.medium },
    { label: 'Hard', value: totals.hard },
  ];

  const totalPoints = students.reduce((a, s) => a + (s.points || 0), 0);
  const avgPoints   = students.length ? Math.round(totalPoints / students.length) : 0;
  const maxPoints   = Math.max(...students.map(s => s.points || 0), 0);
  const activeStu   = students.filter(s => (s.easy + s.medium + s.hard) > 0).length;

  return (
    <AdminLayout
      currentPath={path}
      title="Analytics"
      subtitle="Platform performance and student progress insights."
    >
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Students',      value: data?.total || 0 },
          { label: 'Active Students',     value: activeStu },
          { label: 'Avg Points / Student',value: avgPoints },
          { label: 'Highest Points',      value: maxPoints },
        ].map(s => (
          <div className="card" key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, color: 'var(--navy)', fontSize: '1rem' }}>By Department</h3>
          <BarChart data={deptData} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, color: 'var(--navy)', fontSize: '1rem' }}>By Year</h3>
          <BarChart data={yearData} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, color: 'var(--navy)', fontSize: '1rem' }}>Submissions by Difficulty</h3>
          <BarChart data={difficultyData} />
        </div>
      </div>

      {/* Top 10 */}
      {data?.top10?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, color: 'var(--navy)' }}>🏆 Top Performers</h3>
          <div className="table-container" style={{ boxShadow: 'none', border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>Rank</th>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th style={{ textAlign: 'center' }}>Solved</th>
                  <th style={{ textAlign: 'right' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {data.top10.map((x, i) => (
                  <tr key={x.reg_no}>
                    <td className="rank-col"
                      style={{ fontWeight: 800, color: i === 0 ? '#92710E' : i === 1 ? '#7A7A7A' : 'var(--text-secondary)' }}>
                      {i + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{x.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{x.reg_no}</td>
                    <td style={{ textAlign: 'center' }}>{x.solved}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{x.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

