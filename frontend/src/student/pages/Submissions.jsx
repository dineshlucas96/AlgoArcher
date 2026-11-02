import React, { useState } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { navigate } from '../../app/router.jsx';

export default function Submissions({ path }) {
  const [submissions, setSubmissions] = useState([
    {
      id: 101,
      problem_title: 'Sum of Array',
      course_code: 'PY101',
      course_name: 'Python Programming',
      course_id: 1,
      language: 'Python 3',
      status: 'ACCEPTED',
      passed_tests: 4,
      total_tests: 4,
      runtime_ms: 12,
      created_at: '2026-11-02 09:30:45',
      code: 'n = int(input())\na = list(map(int, input().split()))\nprint(sum(a))',
    },
    {
      id: 102,
      problem_title: 'Reverse a String',
      course_code: 'PY101',
      course_name: 'Python Programming',
      course_id: 1,
      language: 'Python 3',
      status: 'ACCEPTED',
      passed_tests: 4,
      total_tests: 4,
      runtime_ms: 10,
      created_at: '2026-11-01 16:15:20',
      code: 'import sys\ns = sys.stdin.readline().rstrip("\\n")\nprint(s[::-1])',
    },
    {
      id: 103,
      problem_title: 'Count Vowels',
      course_code: 'PY101',
      course_name: 'Python Programming',
      course_id: 1,
      language: 'Python 3',
      status: 'ACCEPTED',
      passed_tests: 4,
      total_tests: 4,
      runtime_ms: 11,
      created_at: '2026-10-31 18:40:11',
      code: 'import sys\ns = sys.stdin.readline().lower()\nprint(sum(c in "aeiou" for c in s))',
    },
    {
      id: 104,
      problem_title: 'Two Sum',
      course_code: 'DS201',
      course_name: 'Data Structures',
      course_id: 2,
      language: 'Python 3',
      status: 'WRONG_ANSWER',
      passed_tests: 2,
      total_tests: 4,
      runtime_ms: 18,
      created_at: '2026-10-30 11:22:04',
      code: 'print(0)',
    },
    {
      id: 105,
      problem_title: 'Valid Parentheses',
      course_code: 'DS201',
      course_name: 'Data Structures',
      course_id: 2,
      language: 'Python 3',
      status: 'ACCEPTED',
      passed_tests: 4,
      total_tests: 4,
      runtime_ms: 15,
      created_at: '2026-10-29 14:05:33',
      code: 'def isValid(s):\n    stack = []\n    mapping = {")":"(", "}":"{", "]":"["}\n    for c in s:\n        if c in mapping:\n            if not stack or stack.pop() != mapping[c]:\n                return "false"\n        else:\n            stack.append(c)\n    return "true" if not stack else "false"\n\nprint(isValid(input().strip()))',
    },
  ]);

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSub, setSelectedSub]   = useState(null);

  const filteredSubs = statusFilter
    ? submissions.filter(s => s.status === statusFilter)
    : submissions;

  const columns = [
    {
      key: 'problem_title',
      label: 'Problem Title',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{val}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {row.course_code} · {row.course_name}
          </div>
        </div>
      ),
    },
    {
      key: 'language',
      label: 'Language',
      width: 110,
      render: (val) => <span className="badge badge-neutral">{val}</span>,
    },
    {
      key: 'status',
      label: 'Verdict',
      width: 140,
      render: (val) => {
        const isOk = val === 'ACCEPTED';
        return (
          <span className={`badge ${isOk ? 'badge-success' : 'badge-error'}`} style={{ fontWeight: 800 }}>
            {isOk ? '✓ ACCEPTED' : '✗ WRONG_ANSWER'}
          </span>
        );
      },
    },
    {
      key: 'tests',
      label: 'Tests Passed',
      width: 120,
      align: 'center',
      render: (_, row) => `${row.passed_tests} / ${row.total_tests}`,
    },
    {
      key: 'runtime_ms',
      label: 'Runtime',
      width: 100,
      align: 'center',
      render: (val) => `${val} ms`,
    },
    {
      key: 'created_at',
      label: 'Submitted At',
      width: 170,
      render: (val) => <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{val}</span>,
    },
    {
      key: 'action',
      label: 'Code',
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
            setSelectedSub(row);
          }}
        >
          View Code
        </button>
      ),
    },
  ];

  return (
    <StudentLayout
      currentPath={path}
      title="Submission History"
      subtitle="Complete chronological log of your code submissions, evaluations, and runtime performances."
      headerActions={
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/student/courses')}
        >
          Practice Problems →
        </button>
      }
    >
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Submissions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>{submissions.length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Accepted Solutions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
            {submissions.filter(s => s.status === 'ACCEPTED').length}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Acceptance Rate</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gold)', marginTop: 4 }}>
            {Math.round((submissions.filter(s => s.status === 'ACCEPTED').length / submissions.length) * 100)}%
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Fastest Runtime</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--tech-blue)', marginTop: 4 }}>
            {Math.min(...submissions.map(s => s.runtime_ms))} ms
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <label>Verdict Filter</label>
          <select
            className="input select-input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Verdicts</option>
            <option value="ACCEPTED">Accepted Only</option>
            <option value="WRONG_ANSWER">Wrong Answer Only</option>
          </select>
        </div>

        <div className="filter-actions">
          {statusFilter && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setStatusFilter('')}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredSubs}
        searchPlaceholder="Search submissions by problem name or course…"
        onRowClick={(row) => setSelectedSub(row)}
        emptyIcon="📋"
        emptyTitle="No submissions found"
        emptyMessage="Solve problems in your enrolled courses to record submissions."
      />

      {/* View Code Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Submitted Solution — ${selectedSub.problem_title}`}
          maxWidth={640}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {selectedSub.created_at} · {selectedSub.runtime_ms} ms
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedSub(null)}
              >
                Close
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${selectedSub.status === 'ACCEPTED' ? 'badge-success' : 'badge-error'}`} style={{ fontWeight: 800 }}>
                  {selectedSub.status}
                </span>
                <span className="badge badge-neutral">{selectedSub.language}</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>
                {selectedSub.passed_tests} / {selectedSub.total_tests} Tests Passed
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <pre style={{
                background: '#07101E',
                color: '#E2E8F0',
                padding: 18,
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                overflowX: 'auto',
                margin: 0,
              }}>
                {selectedSub.code}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </StudentLayout>
  );
}
