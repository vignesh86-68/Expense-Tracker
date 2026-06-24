import React, { useEffect, useState, useCallback } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Education', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'];
const CAT_EMOJI = { Food: '🍔', Transport: '🚗', Entertainment: '🎬', Shopping: '🛍️', Health: '💊', Utilities: '💡', Education: '📚', Other: '💳' };
const CAT_COLOR = { Food: '#f59e0b', Transport: '#3b82f6', Entertainment: '#8b5cf6', Shopping: '#f472b6', Health: '#10b981', Utilities: '#64748b', Education: '#38bdf8', Other: '#6b7280' };
const EMPTY_FORM = { title: '', description: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], paymentMethod: 'UPI' };

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card modal-box fade-in" style={{ width: '100%', maxWidth: 480, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const load = useCallback(() => {
    setLoading(true);
    getExpenses({ month: filterMonth, year: filterYear })
      .then(r => setExpenses(r.data))
      .catch(() => toast.error('Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [filterMonth, filterYear]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setModalOpen(true); };
  const openEdit = (exp) => {
    setForm({ title: exp.title, description: exp.description || '', amount: exp.amount, category: exp.category, date: exp.date, paymentMethod: exp.paymentMethod || 'UPI' });
    setEditingId(exp.id); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) { await updateExpense(editingId, form); toast.success('Expense updated'); }
      else { await createExpense(form); toast.success('Expense added'); }
      setModalOpen(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await deleteExpense(id); toast.success('Deleted'); setExpenses(p => p.filter(e => e.id !== id)); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || e.category === filterCategory;
    return matchSearch && matchCat;
  });
  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>Expenses</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: '0.82rem' }}>
            {filtered.length} entries · <strong style={{ color: 'var(--text)' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Expense</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="filter-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 0 }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input className="form-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <select className="form-input" style={{ flex: '1 1 130px', minWidth: 0 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-input" style={{ flex: '1 1 90px', minWidth: 0 }} value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-input" style={{ flex: '0 1 90px', minWidth: 0 }} value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>💸</div>
            <div style={{ marginBottom: 14 }}>No expenses found</div>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add expense</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Description', 'Category', 'Date', 'Method', 'Amount', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Amount' ? 'right' : 'left', fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp, i) => (
                  <tr key={exp.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: (CAT_COLOR[exp.category] || '#6b7280') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
                          {CAT_EMOJI[exp.category] || '💳'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>{exp.title}</div>
                          {exp.description && <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{exp.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: (CAT_COLOR[exp.category] || '#6b7280') + '22', color: CAT_COLOR[exp.category] || 'var(--text2)', whiteSpace: 'nowrap' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text3)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{exp.paymentMethod || '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--text)', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(exp)} style={{ background: 'var(--accent-dim)', border: 'none', color: 'var(--accent2)', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'flex' }} title="Edit"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(exp.id)} style={{ background: 'var(--red-dim)', border: 'none', color: 'var(--red)', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'flex' }} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="e.g. Lunch at Café" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input className="form-input" type="number" placeholder="0.00" step="0.01" min="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment</label>
              <select className="form-input" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input className="form-input" placeholder="Additional notes..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="modal-actions" style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              {saving ? <><div className="spinner" /> Saving...</> : editingId ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
