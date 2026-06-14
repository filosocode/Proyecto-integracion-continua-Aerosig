import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, Plane, AlertTriangle, Wrench, X } from 'lucide-react';

const API = 'http://localhost:8000/api/drones';

const getBadgeClass = (status) => {
  if (status === 'Activo') return 'badge badge-active';
  if (status === 'En Mantenimiento') return 'badge badge-maintenance';
  return 'badge badge-inactive';
};

const formatDroneId = (id) => `DR-${String(id).padStart(3, '0')}`;

const emptyForm = {
  name: '', model: '', serial_number: '', status: 'Activo',
  pilot: '', flight_hours: '', last_maintenance: ''
};

const DronesPage = () => {
  const [drones, setDrones]         = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch]         = useState('');
  const [saving, setSaving]         = useState(false);
  const { onLogout, currentUser } = useOutletContext();
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'technician';
  const token = localStorage.getItem('aerosig_token');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchDrones = () =>
    axios.get(API, { headers })
      .then(res => setDrones(res.data))
      .catch(err => { if (err.response?.status === 401) onLogout(); });

  useEffect(() => { fetchDrones(); }, []);

  const filtered = useMemo(() => {
    let result = drones;
    if (filterStatus) result = result.filter(d => d.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        d.serial_number.toLowerCase().includes(q) ||
        (d.pilot || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [drones, filterStatus, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (drone) => {
    setEditing(drone);
    setForm({
      name: drone.name,
      model: drone.model,
      serial_number: drone.serial_number,
      status: drone.status,
      pilot: drone.pilot || '',
      flight_hours: drone.flight_hours ?? '',
      last_maintenance: drone.last_maintenance || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditing(null); };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      flight_hours: form.flight_hours === '' ? 0 : parseFloat(form.flight_hours),
      pilot: form.pilot || null,
      last_maintenance: form.last_maintenance || null,
    };
    try {
      if (editing) {
        await axios.put(`${API}/${editing.id}`, payload, { headers });
      } else {
        await axios.post(API, payload, { headers });
      }
      closeModal();
      fetchDrones();
    } catch {
      alert('Error al guardar. Verifica que el número de serie no esté duplicado.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este dron?')) return;
    await axios.delete(`${API}/${id}`, { headers });
    fetchDrones();
  };

  const activeCount = drones.filter(d => d.status === 'Activo').length;
  const maintCount  = drones.filter(d => d.status === 'En Mantenimiento').length;
  const inopCount   = drones.filter(d => d.status === 'Fuera de Servicio').length;

  return (
    <>
      <div className="page-header">
        <h2>Gestión de Drones</h2>
        <p className="breadcrumb">Inicio / Drones</p>
      </div>

      {/* Stats */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><Plane size={22} /></div>
          <div className="kpi-info"><h2>{drones.length}</h2><span>Drones en total</span></div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon"><Plane size={22} /></div>
          <div className="kpi-info"><h2>{activeCount}</h2><span>Operativos</span></div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon"><AlertTriangle size={22} /></div>
          <div className="kpi-info"><h2>{inopCount}</h2><span>Inoperativos</span></div>
        </div>
        <div className="kpi-card teal">
          <div className="kpi-icon"><Wrench size={22} /></div>
          <div className="kpi-info"><h2>{maintCount}</h2><span>En Mantenimiento</span></div>
        </div>
      </div>

      {/* Table section */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Listado de Drones</h3>
          {canEdit && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> Agregar Dron
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filters">
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Estado: Todos</option>
            <option value="Activo">Activo</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
            <option value="Fuera de Servicio">Fuera de Servicio</option>
          </select>

          <div className="filter-search">
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar dron..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Modelo</th>
                <th>Piloto Asignado</th>
                <th>Estado</th>
                <th>Horas de Vuelo</th>
                <th>Último Mantenimiento</th>
                <th>N° Serie</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(drone => (
                <tr key={drone.id}>
                  <td><span className="drone-id">{formatDroneId(drone.id)}</span></td>
                  <td className="font-medium">{drone.name}</td>
                  <td>{drone.model}</td>
                  <td>{drone.pilot || <span className="text-muted">—</span>}</td>
                  <td><span className={getBadgeClass(drone.status)}>{drone.status}</span></td>
                  <td>{drone.flight_hours != null ? `${drone.flight_hours}h` : '0h'}</td>
                  <td>{drone.last_maintenance || <span className="text-muted">—</span>}</td>
                  <td><code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{drone.serial_number}</code></td>
                  <td>
                    <div className="flex justify-center gap-2">
                      {canEdit ? (
                        <>
                          <button className="btn-icon edit" onClick={() => openEdit(drone)} title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDelete(drone.id)} title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solo lectura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    {drones.length === 0 ? 'No hay drones registrados' : 'No hay resultados para los filtros aplicados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Editar Dron' : 'Registrar Nuevo Dron'}</h3>
              <button className="close-btn" onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Dron *</label>
                  <input name="name" className="form-input" required
                    placeholder="Ej: Inspector 01" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Modelo *</label>
                  <input name="model" className="form-input" required
                    placeholder="Ej: DJI Matrice 300" value={form.model} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Número de Serie *</label>
                  <input name="serial_number" className="form-input" required
                    placeholder="SN-XXXX-XXXX" value={form.serial_number} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Estado Operativo</label>
                  <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                    <option value="Activo">Activo</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                    <option value="Fuera de Servicio">Fuera de Servicio</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Piloto Asignado</label>
                <input name="pilot" className="form-input"
                  placeholder="Nombre del piloto" value={form.pilot} onChange={handleChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Horas de Vuelo</label>
                  <input name="flight_hours" type="number" step="0.1" min="0" className="form-input"
                    placeholder="0.0" value={form.flight_hours} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Último Mantenimiento</label>
                  <input name="last_maintenance" type="date" className="form-input"
                    value={form.last_maintenance} onChange={handleChange} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : (editing ? 'Guardar Cambios' : 'Registrar Dron')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DronesPage;
