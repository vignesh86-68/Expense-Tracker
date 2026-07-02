import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Receipt, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Entertainment: '#8b5cf6',
  Shopping: '#f472b6', Health: '#10b981', Utilities: '#64748b',
  Education: '#38bdf8', Other: '#6b7280',
};
const CAT_EMOJI = { Food: '🍔', Transport: '🚗', Entertainment: '🎬', Shopping: '🛍️', Health: '💊', Utilities: '💡', Education: '📚', Other: '💳' };

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>
            {label}
          </div>
          <div style={{
            fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--text)',
            letterSpacing: '-0.02em', lineHeight: 1.1,
            fontSize: 'clamp(1.1rem, 5vw, 1.7rem)',
            wordBreak: 'break-all',
          }}>
            ₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      {sub && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 8, lineHeight: 1.4 }}>{sub}</div>
      )}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ color: 'var(--text2)', fontSize: '0.75rem', marginBottom: 2 }}>{label}</div>
        <div style={{ color: 'var(--accent2)', fontWeight: 600 }}>₹{Number(payload[0].value).toLocaleString('en-IN')}</div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const trendData = stats?.monthlyTrend?.map(m => ({ name: m.label, amount: Number(m.total) })) || [];
  const pieData = stats?.categoryBreakdown?.map(c => ({ name: c.category, value: Number(c.total) })) || [];
  const thisMonth = Number(stats?.totalThisMonth || 0);
  const lastMonth = Number(stats?.totalLastMonth || 0);
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', lineHeight: 1.2 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 6, fontSize: '0.85rem' }}>
          Financial overview — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Stat Cards — always 3 columns on mobile ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <StatCard label="This Month" value={thisMonth} icon={Receipt} color="var(--accent)"
          sub={change !== null ? `${change > 0 ? '▲' : '▼'} ${Math.abs(change)}%` : 'No prior data'} />
        <StatCard label="Last Month" value={lastMonth} icon={Calendar} color="var(--purple)" sub="Previous" />
        <StatCard label="This Year" value={stats?.totalThisYear || 0} icon={TrendingUp} color="var(--green)"
          sub={`${stats?.expenseCountThisMonth || 0} txns`} />
      </div>

      {/* ── Spending Trend chart ── */}
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Spending Trend</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 2 }}>Last 6 months</div>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 10 }}
              tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} width={44} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5}
              fill="url(#grad)" dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Category pie ── */}
      <div className="card">
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 12 }}>By Category</div>
        {pieData.length > 0 ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {pieData.slice(0, 5).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[d.name] || '#6b7280', flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text2)', fontSize: '0.8rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.78rem', flexShrink: 0 }}>₹{Number(d.value).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0', fontSize: '0.88rem' }}>No data this month</div>
        )}
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Recent Transactions</div>
          <Link to="/expenses" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent2)', fontSize: '0.8rem', fontWeight: 500 }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {stats?.recentExpenses?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {stats.recentExpenses.map((exp, i) => (
              <div key={exp.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 10px', borderRadius: 9, gap: 10,
                background: i % 2 === 0 ? 'transparent' : 'var(--bg3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: (CATEGORY_COLORS[exp.category] || '#6b7280') + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem'
                  }}>
                    {CAT_EMOJI[exp.category] || '💳'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                      {exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem', flexShrink: 0 }}>
                  ₹{Number(exp.amount).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0', fontSize: '0.88rem' }}>
            No transactions yet.{' '}
            <Link to="/expenses" style={{ color: 'var(--accent2)' }}>Add your first expense</Link>
          </div>
        )}
      </div>
    </div>
  );
}
