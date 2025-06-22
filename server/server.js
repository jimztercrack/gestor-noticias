import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';

dotenv.config();
const __dirname = path.resolve();
const app = express();

app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Servir React del build
app.use(express.static(path.join(__dirname, 'client/build')));

// Cualquier otra ruta => index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Conexión MongoDB y levantar server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(process.env.PORT || 3001, () => {
      console.log(`✅ Servidor escuchando en puerto ${process.env.PORT || 3001}`);
    });
  })
  .catch(err => console.error(err));
