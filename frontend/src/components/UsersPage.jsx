import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Plus, Pencil, Trash2, Users, ShieldCheck, Plane, BarChart2, Wrench, X } from 'lucide-react';

const API = 'http://localhost:8000/api/users';

const ROLES = [
  { value: 'admin',      label: 'Administrador',          badge: 'role-badge role-admin' },
  { value: 'pilot',      label: 'Piloto',                 badge: 'role-badge role-pilot' },
  { value: 'analyst',    label: 'Analista de Inventario', badge: 'role-badge role-analyst' },
  { value: 'technician', label: 'Técnico en Mantenimiento', badge: 'role-badge role-technician' },
];

const getRoleBadge = (role) => ROLES.find(r => r.value === role) || { label: role, badge: 'role-badge role-pilot' };

const ROLE_ICONS = {
  admin:      <ShieldCheck size={16} />,
  pilot:      <Plane size={16} />,
  analyst:    <BarChart2 size={16} />,
  technician: <Wrench size={16} />,
};

const emptyForm = { username: '', full_name: '', password: '', role: 'pilot', is_active: true };

const UsersPage = () => {
  const [users, setUsers]         = useState([]);
  const [isModalOpen, setModal]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const { currentUser, onLogout } = useOutletContext();
  const token = localStorage.getItem('aerosig_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = () =>
    axios.get(API, { headers })
      .then(res => setUsers(res.data))
      .catch(err => { if (err.response?.status === 401) onLogout(); });

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit   = (u) => {
    setEditing(u);
    setForm({ username: u.username, full_name: u.full_name || '', password: '', role: u.role, is_active: u.is_active });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    if (editing && !payload.password) delete payload.password;

    try {
      if (editing) {
        await axios.put(`${API}/${editing.id}`, payload, { headers });
      } else {
        await axios.post(API, payload, { headers });
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar');
    }
  };

  const countByRole = (role) => users.filter(u => u.role === role).length;

  return (
    <>
      <div className="page-header">
        <h2>Gestión de Usuarios</h2>
        <p className="breadcrumb">Inicio / Usuarios</p>
      </div>

      {/* Stats */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><Users size={22} /></div>
          <div className="kpi-info"><h2>{users.length}</h2><span>Usuarios totales</span></div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon"><ShieldCheck size={22} /></div>
          <div className="kpi-info"><h2>{countByRole('admin')}</h2><span>Administradores</span></div>
        </div>
        <div className="kpi-card teal">
          <div className="kpi-icon"><Plane size={22} /></div>
          <div className="kpi-info"><h2>{countByRole('pilot')}</h2><span>Pilotos</span></div>
        </div>
        <div className="kpi-card grey">
          <div className="kpi-icon"><Wrench size={22} /></div>
          <div className="kpi-info"><h2>{countByRole('technician') + countByRole('analyst')}</h2><span>Técnicos / Analistas</span></div>
        </div>
      </div>

      {/* Tabla */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Listado de Usuarios</h3>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Registrar Usuario
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Permisos</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleInfo = getRoleBadge(u.role);
                return (
                  <tr key={u.id}>
                    <td><span className="drone-id">#{u.id}</span></td>
                    <td className="font-medium">{u.full_name || <span className="text-muted">—</span>}</td>
                    <td>
                      <code style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {u.username}
                      </code>
                    </td>
                    <td>
                      <span className={roleInfo.badge}>
                        {ROLE_ICONS[u.role]}
                        {roleInfo.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {PERMISSION_SUMMARY[u.role]}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                        <span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`} />
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn-icon edit"
                          onClick={() => openEdit(u)}
                          title="Editar"
                          disabled={u.id === currentUser?.id && false}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(u.id)}
                          title="Eliminar"
                          disabled={u.id === currentUser?.id}
                          style={{ opacity: u.id === currentUser?.id ? 0.3 : 1 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">No hay usuarios registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda de roles */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: 16 }}>Descripción de Roles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {ROLE_DESCRIPTIONS.map(r => (
            <div key={r.role} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className={getRoleBadge(r.role).badge}>
                  {ROLE_ICONS[r.role]}
                  {getRoleBadge(r.role).label}
                </span>
              </div>
              <ul style={{ paddingLeft: 16, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                {r.perms.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
              <button className="close-btn" onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input name="full_name" className="form-input"
                    placeholder="Ej: Jorge Mendez" value={form.full_name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Usuario *</label>
                  <input name="username" className="form-input" required
                    placeholder="Ej: jmendez" value={form.username} onChange={handleChange}
                    disabled={!!editing} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{editing ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}</label>
                  <input name="password" type="password" className="form-input"
                    placeholder="••••••••" value={form.password} onChange={handleChange}
                    required={!editing} />
                </div>
                <div className="form-group">
                  <label>Rol *</label>
                  <select name="role" className="form-input" value={form.role} onChange={handleChange}
                    disabled={editing?.id === currentUser?.id}>
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editing && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <label className="toggle">
                      <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                      <span className="toggle-slider" />
                    </label>
                    <span>Usuario activo</span>
                  </label>
                </div>
              )}

              {/* Vista previa de permisos */}
              <div style={{
                background: 'rgba(14,165,233,0.06)',
                border: '1px solid rgba(14,165,233,0.15)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 4,
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                  Permisos del rol: {getRoleBadge(form.role).label}
                </strong>
                {PERMISSION_SUMMARY[form.role]}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : (editing ? 'Guardar Cambios' : 'Registrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const PERMISSION_SUMMARY = {
  admin:      'Acceso total al sistema',
  pilot:      'Dashboard, Drones (solo lectura), Misiones',
  analyst:    'Dashboard, Drones (solo lectura), Inventario, Reportes',
  technician: 'Dashboard, Drones (edición), Mantenimientos',
};

const ROLE_DESCRIPTIONS = [
  {
    role: 'admin',
    perms: ['Gestión de usuarios', 'Gestión de drones (CRUD)', 'Acceso a todos los módulos', 'Configuración del sistema'],
  },
  {
    role: 'pilot',
    perms: ['Ver inventario de drones', 'Registrar misiones de vuelo', 'Ver historial de vuelos'],
  },
  {
    role: 'analyst',
    perms: ['Gestión de inventario', 'Generación de reportes', 'Análisis de datos operativos'],
  },
  {
    role: 'technician',
    perms: ['Registrar mantenimientos', 'Actualizar estado de drones', 'Ver historial técnico'],
  },
];

export default UsersPage;
