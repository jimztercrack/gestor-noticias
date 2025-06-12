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
  'http://localhost:3001',
  'http://localhost:3000',
  'https://trecenoticias-app-80268873ff71.herokuapp.com',
  'https://trecenoticias-app-test-6d9a6dafed1f.herokuapp.com'
];

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o solicitudes curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Hacer que io esté disponible en las rutas
app.set('io', io);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));  // Configuración para permitir cuerpos de solicitud más grandes
app.use(express.urlencoded({ limit: '10mb', extended: true }));  // Configuración para permitir cuerpos de solicitud más grandes

// Manejo de solicitudes preflight (OPTIONS)
app.options('*', cors(corsOptions));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error al conectar a MongoDB", err));

// Importar y registrar modelos
const models = ['./models/Container', './models/Note', './models/Corte', './models/User', './models/Dolar'];
models.forEach(model => require(model));

// Importar rutas
const routers = {
  notas: require('./routes/notas'),
  containers: require('./routes/containers'),
  cortes: require('./routes/cortes'),
  auth: require('./routes/auth'),
  dolars: require('./routes/dolar'), // Importa la ruta del dólar
  users: require('./routes/users')
};

// Usar rutas
Object.entries(routers).forEach(([path, router]) => {
  app.use(`/api/${path}`, router);
});

// Servir archivos estáticos desde la aplicación React
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
