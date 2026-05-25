import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DronesPage from './components/DronesPage';
import UsersPage from './components/UsersPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('aerosig_token');
    const stored = localStorage.getItem('aerosig_user');
    if (token && stored) {
      try {
        setCurrentUser(JSON.parse(stored));
        setIsAuthenticated(true);
      } catch {
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = async (token) => {
    localStorage.setItem('aerosig_token', token);
    try {
      const res = await axios.get('http://localhost:8000/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('aerosig_user', JSON.stringify(res.data));
      setCurrentUser(res.data);
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('aerosig_token');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aerosig_token');
    localStorage.removeItem('aerosig_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const canAccess = (allowedRoles) =>
    currentUser && allowedRoles.includes(currentUser.role);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/"
          element={
            isAuthenticated
              ? <Layout onLogout={handleLogout} currentUser={currentUser} />
              : <Navigate to="/login" />
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />

          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="drones"
            element={<DronesPage />}
          />

          <Route
            path="usuarios"
            element={
              canAccess(['admin'])
                ? <UsersPage />
                : <Forbidden />
            }
          />

          <Route path="inventario"     element={<ComingSoon title="Inventario" />} />
          <Route path="misiones"       element={<ComingSoon title="Misiones" />} />
          <Route path="mantenimientos" element={<ComingSoon title="Mantenimientos" />} />
          <Route path="reportes"       element={<ComingSoon title="Reportes" />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

const ComingSoon = ({ title }) => (
  <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{title}</h2>
    <p>Módulo en desarrollo</p>
  </div>
);

const Forbidden = () => (
  <div className="forbidden">
    <h2>Acceso restringido</h2>
    <p>No tienes permisos para acceder a esta sección.</p>
  </div>
);

export default App;
