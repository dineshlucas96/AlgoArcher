import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import adminService from '../services/adminService.js';

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`admin-stat-card ${accent || ''}`}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard({ path }) {
  const [data, setData]       = useState(null);
  const [filters, setFilters] = useState({ year: '', dept: '', section: '', faculty_id: '', page: 1 });
  const [draft, setDraft]     = useState({ year: '', dept: '', section: '', faculty_id: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.getDashboard(filters)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  function applyFilters() {
    setFilters({ ...draft, page: 1 });
  }

  function resetFilters() {
    const reset = { year: '', dept: '', section: '', faculty_id: '' };
    setDraft(reset);
    setFilters({ ...reset, page: 1 });
  }

  const isFiltered = filters.year || filters.dept || filters.section || filters.faculty_id;
  const filterLabel = [
    filters.dept,
    filters.year && `Year ${filters.year}`,
    filters.section && `Section ${filters.section}`,
  ].filter(Boolean).join(' · ');

  const totalStudents = data?.total || 0;
  const totalPages    = data?.pages || 1;

  return (
    <AdminLayout
      currentPath={path}
      title="Admin Dashboard"
      subtitle="Manage students, faculty, and platform activity."
    >
      {/* Stats */}
      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Total Students" value={loading ? '—' : totalStudents} sub="Registered students" />
        <StatCard label="Current Page" value={loading ? '—' : (data?.rows?.length || 0)} sub="Shown in table" accent="blue" />
        <StatCard label="Total Pages" value={loading ? '—' : totalPages} sub="In filtered set" accent="green" />
        <StatCard label="Top Scorer" value={loading ? '—' : (data?.top10?.[0]?.points ?? '—')} sub="Points" accent="gold" />
      </div>

      {/* Top 10 */}
      {!loading && !error && data?.top10?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, color: 'var(--navy)' }}>
            🏆 Top 10 Leaderboard
            {isFiltered && <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 12 }}>{filterLabel}</span>}
          </h3>
          <div className="admin-top10-list">
            {data.top10.map((x, i) => (
              <div className="admin-top10-item" key={x.reg_no}>
                <span className={`admin-top10-rank ${i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : ''}`}>
                  {i + 1}
                </span>
                <span className="admin-top10-name">{x.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{x.reg_no}</span>
                <span className="admin-top10-meta">{x.solved} solved</span>
                <span className="badge badge-gold">{x.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Year</label>
          <input className="input" placeholder="e.g. 1" value={draft.year}
            onChange={e => setDraft(d => ({ ...d, year: e.target.value }))} />
        </div>
        <div className="filter-group">
          <label>Department</label>
          <input className="input" placeholder="e.g. CSE" value={draft.dept}
            onChange={e => setDraft(d => ({ ...d, dept: e.target.value }))} />
        </div>
        <div className="filter-group">
          <label>Section</label>
          <input className="input" placeholder="e.g. A" value={draft.section}
            onChange={e => setDraft(d => ({ ...d, section: e.target.value }))} />
        </div>
        <div className="filter-group">
          <label>Faculty ID</label>
          <input className="input" placeholder="Faculty reg no" value={draft.faculty_id}
            onChange={e => setDraft(d => ({ ...d, faculty_id: e.target.value }))} />
        </div>
        <div className="filter-actions">
          <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
          <button className="btn btn-ghost" onClick={resetFilters}>Reset</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>
            Student Progress
            {isFiltered && <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 12 }}>{filterLabel}</span>}
          </h4>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {loading ? '' : `${totalStudents} total`}
          </span>
        </div>

        {error && <div className="alert alert-error" style={{ margin: 20 }}>{error}</div>}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading…
          </div>
        ) : !data?.students?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <h3>No students found</h3>
            <p>Try adjusting your filters or importing students.</p>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Dept</th>
                    <th>Section</th>
                    <th style={{ textAlign: 'center' }}>Easy</th>
                    <th style={{ textAlign: 'center' }}>Medium</th>
                    <th style={{ textAlign: 'center' }}>Hard</th>
                    <th style={{ textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map(x => (
                    <tr key={x.reg_no}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{x.reg_no}</td>
                      <td style={{ fontWeight: 600 }}>{x.name}</td>
                      <td>{x.year}</td>
                      <td>{x.dept}</td>
                      <td>{x.section}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-easy">{x.easy}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-medium">{x.medium}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-hard">{x.hard}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        {x.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span className="pagination-info">
                Page {data.page} of {data.pages || 1} · {totalStudents} students
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={data.page <= 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              >← Prev</button>
              <button
                className="btn btn-outline btn-sm"
                disabled={data.page >= (data.pages || 1)}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              >Next →</button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

