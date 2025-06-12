import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './index.css';
import switch_url from './switch';
import ConnectivityAlert from './utils/ConnectivityAlert';
import { io } from 'socket.io-client';

const Login = React.lazy(() => import('./Login'));
const Register = React.lazy(() => import('./Register'));
const MainPage = React.lazy(() => import('./pages/MainPage'));
const MainPageEditor = React.lazy(() => import('./pages/MainPageEditor'));
const UserManagement = React.lazy(() => import('./components/UserManagement'));

const theme = createTheme();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configuración del cliente de Socket.IO
  const socket = io(switch_url);  // Asegúrate de que esta URL coincide con la configuración del servidor

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${switch_url}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setUser(response.data.user);
        setLoading(false);
        console.log(`User ID: ${response.data.user._id}`); // Imprime el ID del usuario en la consola
      }).catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token, user) => {
    setUser(user);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <ConnectivityAlert />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route path="/" element={
                user ? (
                  user.role === 'admin' ? (
                    <MainPage onLogout={handleLogout} user={user} socket={socket} />
                  ) : user.role === 'editor' ? (
                    <MainPageEditor onLogout={handleLogout} user={user} socket={socket} />
                  ) : (
                    <Navigate to="/login" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              } />
              <Route path="/user-management" element={user && user.role === 'admin' ? <UserManagement /> : <Navigate to="/login" />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
