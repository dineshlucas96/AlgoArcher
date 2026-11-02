import React, { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import studentService from '../services/studentService.js';

export default function Achievements({ path }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    studentService.getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const courses = data?.courses || [];
  const solved = courses.reduce((n, x) => n + (x.solved || 0), 0);
  const total = courses.reduce((n, x) => n + (x.total || 0), 0);
  const streak = data?.streak || 0;

  const milestones = [
    { title: 'First Solve', desc: 'Solved at least 1 coding problem', unlocked: solved >= 1, icon: '🌱' },
    { title: 'Problem Solver', desc: 'Solved 5 or more problems', unlocked: solved >= 5, icon: '🎯' },
    { title: 'Master of Algorithms', desc: 'Solved 20 or more problems', unlocked: solved >= 20, icon: '🏅' },
    { title: 'Streak Starter', desc: 'Maintained a 3-day coding streak', unlocked: streak >= 3, icon: '⚡' },
    { title: 'Week Warrior', desc: 'Maintained a 7-day coding streak', unlocked: streak >= 7, icon: '🔥' },
    { title: 'Multi-Course Explorer', desc: 'Enrolled in 2 or more courses', unlocked: courses.length >= 2, icon: '🚀' },
  ];

  return (
    <StudentLayout
      currentPath={path}
      title="Achievements & Badges"
      subtitle="Milestones earned throughout your AlgoArcher learning journey."
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      {/* Top summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Total Solved
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--navy)', lineHeight: 1 }}>
            {loading ? '—' : solved}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            across {courses.length} courses
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Current Streak
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--gold)', lineHeight: 1 }}>
            {loading ? '—' : `${streak} 🔥`}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            consecutive days
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Badges Unlocked
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--success)', lineHeight: 1 }}>
            {loading ? '—' : milestones.filter(m => m.unlocked).length} / {milestones.length}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            achievements completed
          </div>
        </div>
      </div>

      {/* Milestones grid */}
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginBottom: 20 }}>
        Badges & Milestones
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {milestones.map((m, idx) => (
          <div
            key={idx}
            className="achievement-card"
            style={{
              opacity: m.unlocked ? 1 : 0.6,
              border: m.unlocked ? '1px solid var(--gold-border)' : '1px solid var(--border)',
              background: m.unlocked ? 'var(--white)' : 'var(--bg-subtle)',
            }}
          >
            <div
              className="achievement-icon"
              style={{
                background: m.unlocked ? 'var(--gold-soft)' : 'var(--border)',
                filter: m.unlocked ? 'none' : 'grayscale(1)',
              }}
            >
              {m.icon}
            </div>
            <div className="achievement-text" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4>{m.title}</h4>
                <span className={`badge ${m.unlocked ? 'badge-gold' : 'badge-neutral'}`}>
                  {m.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <p>{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}

