import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Receipt, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#f472b6', '#38bdf8', '#a3e635'];

const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Entertainment: '#8b5cf6',
  Shopping: '#f472b6', Health: '#10b981', Utilities: '#64748b',
  Education: '#38bdf8', Other: '#6b7280',
};

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            ₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      {sub && <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ color: 'var(--text2)', fontSize: '0.8rem', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--accent2)', fontWeight: 600 }}>
          ₹{Number(payload[0].value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
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
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  const trendData = stats?.monthlyTrend?.map(m => ({ name: m.label, amount: Number(m.total) })) || [];
  const pieData = stats?.categoryBreakdown?.map(c => ({ name: c.category, value: Number(c.total) })) || [];
  const thisMonth = Number(stats?.totalThisMonth || 0);
  const lastMonth = Number(stats?.totalLastMonth || 0);
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 4 }}>Here's your financial overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard label="This Month" value={thisMonth} icon={Receipt}
          color="var(--accent)"
          sub={change !== null ? `${change > 0 ? '▲' : '▼'} ${Math.abs(change)}% vs last month` : 'No prior data'} />
        <StatCard label="Last Month" value={lastMonth} icon={Calendar} color="var(--purple)"
          sub="Previous month total" />
        <StatCard label="This Year" value={stats?.totalThisYear || 0} icon={TrendingUp} color="var(--green)"
          sub={`${stats?.expenseCountThisMonth || 0} transactions this month`} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Area chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Spending Trend</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>Last 6 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 11 }}
                tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#grad)" dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 16 }}>By Category</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[d.name] || COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text2)' }}>{d.name}</span>
                    </div>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>₹{Number(d.value).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '30px 0', fontSize: '0.9rem' }}>No data this month</div>}
        </div>
      </div>

      {/* Recent expenses */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Recent Transactions</div>
          <Link to="/expenses" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent2)', fontSize: '0.85rem', fontWeight: 500 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {stats?.recentExpenses?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {stats.recentExpenses.map((exp, i) => (
              <div key={exp.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 10,
                background: i % 2 === 0 ? 'transparent' : 'var(--bg3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: (CATEGORY_COLORS[exp.category] || '#6b7280') + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem'
                  }}>
                    {exp.category === 'Food' ? '🍔' : exp.category === 'Transport' ? '🚗' :
                      exp.category === 'Entertainment' ? '🎬' : exp.category === 'Shopping' ? '🛍️' :
                        exp.category === 'Health' ? '💊' : exp.category === 'Education' ? '📚' : '💳'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text)' }}>{exp.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>
                  ₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 0' }}>No transactions yet. <Link to="/expenses" style={{ color: 'var(--accent2)' }}>Add your first expense</Link></div>
        )}
      </div>
    </div>
  );
}
