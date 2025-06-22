require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Note = require('./models/Note');
const Container = require('./models/Container');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar:', err));

async function populateDB() {
  try {
    // Limpia todo
    await User.deleteMany({ username: 'asalazar' });
    await Note.deleteMany({});
    await Container.deleteMany({});

    // Usuario con hash
    const hashedPassword = await bcrypt.hash("Canal@13", 10);
    const user = new User({
      username: "asalazar",
      password: hashedPassword,
      firstName: "Alfredo",
      lastName: "Salazar"
    });
    await user.save();
    console.log('✅ Usuario creado:', user.username);

    // Contenedor: usar 'name', no 'nombre'
    const container = new Container({
      name: "Contenedor Principal",
      createdBy: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
    await container.save();
    console.log('✅ Contenedor creado:', container.name);

    // Nota
    const note = new Note({
      titulo: "Bienvenido a Gestor Noticias",
      contenido: "Esta es una nota de prueba.",
      createdBy: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName
      },
      container: container._id
    });
    await note.save();
    console.log('✅ Nota creada:', note.titulo);

    console.log('🎉 Base de datos poblada sin errores.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

populateDB();
