import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Plane, Package, AlertTriangle, Wrench, ArrowRight } from 'lucide-react';

const getBadgeClass = (status) => {
  if (status === 'Activo') return 'badge badge-active';
  if (status === 'En Mantenimiento') return 'badge badge-maintenance';
  return 'badge badge-inactive';
};

const formatDroneId = (id) => `DR-${String(id).padStart(3, '0')}`;

const Dashboard = () => {
  const [drones, setDrones] = useState([]);
  const navigate = useNavigate();
  const { onLogout } = useOutletContext();
  const token = localStorage.getItem('aerosig_token');

  useEffect(() => {
    axios.get('http://localhost:8000/api/drones', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setDrones(res.data))
      .catch(err => { if (err.response?.status === 401) onLogout(); });
  }, []);

  const active  = drones.filter(d => d.status === 'Activo').length;
  const maint   = drones.filter(d => d.status === 'En Mantenimiento').length;
  const inop    = drones.filter(d => d.status === 'Fuera de Servicio').length;
  const total   = drones.length;

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="breadcrumb">Inicio / Dashboard</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><Plane size={22} /></div>
          <div className="kpi-info">
            <h2>{active}</h2>
            <span>Drones Activos</span>
          </div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon"><Package size={22} /></div>
          <div className="kpi-info">
            <h2>{total}</h2>
            <span>Total en Flota</span>
          </div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon"><AlertTriangle size={22} /></div>
          <div className="kpi-info">
            <h2>{inop}</h2>
            <span>Fuera de Servicio</span>
          </div>
        </div>
        <div className="kpi-card teal">
          <div className="kpi-icon"><Wrench size={22} /></div>
          <div className="kpi-info">
            <h2>{maint}</h2>
            <span>En Mantenimiento</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Flota de Drones</h3>
          <button className="btn btn-primary" onClick={() => navigate('/drones')}>
            <ArrowRight size={15} />
            Ver gestión completa
          </button>
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
                <th>Último Mant.</th>
              </tr>
            </thead>
            <tbody>
              {drones.slice(0, 6).map(drone => (
                <tr key={drone.id}>
                  <td><span className="drone-id">{formatDroneId(drone.id)}</span></td>
                  <td className="font-medium">{drone.name}</td>
                  <td>{drone.model}</td>
                  <td>{drone.pilot || <span className="text-muted">—</span>}</td>
                  <td><span className={getBadgeClass(drone.status)}>{drone.status}</span></td>
                  <td>{drone.flight_hours ? `${drone.flight_hours}h` : '0h'}</td>
                  <td>{drone.last_maintenance || <span className="text-muted">—</span>}</td>
                </tr>
              ))}
              {drones.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">No hay drones registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
