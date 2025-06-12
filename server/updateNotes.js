const mongoose = require('mongoose');
const Note = require('./models/Note'); // Asegúrate de que la ruta sea correcta

const MONGO_URI = 'mongodb+srv://alee1894:%23Ferrari1@appnoticias.uluzzny.mongodb.net/?retryWrites=true&w=majority&appName=appNoticias'; // Reemplaza con tu cadena de conexión a MongoDB
const DEFAULT_USER_ID = '666bb359983369d096d6c20f';

const userData = {
  userId: DEFAULT_USER_ID,
  firstName: 'Administrador', // Reemplaza con el nombre del usuario
  lastName: '13TN' // Reemplaza con el apellido del usuario
};

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado a MongoDB');
    addCreatedByToNotes();
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB', err);
  });

const addCreatedByToNotes = async () => {
  try {
    const result = await Note.updateMany(
      { createdBy: { $exists: false } }, // Solo actualiza notas que no tengan el campo createdBy
      { $set: { createdBy: userData } }
    );
    console.log(`Notas actualizadas: ${result.nModified}`);
    mongoose.connection.close();
  } catch (err) {
    console.error('Error al actualizar las notas', err);
  }
};
