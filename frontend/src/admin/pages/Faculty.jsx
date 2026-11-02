import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { navigate } from '../../app/router.jsx';

export default function Faculty({ path }) {
  const [facultyList, setFacultyList] = useState([
    {
      id: 1,
      faculty_id: 'F001',
      name: 'Dr. Anil Sharma',
      email: 'faculty1@college.edu',
      mobile: '+91 94451 23456',
      dept: 'CSE',
      year: 2,
      section: 'A',
      course: 'PY101 · Python Programming',
      students_count: 12,
      status: 'Active',
    },
    {
      id: 2,
      faculty_id: 'F002',
      name: 'Dr. Kavita Rao',
      email: 'faculty2@college.edu',
      mobile: '+91 94452 34567',
      dept: 'AIDS',
      year: 2,
      section: 'B',
      course: 'PY101 · Python Programming',
      students_count: 8,
      status: 'Active',
    },
    {
      id: 3,
      faculty_id: 'F003',
      name: 'Dr. Mehul Patel',
      email: 'faculty3@college.edu',
      mobile: '+91 94453 45678',
      dept: 'CSE',
      year: 2,
      section: 'A',
      course: 'DS201 · Data Structures',
      students_count: 20,
      status: 'Active',
    },
    {
      id: 4,
      faculty_id: 'F004',
      name: 'Prof. Sangeetha Murugan',
      email: 'sangeetha.m@college.edu',
      mobile: '+91 94454 56789',
      dept: 'ECE',
      year: 3,
      section: 'A',
      course: 'EC301 · Digital Signal Processing',
      students_count: 18,
      status: 'Active',
    },
    {
      id: 5,
      faculty_id: 'F005',
      name: 'Dr. Rajesh Sundaram',
      email: 'rajesh.s@college.edu',
      mobile: '+91 94455 67890',
      dept: 'MECH',
      year: 2,
      section: 'B',
      course: 'ME201 · Applied Thermodynamics',
      students_count: 15,
      status: 'Active',
    },
  ]);

  const [deptFilter, setDeptFilter]         = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);

  // Add Faculty Form State
  const [formData, setFormData] = useState({
    name: '',
    faculty_id: '',
    email: '',
    mobile: '',
    dept: 'CSE',
    year: '2',
    section: 'A',
    course: 'PY101 · Python Programming',
  });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError]     = useState('');

  const filteredFaculty = deptFilter
    ? facultyList.filter(f => f.dept === deptFilter)
    : facultyList;

  function handleAddFaculty(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) { setFormError('Faculty name is required.'); return; }
    if (!formData.faculty_id.trim()) { setFormError('Faculty ID is required.'); return; }
    if (!formData.email.trim() || !formData.email.includes('@')) { setFormError('Valid email is required.'); return; }

    const newFaculty = {
      id: facultyList.length + 1,
      faculty_id: formData.faculty_id.trim().toUpperCase(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile.trim() || '—',
      dept: formData.dept,
      year: Number(formData.year),
      section: formData.section,
      course: formData.course,
      students_count: 0,
      status: 'Active',
    };

    setFacultyList(prev => [newFaculty, ...prev]);
    setFormSuccess('Faculty member registered successfully!');
    setTimeout(() => {
      setIsAddModalOpen(false);
      setFormSuccess('');
      setFormData({
        name: '',
        faculty_id: '',
        email: '',
        mobile: '',
        dept: 'CSE',
        year: '2',
        section: 'A',
        course: 'PY101 · Python Programming',
      });
    }, 1200);
  }

  const columns = [
    {
      key: 'faculty_id',
      label: 'Faculty ID',
      width: 110,
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Faculty Name',
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
      width: 100,
      render: (val) => <span className="badge badge-neutral">{val}</span>,
    },
    {
      key: 'course',
      label: 'Assigned Course',
      render: (val) => (
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--navy)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'mapping',
      label: 'Year / Sec',
      width: 110,
      render: (_, row) => `Yr ${row.year} · Sec ${row.section}`,
    },
    {
      key: 'students_count',
      label: 'Mapped Students',
      width: 120,
      align: 'center',
      render: (val) => (
        <span className="badge badge-blue">
          {val} students
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 90,
      align: 'center',
      render: (val) => <span className="badge badge-success">{val}</span>,
    },
    {
      key: 'action',
      label: 'Action',
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
            setSelectedFaculty(row);
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
      title="Faculty Management"
      subtitle="Overview of academic instructors, department alignments, and course allocations."
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
            + Add Faculty
          </button>
        </div>
      }
    >
      {/* Top summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Faculty</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>{facultyList.length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>CSE Department</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>
            {facultyList.filter(f => f.dept === 'CSE').length}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>AIDS Department</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>
            {facultyList.filter(f => f.dept === 'AIDS').length}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Other Departments</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)', marginTop: 4 }}>
            {facultyList.filter(f => !['CSE', 'AIDS'].includes(f.dept)).length}
          </div>
        </div>
      </div>

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

        <div className="filter-actions">
          {deptFilter && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setDeptFilter('')}
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Faculty Table */}
      <DataTable
        columns={columns}
        data={filteredFaculty}
        searchPlaceholder="Search faculty by name, ID, or course…"
        onRowClick={(row) => setSelectedFaculty(row)}
        emptyIcon="👨‍🏫"
        emptyTitle="No faculty members found"
        emptyMessage="Try adjusting the department filter."
      />

      {/* Faculty Details Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={!!selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
          title={`Faculty Profile — ${selectedFaculty.name}`}
          maxWidth={580}
          footer={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedFaculty(null)}
            >
              Done
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--gold-soft)',
                color: '#92710E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
              }}>
                👨‍🏫
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--navy)' }}>
                  {selectedFaculty.name}
                </h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Faculty ID: <strong>{selectedFaculty.faculty_id}</strong> · {selectedFaculty.email}
                </div>
              </div>
              <span className="badge badge-success">Active Faculty</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Department</span>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginTop: 2 }}>{selectedFaculty.dept}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mobile Contact</span>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginTop: 2 }}>{selectedFaculty.mobile}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Teaching Allocation</span>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginTop: 2 }}>{selectedFaculty.course}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cohort Mapping</span>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginTop: 2 }}>Year {selectedFaculty.year} · Section {selectedFaculty.section}</div>
              </div>
            </div>

            <div className="card" style={{ padding: 14, background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--navy)' }}>Mapped Students in Cohort</span>
                <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>{selectedFaculty.students_count} Students</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Faculty Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Faculty Member"
          maxWidth={540}
        >
          {formSuccess ? (
            <div className="alert alert-success">{formSuccess}</div>
          ) : (
            <form onSubmit={handleAddFaculty} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formError && <div className="alert alert-error">{formError}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="input"
                    placeholder="e.g. Dr. Preethi Nathan"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Faculty ID *</label>
                  <input
                    className="input"
                    placeholder="e.g. F006"
                    value={formData.faculty_id}
                    onChange={e => setFormData({ ...formData, faculty_id: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="preethi@college.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="input"
                    placeholder="+91 9876543210"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
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
                <label className="form-label">Assigned Course</label>
                <input
                  className="input"
                  value={formData.course}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
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
                  Register Faculty
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}

