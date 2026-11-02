import React, { useState, useEffect } from 'react';
import FacultyLayout from '../layouts/FacultyLayout.jsx';
import facultyService from '../services/facultyService.js';

export default function FacultyCourseDetails({ path, courseId }) {
  const [rows, setRows]       = useState([]);
  const [opts, setOpts]       = useState({ dept: [], year: [], section: [] });
  const [draft, setDraft]     = useState({ dept: '', year: '', section: '' });
  const [filters, setFilters] = useState({ dept: '', year: '', section: '' });
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [error, setError]     = useState('');

  const cid = Number(courseId);

  // Load filter options
  useEffect(() => {
    if (!cid) return;
    facultyService.getCourseFilters(cid).then(setOpts).catch(() => {});
  }, [cid]);

  // Load dashboard data
  useEffect(() => {
    if (!cid) return;
    setLoading(true);
    setError('');
    facultyService.getCourseDashboard(cid, filters)
      .then(data => {
        const sorted = (data.students || [])
          .map(x => ({ ...x, total: (x.easy || 0) + (x.medium || 0) + (x.hard || 0) }))
          .sort((a, b) => b.total - a.total || String(a.reg_no).localeCompare(String(b.reg_no)));
        setRows(sorted);
        setAverage(data.average_solved || data.average || 0);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [cid, filters]);

  const isFiltered = filters.dept || filters.year || filters.section;
  const filterLabel = [
    filters.dept,
    filters.year && `Year ${filters.year}`,
    filters.section && `Section ${filters.section}`,
  ].filter(Boolean).join(' · ');

  async function handleReport() {
    setReporting(true);
    try {
      await facultyService.downloadReport(cid, filters);
    } catch(e) {
      setError('Report download failed: ' + e.message);
    } finally {
      setReporting(false);
    }
  }

  const maxTotal = Math.max(...rows.map(r => r.total), 1);

  return (
    <FacultyLayout
      currentPath={path}
      title="Course Dashboard"
      subtitle="Student performance for this course."
      headerActions={
        <button
          className="btn btn-primary faculty-report-btn"
          onClick={handleReport}
          disabled={reporting}
        >
          {reporting ? 'Generating…' : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Report{isFiltered ? ` (${filterLabel})` : ''}
            </>
          )}
        </button>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      {/* Stats */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Students
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)' }}>{rows.length}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Avg Problems Solved
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)' }}>
              {Number(average).toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Department</label>
          <select className="input select-input" value={draft.dept}
            onChange={e => setDraft(d => ({ ...d, dept: e.target.value }))}>
            <option value="">All</option>
            {opts.dept.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Year</label>
          <select className="input select-input" value={draft.year}
            onChange={e => setDraft(d => ({ ...d, year: e.target.value }))}>
            <option value="">All</option>
            {opts.year.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Section</label>
          <select className="input select-input" value={draft.section}
            onChange={e => setDraft(d => ({ ...d, section: e.target.value }))}>
            <option value="">All</option>
            {opts.section.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn btn-primary" onClick={() => setFilters({ ...draft })}>Apply</button>
          <button className="btn btn-ghost" onClick={() => {
            const reset = { dept: '', year: '', section: '' };
            setDraft(reset); setFilters(reset);
          }}>Reset</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>
            Student Performance
            {isFiltered && <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 12 }}>{filterLabel}</span>}
          </h4>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{rows.length} students</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <h3>No students found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Dept</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th style={{ textAlign: 'center' }}>Easy</th>
                  <th style={{ textAlign: 'center' }}>Medium</th>
                  <th style={{ textAlign: 'center' }}>Hard</th>
                  <th>Progress</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(x => {
                  const pct = Math.round((x.total / maxTotal) * 100);
                  return (
                    <tr key={x.reg_no}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{x.reg_no}</td>
                      <td style={{ fontWeight: 600 }}>{x.name || x.student_name}</td>
                      <td>{x.dept}</td>
                      <td>{x.year}</td>
                      <td>{x.section}</td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-easy">{x.easy || 0}</span></td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-medium">{x.medium || 0}</span></td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-hard">{x.hard || 0}</span></td>
                      <td style={{ width: 100 }}>
                        <div className="performance-indicator">
                          <div className="performance-bar-inline">
                            <div className="performance-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        {x.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}

