const mongoose = require('mongoose');
require('dotenv').config(); // Cargar variables de entorno desde un archivo .env

// URL de conexión de MongoDB
const mongoURI = process.env.MONGODB_URI;

// Nombre de la colección que deseas vaciar
const collectionName = 'notes'; // Reemplaza con el nombre de tu colección

// Conectar a MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado a MongoDB');
    return mongoose.connection.db.collection(collectionName).deleteMany({});
  })
  .then(result => {
    console.log(`Se eliminaron ${result.deletedCount} documentos de la colección ${collectionName}`);
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB o eliminar documentos:', err);
  })
  .finally(() => {
    mongoose.disconnect().then(() => console.log('Conexión cerrada'));
  });
