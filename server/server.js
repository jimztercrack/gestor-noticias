const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000', // desarrollo local
  'https://gestor-noticias.vercel.app', // dominio vercel (ajústalo si usas otro)
  'https://gestor-noticias-api.onrender.com' // backend render (por si aplica)
];

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

app.set('io', io);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.options('*', cors(corsOptions));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error al conectar a MongoDB", err));

// Importar modelos
const models = ['./models/Container', './models/Note', './models/Corte', './models/User', './models/Dolar'];
models.forEach(model => require(model));

// Importar rutas
const routers = {
  notas: require('./routes/notas'),
  containers: require('./routes/containers'),
  cortes: require('./routes/cortes'),
  auth: require('./routes/auth'),
  dolars: require('./routes/dolar'),
  users: require('./routes/users')
};

// Usar rutas
Object.entries(routers).forEach(([path, router]) => {
  app.use(`/api/${path}`, router);
});

// Servir frontend
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
