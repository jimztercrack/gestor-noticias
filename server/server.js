const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth'); // Si tienes rutas de auth.js
const usersRoutes = require('./routes/users'); // Si tienes rutas de users.js

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas principales
app.get('/', (req, res) => {
  res.send('¡API de Gestor de Noticias funcionando correctamente!');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(3001, () => {
      console.log('✅ Servidor escuchando en puerto 3001');
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err);
  });
