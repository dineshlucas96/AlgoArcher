import React, { useState, useEffect } from 'react';
import FacultyLayout from '../layouts/FacultyLayout.jsx';
import facultyService from '../services/facultyService.js';
import DataTable from '../../components/ui/DataTable.jsx';

export default function Reports({ path }) {
  const [courses, setCourses]       = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [opts, setOpts]             = useState({ dept: [], year: [], section: [] });
  const [filters, setFilters]       = useState({ dept: '', year: '', section: '' });
  const [students, setStudents]     = useState([]);
  const [average, setAverage]       = useState(0);
  const [loading, setLoading]       = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError]           = useState('');

  // 1. Fetch faculty courses
  useEffect(() => {
    facultyService.getCourses()
      .then(res => {
        setCourses(res || []);
        if (res && res.length > 0) {
          setSelectedCourse(res[0].id);
        }
      })
      .catch(e => setError(e.message));
  }, []);

  // 2. Fetch filters when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    facultyService.getCourseFilters(selectedCourse)
      .then(setOpts)
      .catch(() => {});
  }, [selectedCourse]);

  // 3. Fetch report data for preview
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    setError('');
    facultyService.getCourseDashboard(selectedCourse, filters)
      .then(res => {
        const list = (res.students || []).map(s => ({
          ...s,
          total: (s.easy || 0) + (s.medium || 0) + (s.hard || 0),
        })).sort((a, b) => b.total - a.total);
        setStudents(list);
        setAverage(res.average_solved || res.average || 0);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedCourse, filters]);

  async function handleDownloadReport() {
    setDownloading(true);
    setError('');
    try {
      await facultyService.downloadReport(selectedCourse, filters);
    } catch (e) {
      setError('Report export failed: ' + e.message);
    } finally {
      setDownloading(false);
    }
  }

  const columns = [
    {
      key: 'reg_no',
      label: 'Registration Number',
      width: 150,
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Student Name',
      render: (val, row) => row.name || row.student_name,
    },
    {
      key: 'dept',
      label: 'Dept',
      width: 90,
      render: (val) => <span className="badge badge-neutral">{val}</span>,
    },
    {
      key: 'year',
      label: 'Year',
      width: 80,
      render: (val) => `Yr ${val}`,
    },
    {
      key: 'section',
      label: 'Sec',
      width: 80,
      render: (val) => `Sec ${val}`,
    },
    {
      key: 'easy',
      label: 'Easy Solved',
      width: 110,
      align: 'center',
      render: (val) => <span className="badge badge-easy">{val || 0}</span>,
    },
    {
      key: 'medium',
      label: 'Medium Solved',
      width: 120,
      align: 'center',
      render: (val) => <span className="badge badge-medium">{val || 0}</span>,
    },
    {
      key: 'hard',
      label: 'Hard Solved',
      width: 110,
      align: 'center',
      render: (val) => <span className="badge badge-hard">{val || 0}</span>,
    },
    {
      key: 'total',
      label: 'Total Solved',
      width: 110,
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)', fontSize: '1rem' }}>
          {val || 0}
        </span>
      ),
    },
  ];

  const currentCourseObj = courses.find(c => c.id === Number(selectedCourse));

  return (
    <FacultyLayout
      currentPath={path}
      title="Academic Performance Reports"
      subtitle="Generate and download accredited Excel gradebook reports for internal and departmental reviews."
      headerActions={
        <button
          className="btn btn-primary"
          onClick={handleDownloadReport}
          disabled={downloading || students.length === 0}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          {downloading ? (
            <>
              <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span>Exporting XLSX…</span>
            </>
          ) : (
            <>
              <span>⬇ Download Excel Report</span>
            </>
          )}
        </button>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Top filter configuration */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-group" style={{ minWidth: 220 }}>
          <label>Target Course</label>
          <select
            className="input select-input"
            value={selectedCourse}
            onChange={e => setSelectedCourse(Number(e.target.value))}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Department</label>
          <select
            className="input select-input"
            value={filters.dept}
            onChange={e => setFilters({ ...filters, dept: e.target.value })}
          >
            <option value="">All Departments</option>
            {(opts.dept || []).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Year</label>
          <select
            className="input select-input"
            value={filters.year}
            onChange={e => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="">All Years</option>
            {(opts.year || []).map(y => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Section</label>
          <select
            className="input select-input"
            value={filters.section}
            onChange={e => setFilters({ ...filters, section: e.target.value })}
          >
            <option value="">All Sections</option>
            {(opts.section || []).map(s => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          {(filters.dept || filters.year || filters.section) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setFilters({ dept: '', year: '', section: '' })}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* KPI overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Students in Report</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>{students.length}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Average Problems Solved</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>{Number(average).toFixed(1)}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Export Format</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginTop: 6 }}>
            📊 Microsoft Excel (.xlsx)
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: 'var(--navy)' }}>
          Report Preview — {currentCourseObj ? currentCourseObj.name : 'Course'}
        </h4>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Columns match college regulatory report requirements
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          Loading gradebook data…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={students}
          searchPlaceholder="Search student by name or registration number…"
          emptyIcon="📊"
          emptyTitle="No report entries match criteria"
          emptyMessage="Adjust the filters above to view enrolled students."
        />
      )}
    </FacultyLayout>
  );
}

