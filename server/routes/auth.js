const express = require('express');
// CAMBIO CLAVE: usa bcryptjs en lugar de bcrypt
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const User = require('../models/User'); // Modelo centralizado

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Busca usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Valida contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Genera token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      message: 'Inicio de sesión exitoso'
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
