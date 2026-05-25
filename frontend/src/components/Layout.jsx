import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Package, Plane, Map, Wrench,
  BarChart2, Users, LogOut, Search, Bell, ChevronDown,
  Globe, UserCog, KeyRound, X
} from 'lucide-react';
import axios from 'axios';

const ROLE_NAV = {
  admin:      ['dashboard', 'inventario', 'drones', 'misiones', 'mantenimientos', 'reportes', 'usuarios'],
  pilot:      ['dashboard', 'drones', 'misiones'],
  analyst:    ['dashboard', 'inventario', 'drones', 'reportes'],
  technician: ['dashboard', 'drones', 'mantenimientos'],
};

const ALL_NAV = [
  { key: 'dashboard',      to: '/dashboard',      icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
  { key: 'inventario',     to: '/inventario',     icon: <Package size={17} />,         label: 'Inventario' },
  { key: 'drones',         to: '/drones',         icon: <Plane size={17} />,           label: 'Drones' },
  { key: 'misiones',       to: '/misiones',       icon: <Map size={17} />,             label: 'Misiones' },
  { key: 'mantenimientos', to: '/mantenimientos', icon: <Wrench size={17} />,          label: 'Mantenimientos' },
  { key: 'reportes',       to: '/reportes',       icon: <BarChart2 size={17} />,       label: 'Reportes' },
  { key: 'usuarios',       to: '/usuarios',       icon: <Users size={17} />,           label: 'Usuarios' },
];

const ROLE_LABELS = {
  admin:      'Administrador',
  pilot:      'Piloto',
  analyst:    'Analista',
  technician: 'Técnico',
};

const ROLE_BADGE_CLASS = {
  admin:      'role-badge role-admin',
  pilot:      'role-badge role-pilot',
  analyst:    'role-badge role-analyst',
  technician: 'role-badge role-technician',
};

const Layout = ({ onLogout, currentUser }) => {
  const navigate = useNavigate();
  const role = currentUser?.role || 'pilot';
  const allowedKeys = ROLE_NAV[role] || ['dashboard'];
  const navItems = ALL_NAV.filter(item => allowedKeys.includes(item.key));

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editModal, setEditModal]       = useState(false);
  const [editForm, setEditForm]         = useState({ full_name: '', password: '', confirm: '' });
  const [saving, setSaving]             = useState(false);
  const [editError, setEditError]       = useState('');
  const dropdownRef = useRef(null);

  // Cerrar dropdown al click afuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { setDropdownOpen(false); onLogout(); navigate('/login'); };

  const openEdit = () => {
    setEditForm({ full_name: currentUser?.full_name || '', password: '', confirm: '' });
    setEditError('');
    setDropdownOpen(false);
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editForm.password && editForm.password !== editForm.confirm) {
      setEditError('Las contraseñas no coinciden');
      return;
    }
    setSaving(true);
    setEditError('');
    const token = localStorage.getItem('aerosig_token');
    const payload = { full_name: editForm.full_name };
    if (editForm.password) payload.password = editForm.password;

    try {
      await axios.put(`http://localhost:8000/api/users/${currentUser.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Actualizar localStorage
      const updated = { ...currentUser, full_name: editForm.full_name };
      localStorage.setItem('aerosig_user', JSON.stringify(updated));
      setEditModal(false);
      // Forzar recarga para reflejar cambios
      window.location.reload();
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const initials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (currentUser?.username?.[0] || 'U').toUpperCase();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Globe size={22} style={{ color: '#34d399', flexShrink: 0 }} />
          <span>AeroSIG</span>
        </div>

        <ul className="nav-menu">
          {navItems.map(item => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button className="nav-link logout" onClick={handleLogout}>
          <LogOut size={17} />
          Cerrar Sesión
        </button>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <Search size={15} color="var(--text-muted)" />
            <input type="text" placeholder="Buscar..." />
          </div>

          {/* Perfil con dropdown */}
          <div className="user-profile" ref={dropdownRef} style={{ position: 'relative' }}>
            <Bell size={17} color="var(--text-muted)" />

            <button
              className="profile-trigger"
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '5px 8px', borderRadius: 8,
                transition: 'background 0.2s',
                color: '#e2e8f0',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div className="user-info">
                <div className="user-name">{currentUser?.full_name || currentUser?.username}</div>
                <div className="user-role">{ROLE_LABELS[role] || role}</div>
              </div>
              <div className="avatar">{initials}</div>
              <ChevronDown
                size={13}
                color="var(--text-muted)"
                style={{
                  transition: 'transform 0.2s',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#111a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                minWidth: 220,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                zIndex: 200,
                animation: 'slideUp 0.15s ease',
                overflow: 'hidden',
              }}>
                {/* Cabecera del dropdown */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                    {currentUser?.full_name || currentUser?.username}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    @{currentUser?.username}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={ROLE_BADGE_CLASS[role] || 'role-badge role-pilot'}>
                      {ROLE_LABELS[role]}
                    </span>
                  </div>
                </div>

                {/* Opciones */}
                <div style={{ padding: '6px 0' }}>
                  <button
                    onClick={openEdit}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 16px',
                      background: 'none', border: 'none',
                      color: 'var(--text)', fontSize: '0.9rem',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <UserCog size={16} color="var(--text-muted)" />
                    Editar perfil
                  </button>

                  <button
                    onClick={openEdit}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 16px',
                      background: 'none', border: 'none',
                      color: 'var(--text)', fontSize: '0.9rem',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <KeyRound size={16} color="var(--text-muted)" />
                    Cambiar contraseña
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '6px 0' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 16px',
                      background: 'none', border: 'none',
                      color: '#f87171', fontSize: '0.9rem',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="page-content">
          <Outlet context={{ currentUser, onLogout }} />
        </div>
      </div>

      {/* Modal editar perfil */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Editar Perfil</h3>
              <button className="close-btn" onClick={() => setEditModal(false)}><X size={18} /></button>
            </div>

            {/* Resumen del usuario */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 20
            }}>
              <div className="avatar" style={{ width: 46, height: 46, fontSize: '1rem' }}>{initials}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{currentUser?.full_name || currentUser?.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  @{currentUser?.username}
                </div>
                <div style={{ marginTop: 5 }}>
                  <span className={ROLE_BADGE_CLASS[role] || 'role-badge role-pilot'}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>
              </div>
            </div>

            {editError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', color: '#f87171',
                padding: '10px 13px', borderRadius: 8, marginBottom: 14,
                fontSize: '0.87rem', border: '1px solid rgba(239,68,68,0.2)'
              }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  className="form-input"
                  placeholder="Tu nombre completo"
                  value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 4 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Dejar en blanco para mantener la contraseña actual
                </p>
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password" className="form-input"
                  placeholder="••••••••"
                  value={editForm.password}
                  onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password" className="form-input"
                  placeholder="••••••••"
                  value={editForm.confirm}
                  onChange={e => setEditForm(f => ({ ...f, confirm: e.target.value }))}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
