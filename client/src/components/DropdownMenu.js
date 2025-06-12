import React, { useState, useEffect, useRef } from 'react';
import '../styles/DropdownMenu.css'; // Asegúrate de crear este archivo y agregar los estilos que se mencionan a continuación
import logo from '../utils/Logo-Trece.png'; // Ajusta la ruta según corresponda

const DropdownMenu = ({ onLogout, user }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-menu" ref={menuRef}>
      <button className="menu-button" onClick={handleToggle}>
        <i className="fas fa-user"></i> {/* Icono de usuario */}
      </button>
      {open && (
        <div className="menu-content">
          <div className="user-info">
            <img src={logo} alt="User" className="user-logo" />
            <span className="user-name">{user.firstName} {user.lastName}</span>
          </div>
          <button className="logout-button" onClick={onLogout}>Cerrar Sesión</button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
