import React, { useState } from 'react';
import FacultyLayout from '../layouts/FacultyLayout.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function Problems({ path }) {
  const [problems, setProblems] = useState([
    {
      id: 1,
      title: 'Sum of Array',
      course: 'PY101 · Python Programming',
      course_id: 1,
      difficulty: 'easy',
      points: 10,
      test_cases_count: 4,
      description: 'Read n then n integers. Print their sum. Input/Output: stdin/stdout. Constraints: 1<=n<=100000.',
      starter_code: 'import sys\n# write your solution here\n',
      samples: [
        { input: '5\n1 2 3 4 5\n', output: '15' },
        { input: '3\n-2 0 7\n', output: '5' },
      ],
    },
    {
      id: 2,
      title: 'Reverse a String',
      course: 'PY101 · Python Programming',
      course_id: 1,
      difficulty: 'easy',
      points: 10,
      test_cases_count: 4,
      description: 'Read one string line and print it reversed. Input/Output: stdin/stdout. Constraints: length<=100000.',
      starter_code: 'import sys\ns=sys.stdin.readline().rstrip("\\n")\n# write your solution here\n',
      samples: [
        { input: 'hello\n', output: 'olleh' },
        { input: 'Algo Archer\n', output: 'rehcrA oglA' },
      ],
    },
    {
      id: 3,
      title: 'Count Vowels',
      course: 'PY101 · Python Programming',
      course_id: 1,
      difficulty: 'easy',
      points: 10,
      test_cases_count: 4,
      description: 'Count a,e,i,o,u case-insensitively. Input/Output: one line to one integer. Constraints: length<=100000.',
      starter_code: 'import sys\ns=sys.stdin.readline().rstrip("\\n")\n# write your solution here\n',
      samples: [
        { input: 'Hello World\n', output: '3' },
        { input: 'AEIOU\n', output: '5' },
      ],
    },
    {
      id: 4,
      title: 'Two Sum',
      course: 'DS201 · Data Structures',
      course_id: 2,
      difficulty: 'medium',
      points: 20,
      test_cases_count: 4,
      description: 'Input n, array, target. Print smallest-first zero-based pair or -1 -1. Constraints: 2<=n<=100000.',
      starter_code: 'import sys\ndata=sys.stdin.read().split()\n# write your solution here\n',
      samples: [
        { input: '4\n2 7 11 15\n9\n', output: '0 1' },
        { input: '3\n3 2 4\n6\n', output: '1 2' },
      ],
    },
    {
      id: 5,
      title: 'Valid Parentheses',
      course: 'DS201 · Data Structures',
      course_id: 2,
      difficulty: 'medium',
      points: 20,
      test_cases_count: 4,
      description: 'Input brackets ()[]{}. Print true if valid else false. Constraints: length<=100000.',
      starter_code: 'import sys\ns=sys.stdin.readline().strip()\n# write your solution here\n',
      samples: [
        { input: '()[]{}\n', output: 'true' },
        { input: '(]\n', output: 'false' },
      ],
    },
  ]);

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Add form
  const [formData, setFormData] = useState({
    title: '',
    course_id: 1,
    difficulty: 'easy',
    points: 10,
    description: '',
    starter_code: '# Write your Python 3 solution here\n',
    sampleInput: '',
    sampleOutput: '',
  });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError]     = useState('');

  const filteredProblems = difficultyFilter
    ? problems.filter(p => p.difficulty === difficultyFilter)
    : problems;

  function handleAddProblem(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.title.trim()) { setFormError('Problem title is required.'); return; }
    if (!formData.description.trim()) { setFormError('Problem description is required.'); return; }

    const newProb = {
      id: problems.length + 1,
      title: formData.title.trim(),
      course: formData.course_id === 1 ? 'PY101 · Python Programming' : 'DS201 · Data Structures',
      course_id: Number(formData.course_id),
      difficulty: formData.difficulty,
      points: Number(formData.points),
      test_cases_count: 2,
      description: formData.description.trim(),
      starter_code: formData.starter_code,
      samples: [
        {
          input: formData.sampleInput || '1 2\n',
          output: formData.sampleOutput || '3\n',
        },
      ],
    };

    setProblems(prev => [newProb, ...prev]);
    setFormSuccess('Coding challenge created successfully!');
    setTimeout(() => {
      setIsAddModalOpen(false);
      setFormSuccess('');
      setFormData({
        title: '',
        course_id: 1,
        difficulty: 'easy',
        points: 10,
        description: '',
        starter_code: '# Write your Python 3 solution here\n',
        sampleInput: '',
        sampleOutput: '',
      });
    }, 1200);
  }

  const columns = [
    {
      key: 'title',
      label: 'Problem Title',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.92rem' }}>{val}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.course}</div>
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
      width: 90,
      align: 'center',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--navy)' }}>⭐ {val}</span>,
    },
    {
      key: 'test_cases_count',
      label: 'Test Cases',
      width: 110,
      align: 'center',
      render: (val) => <span className="badge badge-neutral">{val} cases</span>,
    },
    {
      key: 'action',
      label: 'Action',
      width: 100,
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProblem(row);
          }}
        >
          Inspect →
        </button>
      ),
    },
  ];

  return (
    <FacultyLayout
      currentPath={path}
      title="Problem Management"
      subtitle="Create, configure, and manage curriculum programming challenges and test suites."
      headerActions={
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Create Problem
        </button>
      }
    >
      {/* Filter toolbar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <label>Difficulty</label>
          <select
            className="input select-input"
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy (10 pts)</option>
            <option value="medium">Medium (20 pts)</option>
            <option value="hard">Hard (30 pts)</option>
          </select>
        </div>

        <div className="filter-actions">
          {difficultyFilter && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setDifficultyFilter('')}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Problems table */}
      <DataTable
        columns={columns}
        data={filteredProblems}
        searchPlaceholder="Search problems by title or course…"
        onRowClick={(row) => setSelectedProblem(row)}
        emptyIcon="📝"
        emptyTitle="No problems found"
        emptyMessage="Click 'Create Problem' to author a new challenge."
      />

      {/* Problem View Modal */}
      {selectedProblem && (
        <Modal
          isOpen={!!selectedProblem}
          onClose={() => setSelectedProblem(null)}
          title={`Problem Details — ${selectedProblem.title}`}
          maxWidth={620}
          footer={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedProblem(null)}
            >
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={`badge ${
                selectedProblem.difficulty === 'easy' ? 'badge-easy' :
                selectedProblem.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
              }`}>
                {selectedProblem.difficulty}
              </span>
              <span className="badge badge-navy">Course: {selectedProblem.course}</span>
              <span style={{ fontWeight: 700, color: 'var(--navy)' }}>⭐ {selectedProblem.points} Points</span>
            </div>

            <div>
              <h5 style={{ margin: '0 0 6px', color: 'var(--navy)', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                Description
              </h5>
              <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                {selectedProblem.description}
              </div>
            </div>

            <div>
              <h5 style={{ margin: '0 0 6px', color: 'var(--navy)', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                Starter Code Template
              </h5>
              <pre className="sample-block" style={{ margin: 0 }}>
                {selectedProblem.starter_code}
              </pre>
            </div>

            <div>
              <h5 style={{ margin: '0 0 6px', color: 'var(--navy)', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                Sample Cases ({selectedProblem.samples?.length || 0})
              </h5>
              {(selectedProblem.samples || []).map((s, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <pre className="sample-block" style={{ margin: 0 }}>
                    Input: {s.input}Output: {s.output}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Problem Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Problem"
          maxWidth={600}
        >
          {formSuccess ? (
            <div className="alert alert-success">{formSuccess}</div>
          ) : (
            <form onSubmit={handleAddProblem} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formError && <div className="alert alert-error">{formError}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Problem Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. Binary Search"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    className="input select-input"
                    value={formData.course_id}
                    onChange={e => setFormData({ ...formData, course_id: Number(e.target.value) })}
                  >
                    <option value={1}>PY101</option>
                    <option value={2}>DS201</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="input select-input"
                    value={formData.difficulty}
                    onChange={e => setFormData({
                      ...formData,
                      difficulty: e.target.value,
                      points: e.target.value === 'easy' ? 10 : e.target.value === 'medium' ? 20 : 30,
                    })}
                  >
                    <option value="easy">Easy (10 pts)</option>
                    <option value="medium">Medium (20 pts)</option>
                    <option value="hard">Hard (30 pts)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Awarded Points</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.points}
                    onChange={e => setFormData({ ...formData, points: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Problem Statement & Constraints *</label>
                <textarea
                  className="input textarea-input"
                  rows={3}
                  placeholder="Clearly describe the input, output, and constraints..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Sample Input</label>
                  <textarea
                    className="input textarea-input"
                    rows={2}
                    placeholder="e.g. 5&#10;1 2 3 4 5"
                    value={formData.sampleInput}
                    onChange={e => setFormData({ ...formData, sampleInput: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sample Output</label>
                  <textarea
                    className="input textarea-input"
                    rows={2}
                    placeholder="e.g. 15"
                    value={formData.sampleOutput}
                    onChange={e => setFormData({ ...formData, sampleOutput: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Publish Challenge
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </FacultyLayout>
  );
}

