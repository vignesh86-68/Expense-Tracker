import React, { useEffect, useState, useCallback } from 'react';
import { getBudgets, createBudget, deleteBudget } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Education', 'Other'];
const CAT_EMOJI = { Food: '🍔', Transport: '🚗', Entertainment: '🎬', Shopping: '🛍️', Health: '💊', Utilities: '💡', Education: '📚', Other: '💳' };
const CAT_COLOR = { Food: '#f59e0b', Transport: '#3b82f6', Entertainment: '#8b5cf6', Shopping: '#f472b6', Health: '#10b981', Utilities: '#64748b', Education: '#38bdf8', Other: '#6b7280' };

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card modal-box fade-in" style={{ width: '100%', maxWidth: 420, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Set Budget</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Food', limitAmount: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getBudgets(month, year).then(r => setBudgets(r.data)).catch(() => toast.error('Failed to load budgets')).finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await createBudget({ ...form, month, year, limitAmount: parseFloat(form.limitAmount) });
      toast.success('Budget saved'); setModalOpen(false); load();
    } catch { toast.error('Failed to save budget'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget?')) return;
    try { await deleteBudget(id); toast.success('Budget removed'); setBudgets(p => p.filter(b => b.id !== id)); }
    catch { toast.error('Failed to delete'); }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const totalBudget = budgets.reduce((s, b) => s + Number(b.limitAmount), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent || 0), 0);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="budget-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>Budgets</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: '0.85rem' }}>{months[month - 1]} {year}</p>
        </div>
        <div className="budget-header-controls" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-input" style={{ minWidth: 110, flex: '1 1 auto' }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 3)}</option>)}
          </select>
          <select className="form-input" style={{ minWidth: 80, flex: '0 0 auto' }} value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" style={{ flex: '1 1 auto', justifyContent: 'center' }} onClick={() => setModalOpen(true)}>
            <Plus size={15} /> Set Budget
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Total Budget', value: totalBudget, color: 'var(--accent)' },
            { label: 'Total Spent', value: totalSpent, color: totalSpent > totalBudget ? 'var(--red)' : 'var(--green)' },
            { label: 'Remaining', value: totalBudget - totalSpent, color: 'var(--purple)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(0.95rem, 3vw, 1.3rem)', fontWeight: 700, color: s.color }}>
                ₹{Math.abs(s.value).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                {s.value < 0 && <span style={{ fontSize: '0.65rem', marginLeft: 4, color: 'var(--red)' }}>over</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><div className="spinner" style={{ width: 30, height: 30 }} /></div>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>🎯</div>
          <div style={{ fontWeight: 500, marginBottom: 6, color: 'var(--text2)' }}>No budgets for this period</div>
          <div style={{ fontSize: '0.88rem', marginBottom: 18 }}>Set spending limits to track your categories</div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={14} /> Set first budget</button>
        </div>
      ) : (
        <div className="budget-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {budgets.map(b => {
            const pct = Math.min(Number(b.percentageUsed || 0), 100);
            const over = Number(b.spent || 0) > Number(b.limitAmount);
            const barColor = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : 'var(--green)';
            return (
              <div key={b.id} className="card" style={{ padding: 18, position: 'relative' }}>
                <button onClick={() => handleDelete(b.id)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                  <Trash2 size={13} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingRight: 24 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: (CAT_COLOR[b.category] || '#6b7280') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>
                    {CAT_EMOJI[b.category] || '💳'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{b.category}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>
                      ₹{Number(b.spent || 0).toLocaleString('en-IN')} of ₹{Number(b.limitAmount).toLocaleString('en-IN')}
                    </div>
                  </div>
                  {over && <AlertTriangle size={15} color="var(--red)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {!over && pct < 50 && <CheckCircle size={15} color="var(--green)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 6, height: 7, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 6, width: `${pct}%`, background: barColor, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
                  <span style={{ fontSize: '0.73rem', color: over ? 'var(--red)' : 'var(--text3)' }}>
                    {over ? `Over by ₹${(Number(b.spent) - Number(b.limitAmount)).toFixed(0)}` : `${pct.toFixed(0)}% used`}
                  </span>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>
                    ₹{Math.max(0, Number(b.limitAmount) - Number(b.spent || 0)).toLocaleString('en-IN')} left
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Budget Limit (₹)</label>
            <input className="form-input" type="number" placeholder="e.g. 5000" min="1" step="1"
              value={form.limitAmount} onChange={e => setForm({ ...form, limitAmount: e.target.value })} required />
          </div>
          <div className="modal-actions" style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              {saving ? <><div className="spinner" /> Saving...</> : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
