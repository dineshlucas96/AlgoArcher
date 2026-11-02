import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function Courses({ path }) {
  const [courses, setCourses] = useState([
    {
      id: 1,
      code: 'PY101',
      name: 'Python Programming',
      dept: 'CSE',
      year: 2,
      faculty_name: 'Dr. Anil Sharma, Dr. Kavita Rao',
      enrolled: 20,
      problems_count: 5,
      avg_solve_rate: '78%',
      description: 'Foundations of Python syntax, data structures, control flow, functions, and algorithm practice.',
    },
    {
      id: 2,
      code: 'DS201',
      name: 'Data Structures',
      dept: 'CSE',
      year: 2,
      faculty_name: 'Dr. Mehul Patel',
      enrolled: 20,
      problems_count: 5,
      avg_solve_rate: '62%',
      description: 'Linear and non-linear data structures: Arrays, Linked Lists, Stacks, Queues, Trees, and Sorting.',
    },
    {
      id: 3,
      code: 'AL301',
      name: 'Design and Analysis of Algorithms',
      dept: 'CSE',
      year: 3,
      faculty_name: 'Dr. Anil Sharma',
      enrolled: 18,
      problems_count: 8,
      avg_solve_rate: '45%',
      description: 'Greedy algorithms, Dynamic Programming, Graph Traversals, and Complexity Analysis.',
    },
    {
      id: 4,
      code: 'AI202',
      name: 'Foundations of Artificial Intelligence',
      dept: 'AIDS',
      year: 2,
      faculty_name: 'Dr. Kavita Rao',
      enrolled: 16,
      problems_count: 6,
      avg_solve_rate: '55%',
      description: 'Search algorithms, Knowledge Representation, Probability, and introduction to Machine Learning models.',
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [formData, setFormData]             = useState({
    code: '',
    name: '',
    dept: 'CSE',
    year: '2',
    faculty_name: 'Dr. Anil Sharma',
    description: '',
  });
  const [formSuccess, setFormSuccess]       = useState('');
  const [formError, setFormError]           = useState('');

  function handleAddCourse(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.code.trim()) { setFormError('Course code is required (e.g. CS101).'); return; }
    if (!formData.name.trim()) { setFormError('Course name is required.'); return; }

    const newCourse = {
      id: courses.length + 1,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      dept: formData.dept,
      year: Number(formData.year),
      faculty_name: formData.faculty_name,
      enrolled: 0,
      problems_count: 0,
      avg_solve_rate: '0%',
      description: formData.description.trim() || 'Core departmental coding course.',
    };

    setCourses(prev => [newCourse, ...prev]);
    setFormSuccess('Course created successfully!');
    setTimeout(() => {
      setIsAddModalOpen(false);
      setFormSuccess('');
      setFormData({
        code: '',
        name: '',
        dept: 'CSE',
        year: '2',
        faculty_name: 'Dr. Anil Sharma',
        description: '',
      });
    }, 1200);
  }

  const columns = [
    {
      key: 'code',
      label: 'Course Code',
      width: 120,
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--navy)', fontSize: '0.9rem' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Course Name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Dept: {row.dept} · Year {row.year}
          </div>
        </div>
      ),
    },
    {
      key: 'faculty_name',
      label: 'Faculty In-Charge',
      render: (val) => <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{val}</span>,
    },
    {
      key: 'enrolled',
      label: 'Students',
      width: 100,
      align: 'center',
      render: (val) => <span className="badge badge-navy">{val} enrolled</span>,
    },
    {
      key: 'problems_count',
      label: 'Problems',
      width: 90,
      align: 'center',
      render: (val) => <span className="badge badge-neutral">{val} active</span>,
    },
    {
      key: 'avg_solve_rate',
      label: 'Completion',
      width: 110,
      align: 'center',
      render: (val) => <span className="badge badge-gold">{val}</span>,
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
            setSelectedCourse(row);
          }}
        >
          Details →
        </button>
      ),
    },
  ];

  return (
    <AdminLayout
      currentPath={path}
      title="Course Catalog"
      subtitle="Curriculum management, problem counts, faculty assignments, and cohort enrollment."
      headerActions={
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add Course
        </button>
      }
    >
      {/* Course Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
        {courses.map(c => (
          <div
            key={c.id}
            className="card card-hover"
            style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onClick={() => setSelectedCourse(c)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase' }}>
                  {c.code}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {c.dept}
                </span>
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--navy)', lineHeight: 1.3 }}>
                {c.name}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineClamp: 2, overflow: 'hidden' }}>
                {c.description}
              </p>
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {c.enrolled} students · {c.problems_count} problems
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                {c.avg_solve_rate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Course Table */}
      <DataTable
        columns={columns}
        data={courses}
        searchPlaceholder="Search courses by code, name, or faculty…"
        onRowClick={(row) => setSelectedCourse(row)}
        emptyIcon="📚"
        emptyTitle="No courses found"
        emptyMessage="Add a new course or import from student registrations."
      />

      {/* Course Details Modal */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={`Course Overview — ${selectedCourse.code}`}
          maxWidth={600}
          footer={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedCourse(null)}
            >
              Done
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' }}>
                {selectedCourse.code} · Year {selectedCourse.year} ({selectedCourse.dept})
              </span>
              <h3 style={{ margin: '4px 0 8px', color: 'var(--navy)' }}>{selectedCourse.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                {selectedCourse.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Enrolled</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>{selectedCourse.enrolled}</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Problems</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>{selectedCourse.problems_count}</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Avg Progress</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>{selectedCourse.avg_solve_rate}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Assigned Faculty
              </span>
              <div style={{ fontWeight: 600, color: 'var(--navy)', marginTop: 4 }}>
                {selectedCourse.faculty_name}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Course"
          maxWidth={520}
        >
          {formSuccess ? (
            <div className="alert alert-success">{formSuccess}</div>
          ) : (
            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formError && <div className="alert alert-error">{formError}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Course Code *</label>
                  <input
                    className="input"
                    placeholder="e.g. CS205"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="input select-input"
                    value={formData.dept}
                    onChange={e => setFormData({ ...formData, dept: e.target.value })}
                  >
                    <option value="CSE">CSE</option>
                    <option value="AIDS">AIDS</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input
                  className="input"
                  placeholder="e.g. Object Oriented Programming with Java"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <select
                    className="input select-input"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Faculty In-Charge</label>
                  <input
                    className="input"
                    value={formData.faculty_name}
                    onChange={e => setFormData({ ...formData, faculty_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Syllabus Overview</label>
                <textarea
                  className="input textarea-input"
                  rows={3}
                  placeholder="Brief summary of learning objectives and topics..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
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
                  Create Course
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}

