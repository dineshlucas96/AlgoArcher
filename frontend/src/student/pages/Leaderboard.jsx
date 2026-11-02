import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import studentService from '../services/studentService.js';
import { navigate } from '../../app/router.jsx';

export default function Leaderboard({ path, courseId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const cid = Number(courseId);

  useEffect(() => {
    if (!cid) return;
    setLoading(true);
    setError('');
    studentService.getLeaderboard(cid)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [cid]);

  const userRank = data?.my_rank ?? data?.your_rank;

  return (
    <StudentLayout
      currentPath={path}
      title="Course Leaderboard"
      subtitle="Rankings and score standings for enrolled students."
      headerActions={
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/courses/${cid}`)}
        >
          ← Back to Problems
        </button>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      {/* Rank callout card */}
      {!loading && !error && data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Your Rank
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--gold)', lineHeight: 1 }}>
              {userRank ? `#${userRank}` : 'Unranked'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              out of {data.total || 0} enrolled
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Total Students
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)', lineHeight: 1 }}>
              {data.total || 0}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              competing in this course
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Top Score
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)', lineHeight: 1 }}>
              {data.rows?.[0]?.points || 0}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              points achieved
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading leaderboard…</div>
      ) : !data?.rows?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No leaderboard entries yet</h3>
          <p>Solve practice problems to appear on the course leaderboard.</p>
        </div>
      ) : (
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>
              Standings
            </h4>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Top performers ranked by solved problems and points
            </span>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Rank</th>
                  <th>Student Name</th>
                  <th>Register Number</th>
                  <th style={{ width: 140, textAlign: 'center' }}>Problems Solved</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map(x => {
                  const isTop1 = x.rank === 1;
                  const isTop2 = x.rank === 2;
                  const isTop3 = x.rank === 3;
                  const rankBadge =
                    isTop1 ? '🥇 1' :
                    isTop2 ? '🥈 2' :
                    isTop3 ? '🥉 3' : `#${x.rank}`;

                  return (
                    <tr
                      key={x.reg_no}
                      className={x.current ? 'rank-me' : ''}
                    >
                      <td className="rank-col">
                        <span style={{
                          color: isTop1 ? '#92710E' : isTop2 ? '#64748B' : isTop3 ? '#8B5A2B' : 'inherit',
                          fontWeight: (isTop1 || isTop2 || isTop3) ? 800 : 600,
                        }}>
                          {rankBadge}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                          {x.name}
                        </span>
                        {x.current && (
                          <span className="badge badge-gold" style={{ marginLeft: 8, fontSize: '0.7rem' }}>
                            You
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {x.reg_no}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.8125rem' }}>
                          {x.solved} solved
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--navy)' }}>
                        {x.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

