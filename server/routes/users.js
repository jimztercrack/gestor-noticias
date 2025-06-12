const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const getUser = require('../middlewares/getUser');
const getAllUsers = require('../middlewares/getAllUsers'); 

// Usar el middleware para obtener un usuario por ID
router.use('/:id', getUser);

// Obtener todos los usuarios
router.get('/', getAllUsers, (req, res) => {
  res.json(res.users); // Devuelve la lista de usuarios al frontend
});

// Obtener un usuario específico
router.get('/:id', (req, res) => {
  res.json(res.user);
});

// Actualizar rol del usuario
router.patch('/:id/role', [
  check('role').isIn(['editor', 'admin']).withMessage('Rol inválido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    res.user.role = req.body.role;
    await res.user.save();
    res.json({ message: 'Rol actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Restablecer contraseña del usuario
router.patch('/:id/reset-password', [
  check('password').isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    res.user.password = req.body.password;
    await res.user.save();
    res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    await res.user.deleteOne();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
