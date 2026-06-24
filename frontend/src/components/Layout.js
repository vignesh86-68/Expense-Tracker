import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Receipt, PiggyBank, BarChart3,
  LogOut, Menu, X, TrendingUp
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 50,
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        // On mobile: hide offscreen by default, slide in when open
        transform: window.innerWidth < 768
          ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)')
          : 'translateX(0)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <TrendingUp size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>
                ExpenseIQ
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Finance Tracker</div>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: 'var(--text3)', cursor: 'pointer', padding: 4,
                display: window.innerWidth < 768 ? 'flex' : 'none'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10,
              fontWeight: isActive ? 600 : 400, fontSize: '0.9rem',
              color: isActive ? 'var(--accent2)' : 'var(--text2)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, background: 'var(--bg3)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem',
              color: '#fff', flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{
              background: 'none', border: 'none', color: 'var(--text3)',
              cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', flexShrink: 0,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{
        flex: 1,
        // On desktop push content right of sidebar
        marginLeft: 'clamp(0px, 240px, 240px)',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
        className="main-content-area"
      >
        {/* ── Mobile top bar ── */}
        <header style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 30,
        }} className="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <Menu size={22} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TrendingUp size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>ExpenseIQ</span>
          </div>

          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', color: '#fff'
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>

        {/* ── Page content ── */}
        <main style={{ flex: 1, padding: 'clamp(16px, 4vw, 32px)', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 767px) {
          .mobile-topbar {
            display: flex !important;
          }
          .main-content-area {
            margin-left: 0 !important;
          }
        }
        @media (min-width: 768px) {
          aside {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}
