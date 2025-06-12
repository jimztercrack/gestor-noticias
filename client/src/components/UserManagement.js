import React, { useState, useEffect } from 'react';
import axios from 'axios';
import switch_url from '../switch';
import '../styles/usermanagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'editor',
  });

  useEffect(() => {
    document.title = 'Administrador de Usuarios - Trece Noticias'; // Cambiar el título de la pestaña
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${switch_url}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data)) {
        const sortedUsers = response.data
          .map(user => ({
            ...user,
            fullName: `${user.firstName} ${user.lastName}`
          }))
          .sort((a, b) => a.fullName.localeCompare(b.fullName));
        setUsers(sortedUsers);
      } else {
        console.error('Expected an array but got', response.data);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    }
  };

  const handleRoleChange = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${switch_url}/api/users/${selectedUser._id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
      alert('Role updated successfully');
      setSelectedUser(null); // Close modal
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handlePasswordReset = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${switch_url}/api/users/${selectedUser._id}/reset-password`, { password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password reset successfully');
      setSelectedUser(null); // Close modal
    } catch (err) {
      console.error('Error resetting password:', err);
    }
  };

  const handleDeleteUser = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${switch_url}/api/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
      alert('User deleted successfully');
      setSelectedUser(null); // Close modal
      setShowDeleteConfirm(false); // Close confirmation
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleCreateUser = async () => {
    const { username, password, firstName, lastName, role } = newUser;

    if (username && password && firstName && lastName && role) {
      const token = localStorage.getItem('token');
      try {
        await axios.post(`${switch_url}/api/auth/register`, {
          username, password, firstName, lastName, role
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        loadUsers();
        alert('User created successfully');
        setShowCreateUserModal(false); // Close modal
        setNewUser({
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'editor',
        });
      } catch (err) {
        console.error('Error creating user:', err);
      }
    }
  };

  const mapRole = (role) => {
    return role === 'admin' ? 'Administrador' : 'Editor';
  };

  return (
    <div>
      <h2>Administrador de Usuarios - Trece Noticias</h2>
      <button onClick={() => setShowCreateUserModal(true)}>Crear Nuevo Usuario</button>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Nombre de Usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user._id} onDoubleClick={() => setSelectedUser(user)}>
                <td>{user.fullName}</td>
                <td>{user.username}</td>
                <td>{mapRole(user.role)}</td>
                <td>
                  <button onClick={() => setSelectedUser(user)}>Gestionar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Gestionar {selectedUser.fullName}</h3>
              <button onClick={() => setSelectedUser(null)}>Cerrar</button>
            </div>
            <div className="modal-body">
            <select onChange={(e) => setNewRole(e.target.value)} value={newRole}>
  <option value="editor">Editor</option>
  <option value="admin">Administrador</option>
</select>
              <button onClick={handleRoleChange}>Actualizar Rol</button>
              <input
                type="password"
                placeholder="New Password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={handlePasswordReset}>Restablecer Contraseña</button>
              <button onClick={() => setShowDeleteConfirm(true)}>Eliminar Usuario</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button onClick={() => setShowDeleteConfirm(false)}>Cerrar</button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar a {selectedUser.fullName}?</p>
              <button onClick={handleDeleteUser}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showCreateUserModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Crear Nuevo Usuario</h3>
              <button onClick={() => setShowCreateUserModal(false)}>Cerrar</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Nombre de Usuario"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <input
                type="text"
                placeholder="Nombre"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Apellido"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
              <select onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} value={newUser.role}>
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </select>
              <button onClick={handleCreateUser}>Crear Usuario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
