// middlewares/getAllUsers.js
const User = require('../models/User');

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find(); // Busca todos los usuarios
    if (!users || users.length === 0) return res.status(404).json({ message: 'No se encontraron usuarios' });
    res.users = users; // Adjunta la lista de usuarios al objeto res
    next(); // Pasa el control al siguiente middleware o manejador de rutas
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = getAllUsers;
