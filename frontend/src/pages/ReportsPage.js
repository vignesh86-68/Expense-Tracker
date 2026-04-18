import React, { useEffect, useState } from 'react';
import { getExpenses } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const CAT_COLOR = { Food: '#f59e0b', Transport: '#3b82f6', Entertainment: '#8b5cf6', Shopping: '#f472b6', Health: '#10b981', Utilities: '#64748b', Education: '#38bdf8', Other: '#6b7280' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ color: 'var(--text2)', fontSize: '0.8rem', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color || 'var(--accent2)', fontWeight: 600, fontSize: '0.9rem' }}>
            ₹{Number(p.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        ))}
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
    getExpenses()
      .then(r => setExpenses(r.data))
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = expenses.filter(e => new Date(e.date).getFullYear() === year);

  // Monthly totals
  const monthlyData = MONTHS.map((m, i) => {
    const monthExpenses = filtered.filter(e => new Date(e.date).getMonth() === i);
    return { name: m, amount: monthExpenses.reduce((s, e) => s + Number(e.amount), 0) };
  });

  // Category breakdown
  const catMap = {};
  filtered.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount); });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const totalCat = catData.reduce((s, c) => s + c.value, 0);

  // Top expenses
  const topExpenses = [...filtered].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 8);

  // Monthly average
  const activeMonths = monthlyData.filter(m => m.amount > 0).length;
  const avg = activeMonths > 0 ? filtered.reduce((s, e) => s + Number(e.amount), 0) / activeMonths : 0;

  const totalYear = filtered.reduce((s, e) => s + Number(e.amount), 0);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>Reports</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: '0.9rem' }}>Financial insights for {year}</p>
        </div>
        <select className="form-input" style={{ width: 110 }} value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Spent', value: totalYear, color: 'var(--accent)' },
          { label: 'Monthly Avg', value: avg, color: 'var(--purple)' },
          { label: 'Transactions', value: null, num: filtered.length, color: 'var(--green)' },
          { label: 'Categories', value: null, num: catData.length, color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 700, color: s.color }}>
              {s.value !== null ? `₹${Number(s.value).toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : s.num}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="card">
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 24 }}>Monthly Spending — {year}</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barSize={28}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 11 }}
              tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="amount" fill="var(--accent)" radius={[6, 6, 0, 0]}
              style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.3))' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown + top expenses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Category pie */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 20 }}>Category Breakdown</div>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {catData.map((entry, i) => <Cell key={i} fill={CAT_COLOR[entry.name] || '#6b7280'} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {catData.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLOR[c.name] || '#6b7280', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text2)', fontSize: '0.85rem' }}>{c.name}</span>
                    <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>₹{c.value.toLocaleString('en-IN')}</span>
                    <span style={{ color: 'var(--text3)', fontSize: '0.75rem', minWidth: 38, textAlign: 'right' }}>
                      {totalCat > 0 ? ((c.value / totalCat) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '40px 0' }}>No data for {year}</div>}
        </div>

        {/* Top expenses */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 20 }}>Biggest Expenses</div>
          {topExpenses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topExpenses.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, textAlign: 'center', fontSize: '0.78rem', color: 'var(--text3)', fontWeight: 600 }}>#{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{e.category} · {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-head)', fontSize: '0.9rem', flexShrink: 0 }}>
                    ₹{Number(e.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '40px 0' }}>No data for {year}</div>}
        </div>
      </div>
    </div>
  );
}
