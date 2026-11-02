import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import studentService from '../services/studentService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import { navigate } from '../../app/router.jsx';

export default function Practice({ path }) {
  const [courses, setCourses]       = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [problems, setProblems]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 1. Fetch enrolled courses
  useEffect(() => {
    studentService.getCourses()
      .then(res => {
        setCourses(res || []);
        if (res && res.length > 0) {
          setSelectedCourse(res[0].id);
        }
      })
      .catch(e => setError(e.message));
  }, []);

  // 2. Fetch problems for selected course
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    setError('');
    studentService.getCourseProblems(selectedCourse)
      .then(res => {
        setProblems(res || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const filteredProblems = problems.filter(p => {
    if (diffFilter && p.difficulty !== diffFilter) return false;
    if (statusFilter === 'solved' && !p.solved) return false;
    if (statusFilter === 'unsolved' && p.solved) return false;
    return true;
  });

  const columns = [
    {
      key: 'title',
      label: 'Challenge Title',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.92rem' }}>
            {val}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Course ID: {selectedCourse} · Standard I/O
          </div>
        </div>
      ),
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      width: 120,
      render: (val) => {
        const cls = val === 'easy' ? 'badge-easy' : val === 'medium' ? 'badge-medium' : 'badge-hard';
        return <span className={`badge ${cls}`}>{val}</span>;
      },
    },
    {
      key: 'points',
      label: 'Points',
      width: 100,
      align: 'center',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--navy)' }}>⭐ {val}</span>,
    },
    {
      key: 'solved',
      label: 'Status',
      width: 120,
      align: 'center',
      render: (val) => (
        val ? (
          <span className="badge badge-success">✓ Solved</span>
        ) : (
          <span className="badge badge-neutral">Unsolved</span>
        )
      ),
    },
    {
      key: 'action',
      label: 'Action',
      width: 110,
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <button
          type="button"
          className={`btn ${row.solved ? 'btn-outline' : 'btn-primary'} btn-sm`}
          style={{ fontSize: '0.75rem', padding: '4px 12px' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${selectedCourse}/problems/${row.id}`);
          }}
        >
          {row.solved ? 'Review' : 'Solve'} →
        </button>
      ),
    },
  ];

  const currentCourse = courses.find(c => c.id === selectedCourse);

  return (
    <StudentLayout
      currentPath={path}
      title="Practice Arena"
      subtitle="Interactive coding environment with sandboxed tests, automatic grading, and instant feedback."
      headerActions={
        <button
          className="btn btn-gold btn-sm"
          onClick={() => navigate(`/courses/${selectedCourse}/leaderboard`)}
        >
          🏆 Course Leaderboard
        </button>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Course switcher & filters */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-group" style={{ minWidth: 200 }}>
          <label>Selected Course</label>
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
          <label>Difficulty</label>
          <select
            className="input select-input"
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Solve Status</label>
          <select
            className="input select-input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="solved">Solved Only</option>
            <option value="unsolved">Unsolved Only</option>
          </select>
        </div>

        <div className="filter-actions">
          {(diffFilter || statusFilter) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setDiffFilter(''); setStatusFilter(''); }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Course stats banner */}
      {currentCourse && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Course Progress</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginTop: 2 }}>
              {problems.filter(p => p.solved).length} / {problems.length} solved
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Points Available</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)', marginTop: 2 }}>
              {problems.reduce((a, b) => a + (b.points || 0), 0)} pts
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Supported Runtime</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginTop: 4 }}>
              🐍 Python 3.13 Standard
            </div>
          </div>
        </div>
      )}

      {/* Problem list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          Loading coding challenges…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredProblems}
          searchPlaceholder="Search challenge by title…"
          onRowClick={(row) => navigate(`/courses/${selectedCourse}/problems/${row.id}`)}
          emptyIcon="🎯"
          emptyTitle="No challenges found"
          emptyMessage="Try adjusting the filters above."
        />
      )}
    </StudentLayout>
  );
}

