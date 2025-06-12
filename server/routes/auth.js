const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware'); // Importar el middleware

// Registro de usuario
router.post('/register', async (req, res) => {
  const { username, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, firstName, lastName });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { _id: newUser._id, username, firstName, lastName, role: newUser.role } });
  } catch (err) {
    console.error('Error in register route:', err);
    res.status(500).json({ message: err.message });
  }
});

// Inicio de sesión de usuario
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Verifica el contenido del objeto user
    console.log('Usuario encontrado:', user);

    const { firstName, lastName } = user;

    res.json({ token, user: { _id: user._id, username: user.username, firstName, lastName, role: user.role } });
  } catch (err) {
    console.error('Error in login route:', err);
    res.status(500).json({ message: err.message });
  }
});

// Obtener información del usuario autenticado
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
