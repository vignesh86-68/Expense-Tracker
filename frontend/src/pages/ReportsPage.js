import React, { useEffect, useState } from 'react';
import { getExpenses } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const CAT_COLOR = { Food: '#f59e0b', Transport: '#3b82f6', Entertainment: '#8b5cf6', Shopping: '#f472b6', Health: '#10b981', Utilities: '#64748b', Education: '#38bdf8', Other: '#6b7280' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

export default function ReportsPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    getExpenses().then(r => setExpenses(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const filtered = expenses.filter(e => new Date(e.date).getFullYear() === year);

  const monthlyData = MONTHS.map((m, i) => ({
    name: m,
    amount: filtered.filter(e => new Date(e.date).getMonth() === i).reduce((s, e) => s + Number(e.amount), 0)
  }));

  const catMap = {};
  filtered.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount); });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const totalCat = catData.reduce((s, c) => s + c.value, 0);
  const topExpenses = [...filtered].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 7);
  const totalYear = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const activeMonths = monthlyData.filter(m => m.amount > 0).length;
  const avg = activeMonths > 0 ? totalYear / activeMonths : 0;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="spinner" style={{ width: 30, height: 30 }} /></div>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>Reports</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: '0.85rem' }}>Financial insights for {year}</p>
        </div>
        <select className="form-input" style={{ width: 100 }} value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        {[
          { label: 'Total Spent', val: `₹${totalYear.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, color: 'var(--accent)' },
          { label: 'Monthly Avg', val: `₹${avg.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, color: 'var(--purple)' },
          { label: 'Transactions', val: filtered.length, color: 'var(--green)' },
          { label: 'Categories', val: catData.length, color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1rem, 3.5vw, 1.35rem)', fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="card">
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 18 }}>Monthly Spending — {year}</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} barSize={22}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 10 }}
              tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} width={46} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="amount" fill="var(--accent)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="reports-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Category pie */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 14 }}>By Category</div>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                    {catData.map((entry, i) => <Cell key={i} fill={CAT_COLOR[entry.name] || '#6b7280'} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                {catData.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLOR[c.name] || '#6b7280', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text2)', fontSize: '0.8rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    <span style={{ color: 'var(--text)', fontSize: '0.78rem', fontWeight: 500, flexShrink: 0 }}>₹{c.value.toLocaleString('en-IN')}</span>
                    <span style={{ color: 'var(--text3)', fontSize: '0.72rem', flexShrink: 0, minWidth: 34, textAlign: 'right' }}>
                      {totalCat > 0 ? ((c.value / totalCat) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '36px 0', fontSize: '0.88rem' }}>No data for {year}</div>}
        </div>

        {/* Top expenses */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 14 }}>Biggest Expenses</div>
          {topExpenses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {topExpenses.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, textAlign: 'center', fontSize: '0.73rem', color: 'var(--text3)', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{e.category} · {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-head)', fontSize: '0.83rem', flexShrink: 0 }}>
                    ₹{Number(e.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '36px 0', fontSize: '0.88rem' }}>No data for {year}</div>}
        </div>
      </div>
    </div>
  );
}
