import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import studentService from '../services/studentService.js';
import { navigate } from '../../app/router.jsx';

export default function CodingWorkspace({ path, courseId, problemId }) {
  const [problem, setProblem] = useState(null);
  const [code, setCode]       = useState('');
  const [out, setOut]         = useState(null);
  const [mode, setMode]       = useState('');
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState('');

  const cid = Number(courseId);
  const pid = Number(problemId);

  useEffect(() => {
    if (!pid || !cid) return;
    setErr('');
    studentService.getProblem(pid, cid)
      .then(p => {
        setProblem(p);
        setCode(p.starter_code || '');
      })
      .catch(e => setErr(e.message));
  }, [pid, cid]);

  async function exec(action) {
    setBusy(true);
    setErr('');
    setMode(action);
    try {
      const result = action === 'run'
        ? await studentService.runCode(pid, code, cid)
        : await studentService.submitCode(pid, code, cid);
      setOut(result);
    } catch (e) {
      setErr(
        e.status === 429
          ? 'Please wait a few seconds between runs/submits.'
          : e.status === 503
          ? 'Runner unavailable. Start Judge0 or configure local runner.'
          : e.message
      );
    } finally {
      setBusy(false);
    }
  }

  const verdict = out?.verdict || out?.status;
  const isAccepted = verdict === 'ACCEPTED';

  return (
    <StudentLayout
      currentPath={path}
      fullHeight={true}
      title={problem ? problem.title : 'Problem Workspace'}
      subtitle={problem ? `Course Code Problem · ${problem.points} Points` : ''}
      headerActions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/courses/${cid}`)}
          >
            ← Back to Problems
          </button>
        </div>
      }
    >
      {err && !problem ? (
        <div style={{ padding: 40 }}><div className="alert alert-error">{err}</div></div>
      ) : !problem ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading coding workspace…
        </div>
      ) : (
        <div className="workspace-shell">
          {/* ── LEFT PANE: Problem Description & Samples ── */}
          <section className="workspace-problem-pane">
            <div className="problem-meta">
              <span className={`badge ${
                problem.difficulty === 'easy' ? 'badge-easy' :
                problem.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
              }`}>
                {problem.difficulty}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                ⭐ {problem.points} Points
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 16 }}>
              {problem.title}
            </h2>

            <div style={{
              fontSize: '0.9375rem',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              marginBottom: 28,
            }}>
              {problem.description}
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
              Sample Test Cases
            </h3>

            {(problem.samples || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No sample cases provided.</p>
            ) : (
              problem.samples.map((s, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Sample #{idx + 1}
                  </div>
                  <pre className="sample-block">
                    <span style={{ color: 'var(--text-muted)' }}>Input:</span>{'\n'}
                    {s.input || '(empty)'}{'\n\n'}
                    <span style={{ color: 'var(--text-muted)' }}>Expected Output:</span>{'\n'}
                    {s.output}
                  </pre>
                </div>
              ))
            )}
          </section>

          {/* ── RIGHT PANE: Code Editor & Execution Console ── */}
          <section className="workspace-editor-pane">
            {/* Editor Toolbar */}
            <div className="editor-toolbar">
              <span className="editor-lang-tag">Python 3</span>
              <div className="editor-actions">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={busy}
                  onClick={() => exec('run')}
                >
                  {busy && mode === 'run' ? (
                    <>
                      <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Running…
                    </>
                  ) : (
                    '▶ Run Code'
                  )}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                  onClick={() => exec('submit')}
                >
                  {busy && mode === 'submit' ? (
                    <>
                      <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    '🚀 Submit Solution'
                  )}
                </button>
              </div>
            </div>

            {/* Code textarea area */}
            <div className="code-editor-area">
              <textarea
                spellCheck={false}
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={busy}
                placeholder="# Write your Python 3 solution here..."
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const newCode = code.substring(0, start) + '    ' + code.substring(end);
                    setCode(newCode);
                    setTimeout(() => {
                      e.target.selectionStart = e.target.selectionEnd = start + 4;
                    }, 0);
                  }
                }}
              />
            </div>

            {/* Console Output Pane */}
            <div className="console-pane">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Execution Console
                </span>
                {out?.runtime_ms !== undefined && (
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    ⏱ {out.runtime_ms} ms
                  </span>
                )}
              </div>

              {err && (
                <div className="alert alert-error" style={{ marginBottom: 10 }}>
                  {err}
                </div>
              )}

              {busy && (
                <div style={{ color: 'var(--tech-blue)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Executing tests in sandboxed environment…
                </div>
              )}

              {!busy && !err && !out && (
                <div className="console-empty">
                  Click "Run Code" to test sample cases, or "Submit Solution" for full evaluation.
                </div>
              )}

              {/* Submit Mode Output */}
              {!busy && !err && out && mode === 'submit' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span className={isAccepted ? 'verdict-accepted' : 'verdict-wrong'}>
                      {verdict}
                    </span>
                    <span className={`badge ${isAccepted ? 'badge-success' : 'badge-error'}`}>
                      {out.passed ?? 0} / {out.total ?? 0} tests passed
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Total execution time: {out.runtime_ms ?? 0} ms
                  </div>
                </div>
              )}

              {/* Run Mode Output */}
              {!busy && !err && out && mode === 'run' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span className={isAccepted ? 'verdict-accepted' : 'verdict-wrong'}>
                      {verdict}
                    </span>
                    <span className="badge badge-neutral">
                      {out.passed ?? 0} / {out.total ?? 0} sample tests passed
                    </span>
                  </div>

                  {(out.cases || []).map((x, i) => {
                    const pass = x.verdict === 'ACCEPTED' || x.status === 'ACCEPTED';
                    return (
                      <div className={`test-case-result ${pass ? 'pass' : 'fail'}`} key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <strong style={{ color: pass ? 'var(--success)' : 'var(--error)' }}>
                            Case #{i + 1}: {x.verdict || x.status}
                          </strong>
                          {x.runtime_ms !== undefined && (
                            <span style={{ color: 'var(--text-muted)' }}>{x.runtime_ms} ms</span>
                          )}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Input: </span>{x.input || '(empty)'}{'\n'}
                          <span style={{ color: 'var(--text-secondary)' }}>Expected: </span>{x.expected}{'\n'}
                          <span style={{ color: 'var(--text-secondary)' }}>Actual: </span>{x.actual}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </StudentLayout>
  );
}

