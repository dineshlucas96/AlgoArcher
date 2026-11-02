import React, { useState, useRef } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import adminService from '../services/adminService.js';

function UploadSection({ kind, label, description }) {
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef(null);

  function handleFile(f) {
    setError('');
    setResult(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.xlsx')) {
      setError('Only .xlsx files are accepted.');
      return;
    }
    setFile(f);
  }

  async function handleUpload() {
    if (!file) { setError('Please select an .xlsx file first.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await adminService.uploadStudents
        ? (kind === 'students' ? adminService.uploadStudents(file) : adminService.uploadFaculty(file))
        : null;
      const data = await r;
      setResult(data);
      setFile(null);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function doUpload() {
    if (!file) { setError('Please select an .xlsx file first.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = kind === 'students'
        ? await adminService.uploadStudents(file)
        : await adminService.uploadFaculty(file);
      setResult(data);
      setFile(null);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadTemplate() {
    try {
      await adminService.downloadTemplate(kind);
    } catch(e) {
      setError('Template download failed: ' + e.message);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ color: 'var(--navy)', marginBottom: 4 }}>{label}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{description}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={downloadTemplate}>
          ⬇ Download Template
        </button>
      </div>

      {/* Drop zone */}
      <div
        className={`import-dropzone${dragover ? ' dragover' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={e => {
          e.preventDefault();
          setDragover(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="import-dropzone-icon">📂</div>
        <p style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>
          {file ? file.name : 'Drop .xlsx file here or click to browse'}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
          Only Excel (.xlsx) files · Max 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={doUpload}
          disabled={loading || !file}
        >
          {loading ? 'Uploading…' : `Upload ${label}`}
        </button>
        {file && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFile(null)}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <div className="import-result-summary" style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div className="import-result-card created">
              <div className="import-result-number">{result.created}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Created</div>
            </div>
            <div className="import-result-card updated">
              <div className="import-result-number">{result.updated}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Updated</div>
            </div>
            <div className="import-result-card failed">
              <div className="import-result-number">{result.failed?.length || 0}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Failed</div>
            </div>
          </div>

          {result.failed?.length > 0 && (
            <div>
              <h4 style={{ marginBottom: 12, color: 'var(--error)' }}>Failed Rows</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>Row</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failed.map((x, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{x.row}</td>
                        <td style={{ color: 'var(--error)' }}>{x.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!result.failed?.length && (
            <div className="alert alert-success">
              ✓ Import completed successfully. {result.created} created, {result.updated} updated.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BulkImport({ path }) {
  return (
    <AdminLayout
      currentPath={path}
      title="Bulk Import"
      subtitle="Import students and faculty from Excel files."
    >
      <UploadSection
        kind="students"
        label="Import Students"
        description="Upload an Excel file with student records. Download the template to see the required format."
      />
      <UploadSection
        kind="faculty"
        label="Import Faculty"
        description="Upload an Excel file with faculty records. Course and department mappings are processed automatically."
      />
    </AdminLayout>
  );
}

