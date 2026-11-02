import React, { useState, useEffect } from 'react';
import FacultyLayout from '../layouts/FacultyLayout.jsx';
import facultyService from '../services/facultyService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { navigate } from '../../app/router.jsx';

export function FacultyStudents({ path }) {
  const [courses, setCourses]       = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  // 2. Fetch students for selected course
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    setError('');
    facultyService.getCourseDashboard(selectedCourse)
      .then(res => {
        const list = (res.students || []).map(s => ({
          ...s,
          total: (s.easy || 0) + (s.medium || 0) + (s.hard || 0),
        })).sort((a, b) => b.total - a.total);
        setStudents(list);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const columns = [
    {
      key: 'reg_no',
      label: 'Registration Number',
      width: 140,
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Student Name',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{val || row.student_name}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Dept: {row.dept} · Yr {row.year} · Sec {row.section}
          </div>
        </div>
      ),
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
    {
      key: 'action',
      label: 'Profile',
      width: 90,
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(row);
          }}
        >
          Inspect →
        </button>
      ),
    },
  ];

  const currentCourse = courses.find(c => c.id === selectedCourse);

  return (
    <FacultyLayout
      currentPath={path}
      title="Student Performance"
      subtitle="Detailed individual performance metrics, solve counts across difficulty tiers, and student inspection."
      headerActions={
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/faculty/reports')}
        >
          📊 Reports & Gradebook
        </button>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Course Switcher */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-group" style={{ minWidth: 260 }}>
          <label>Course Scope</label>
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

        <div className="filter-actions">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing students in your mapped cohort
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Cohort Size</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>{students.length} students</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Class Average Solved</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
            {students.length > 0 ? (students.reduce((a, b) => a + b.total, 0) / students.length).toFixed(1) : 0} problems
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Top Performer</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold)', marginTop: 8 }}>
            {students[0]?.name || students[0]?.student_name || '—'} ({students[0]?.total || 0} solved)
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          Loading student performance records…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={students}
          searchPlaceholder="Search student by name or registration number…"
          onRowClick={(row) => setSelectedStudent(row)}
          emptyIcon="🎓"
          emptyTitle="No students found"
          emptyMessage="No students are enrolled in this course cohort."
        />
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Inspection — ${selectedStudent.name || selectedStudent.student_name}`}
          maxWidth={560}
          footer={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedStudent(null)}
            >
              Done
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--navy)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 800,
              }}>
                🎓
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: 'var(--navy)', fontSize: '1.1rem' }}>
                  {selectedStudent.name || selectedStudent.student_name}
                </h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Reg No: <strong>{selectedStudent.reg_no}</strong> · Dept: {selectedStudent.dept}
                </div>
              </div>
              <span className="badge badge-success">Enrolled</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Easy Problems</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--easy)', marginTop: 2 }}>{selectedStudent.easy || 0}</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Medium Problems</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--medium)', marginTop: 2 }}>{selectedStudent.medium || 0}</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Hard Problems</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hard)', marginTop: 2 }}>{selectedStudent.hard || 0}</div>
              </div>
            </div>

            <div className="card" style={{ padding: 16, background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>Total Problem Completion</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Course: {currentCourse?.name}</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>
                  {selectedStudent.total || 0} Solved
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </FacultyLayout>
  );
}

export function FacultySubmissions({ path }) {
  const [submissions] = useState([
    { id: 1, reg_no: 'S001', name: 'Alice Joseph', problem: 'Sum of Array', course: 'PY101', status: 'ACCEPTED', passed: 4, total: 4, runtime: '10ms', time: '10 mins ago' },
    { id: 2, reg_no: 'S002', name: 'Rahul Kumar', problem: 'Reverse a String', course: 'PY101', status: 'ACCEPTED', passed: 4, total: 4, runtime: '12ms', time: '25 mins ago' },
    { id: 3, reg_no: 'S003', name: 'Priya Nair', problem: 'Two Sum', course: 'DS201', status: 'WRONG_ANSWER', passed: 2, total: 4, runtime: '15ms', time: '1 hour ago' },
    { id: 4, reg_no: 'S004', name: 'Arjun Menon', problem: 'Valid Parentheses', course: 'DS201', status: 'ACCEPTED', passed: 4, total: 4, runtime: '11ms', time: '2 hours ago' },
    { id: 5, reg_no: 'S005', name: 'Sneha Reddy', problem: 'Sum of Array', course: 'PY101', status: 'ACCEPTED', passed: 4, total: 4, runtime: '14ms', time: '3 hours ago' },
  ]);

  const [selectedSub, setSelectedSub] = useState(null);

  const columns = [
    {
      key: 'reg_no',
      label: 'Student',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{row.name}</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{val}</div>
        </div>
      ),
    },
    {
      key: 'problem',
      label: 'Challenge',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.course}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Evaluation Verdict',
      width: 140,
      render: (val) => (
        <span className={`badge ${val === 'ACCEPTED' ? 'badge-success' : 'badge-error'}`} style={{ fontWeight: 800 }}>
          {val === 'ACCEPTED' ? '✓ ACCEPTED' : '✗ WRONG_ANSWER'}
        </span>
      ),
    },
    {
      key: 'passed',
      label: 'Test Results',
      width: 120,
      align: 'center',
      render: (_, row) => `${row.passed} / ${row.total}`,
    },
    {
      key: 'runtime',
      label: 'Runtime',
      width: 100,
      align: 'center',
      render: (val) => val,
    },
    {
      key: 'time',
      label: 'Submitted',
      width: 120,
      render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{val}</span>,
    },
    {
      key: 'action',
      label: 'Inspect',
      width: 90,
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSub(row);
          }}
        >
          View →
        </button>
      ),
    },
  ];

  return (
    <FacultyLayout
      currentPath={path}
      title="Recent Student Submissions"
      subtitle="Live audit feed of student code evaluations, pass/fail test results, and execution statistics."
    >
      <DataTable
        columns={columns}
        data={submissions}
        searchPlaceholder="Search submissions by student or challenge name…"
        emptyIcon="📋"
        emptyTitle="No submissions found"
      />

      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Submission Audit — ${selectedSub.name}`}
          maxWidth={540}
          footer={
            <button className="btn btn-primary btn-sm" onClick={() => setSelectedSub(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--navy)' }}>{selectedSub.problem}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedSub.course} · Python 3</div>
              </div>
              <span className={`badge ${selectedSub.status === 'ACCEPTED' ? 'badge-success' : 'badge-error'}`} style={{ fontWeight: 800 }}>
                {selectedSub.status}
              </span>
            </div>

            <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
              <div><strong>Student:</strong> {selectedSub.name} ({selectedSub.reg_no})</div>
              <div><strong>Pass Rate:</strong> {selectedSub.passed} / {selectedSub.total} tests passed</div>
              <div><strong>Execution Time:</strong> {selectedSub.runtime}</div>
              <div><strong>Timestamp:</strong> {selectedSub.time}</div>
            </div>
          </div>
        </Modal>
      )}
    </FacultyLayout>
  );
}
