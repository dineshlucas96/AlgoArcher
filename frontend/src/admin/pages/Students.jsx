import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import adminService from '../services/adminService.js';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { navigate } from '../../app/router.jsx';

export default function Students({ path }) {
  const [students, setStudents]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);

  // Filter states
  const [deptFilter, setDeptFilter]   = useState('');
  const [yearFilter, setYearFilter]   = useState('');
  const [secFilter, setSecFilter]     = useState('');

  // New Student Form state
  const [formData, setFormData]       = useState({
    name: '',
    reg_no: '',
    email: '',
    phone: '',
    dept: 'CSE',
    year: '2',
    section: 'A',
    courses: 'PY101,DS201',
  });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError]     = useState('');

  useEffect(() => {
    fetchStudents();
  }, [deptFilter, yearFilter, secFilter]);

  function fetchStudents() {
    setLoading(true);
    setError('');
    adminService.getDashboard({
      dept: deptFilter,
      year: yearFilter,
      section: secFilter,
      page: 1,
    })
      .then(res => {
        // Enriched with contacts & mock fallback metadata if needed
        const list = (res.students || []).map((s, idx) => ({
          ...s,
          id: s.id || idx + 1,
          email: s.email || `${s.name.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
          phone: s.phone || `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
          status: 'Active',
          courses: s.courses || 'PY101, DS201',
          faculty_advisor: s.dept === 'CSE' ? 'Dr. Anil Sharma' : 'Dr. Kavita Rao',
        }));
        setStudents(list);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  function handleAddStudent(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) { setFormError('Student name is required.'); return; }
    if (!formData.reg_no.trim()) { setFormError('Registration number is required.'); return; }
    if (!formData.email.trim() || !formData.email.includes('@')) { setFormError('Valid email is required.'); return; }

    const newStudent = {
      id: students.length + 1,
      name: formData.name.trim(),
      reg_no: formData.reg_no.trim().toUpperCase(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || '—',
      dept: formData.dept,
      year: Number(formData.year),
      section: formData.section,
      easy: 0,
      medium: 0,
      hard: 0,
      points: 0,
      status: 'Active',
      courses: formData.courses,
      faculty_advisor: formData.dept === 'CSE' ? 'Dr. Anil Sharma' : 'Dr. Kavita Rao',
    };

    setStudents(prev => [newStudent, ...prev]);
    setFormSuccess('Student profile created successfully!');
    setTimeout(() => {
      setIsAddModalOpen(false);
      setFormSuccess('');
      setFormData({
        name: '',
        reg_no: '',
        email: '',
        phone: '',
        dept: 'CSE',
        year: '2',
        section: 'A',
        courses: 'PY101,DS201',
      });
    }, 1200);
  }

  const columns = [
    {
      key: 'reg_no',
      label: 'Reg No',
      width: 110,
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy)', fontSize: '0.82rem' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Student Name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'dept',
      label: 'Department',
      width: 90,
      render: (val) => <span className="badge badge-neutral">{val}</span>,
    },
    {
      key: 'year',
      label: 'Year',
      width: 70,
      render: (val) => `Yr ${val}`,
    },
    {
      key: 'section',
      label: 'Sec',
      width: 60,
      render: (val) => `Sec ${val}`,
    },
    {
      key: 'easy',
      label: 'Easy',
      width: 70,
      align: 'center',
      render: (val) => <span className="badge badge-easy">{val || 0}</span>,
    },
    {
      key: 'medium',
      label: 'Med',
      width: 70,
      align: 'center',
      render: (val) => <span className="badge badge-medium">{val || 0}</span>,
    },
    {
      key: 'hard',
      label: 'Hard',
      width: 70,
      align: 'center',
      render: (val) => <span className="badge badge-hard">{val || 0}</span>,
    },
    {
      key: 'points',
      label: 'Points',
      width: 90,
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)', fontSize: '0.95rem' }}>
          {val || 0}
        </span>
      ),
    },
    {
      key: 'actions',
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
            setSelectedStudent(row);
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
      title="Student Directory"
      subtitle="Comprehensive roster of enrolled students, performance standings, and academic mappings."
      headerActions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin/import')}
          >
            ⬆ Bulk Import
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Student
          </button>
        </div>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Filter Toolbar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <label>Department</label>
          <select
            className="input select-input"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="AIDS">AIDS</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Academic Year</label>
          <select
            className="input select-input"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Section</label>
          <select
            className="input select-input"
            value={secFilter}
            onChange={e => setSecFilter(e.target.value)}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div className="filter-actions">
          {(deptFilter || yearFilter || secFilter) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setDeptFilter(''); setYearFilter(''); setSecFilter(''); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          Loading student roster…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={students}
          searchPlaceholder="Search by name, reg no, email, or dept…"
          onRowClick={(row) => setSelectedStudent(row)}
          emptyIcon="🎓"
          emptyTitle="No students found"
          emptyMessage="No student records match the active filter criteria."
        />
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile — ${selectedStudent.name}`}
          maxWidth={620}
          footer={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedStudent(null)}
            >
              Done
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header with avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--navy)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
              }}>
                {selectedStudent.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--navy)' }}>
                  {selectedStudent.name}
                </h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Reg No: <strong>{selectedStudent.reg_no}</strong> · {selectedStudent.email}
                </div>
              </div>
              <span className="badge badge-success">Active Enrolled</span>
            </div>

            {/* Academic Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
                <div style={{ fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>{selectedStudent.dept}</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Year & Section</span>
                <div style={{ fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>Year {selectedStudent.year} · Sec {selectedStudent.section}</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Advisor</span>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--navy)', marginTop: 4 }}>{selectedStudent.faculty_advisor}</div>
              </div>
            </div>

            {/* Performance Stats */}
            <div>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--navy)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Problem Solving Breakdown
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div style={{ padding: 12, background: 'var(--easy-soft)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--easy)', lineHeight: 1 }}>{selectedStudent.easy || 0}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--easy)', marginTop: 4 }}>Easy Solved</div>
                </div>
                <div style={{ padding: 12, background: 'var(--medium-soft)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--medium)', lineHeight: 1 }}>{selectedStudent.medium || 0}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--medium)', marginTop: 4 }}>Medium Solved</div>
                </div>
                <div style={{ padding: 12, background: 'var(--hard-soft)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--hard)', lineHeight: 1 }}>{selectedStudent.hard || 0}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hard)', marginTop: 4 }}>Hard Solved</div>
                </div>
                <div style={{ padding: 12, background: 'var(--gold-soft)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92710E', lineHeight: 1 }}>{selectedStudent.points || 0}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92710E', marginTop: 4 }}>Total Points</div>
                </div>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--navy)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Enrolled Courses
              </h5>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-navy" style={{ padding: '6px 12px' }}>📘 PY101 · Python Programming</span>
                <span className="badge badge-navy" style={{ padding: '6px 12px' }}>📗 DS201 · Data Structures</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Student"
          maxWidth={540}
        >
          {formSuccess ? (
            <div className="alert alert-success">{formSuccess}</div>
          ) : (
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formError && <div className="alert alert-error">{formError}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="input"
                    placeholder="e.g. Ramesh Kannan"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Register Number *</label>
                  <input
                    className="input"
                    placeholder="e.g. S021"
                    value={formData.reg_no}
                    onChange={e => setFormData({ ...formData, reg_no: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="ramesh@college.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="input"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
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
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select
                    className="input select-input"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select
                    className="input select-input"
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Enrollments (Comma separated)</label>
                <input
                  className="input"
                  value={formData.courses}
                  onChange={e => setFormData({ ...formData, courses: e.target.value })}
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
                  Save Student
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}

