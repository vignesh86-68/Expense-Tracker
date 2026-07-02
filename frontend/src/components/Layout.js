import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Receipt, PiggyBank, BarChart3,
  LogOut, Menu, X, TrendingUp, User, ChevronDown
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setSidebarOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.72)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="sidebar" style={{
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
      }}>
        {/* Logo + close btn */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <TrendingUp size={17} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>ExpenseIQ</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Finance Tracker</div>
          </div>
          {/* Close button - mobile only */}
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10,
              fontWeight: isActive ? 600 : 400, fontSize: '0.88rem',
              color: isActive ? 'var(--accent2)' : 'var(--text2)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section - desktop sidebar */}
        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg3)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{
              background: 'none', border: 'none', color: 'var(--text3)',
              cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', flexShrink: 0,
              transition: 'color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="main-content-area" style={{ flex: 1, marginLeft: 240, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* ── Mobile top bar ── */}
        <header className="mobile-topbar" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: 58,
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 30,
          gap: 12,
        }}>
          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(true)} style={{
            background: 'none', border: 'none', color: 'var(--text)',
            cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8,
            flexShrink: 0,
          }}>
            <Menu size={22} />
          </button>

          {/* Logo center */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <TrendingUp size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>ExpenseIQ</span>
          </div>

          {/* ── Clickable Avatar with Dropdown ── */}
          <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                border: dropdownOpen ? '2px solid var(--accent2)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem',
                color: '#fff', cursor: 'pointer',
                transition: 'border 0.2s',
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 44, right: 0,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease',
              }}>
                {/* User info */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0
                    }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'none', border: 'none',
                    color: 'var(--red)', cursor: 'pointer',
                    fontSize: '0.88rem', fontWeight: 500,
                    fontFamily: 'var(--font-body)',
                    transition: 'background 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── Page content ── */}
        <main style={{ flex: 1, padding: 'clamp(16px, 4vw, 32px)', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>

      {/* ── CSS ── */}
      <style>{`
        @media (max-width: 767px) {
          .mobile-topbar { display: flex !important; }
          .main-content-area { margin-left: 0 !important; }
          .sidebar { transform: translateX(-100%); }
          .sidebar-close-btn { display: flex !important; }
        }
        .sidebar {
          transform: translateX(${typeof window !== 'undefined' && window.innerWidth < 768 && !sidebarOpen ? '-100%' : '0'});
        }
        @media (min-width: 768px) {
          .sidebar { transform: translateX(0) !important; }
        }
      `}</style>

      {/* Dynamic sidebar transform for mobile */}
      <style>{`
        @media (max-width: 767px) {
          .sidebar {
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
        }
      `}</style>
    </div>
  );
}
