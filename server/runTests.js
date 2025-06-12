require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');

    // Prueba de registro de usuario
    const username = 'testuser';
    const password = 'testpassword';
    
    const user = new User({ username, password });
    console.log('Guardando usuario con contraseña:', user.password);
    await user.save();
    console.log('Usuario registrado:', user);

    // Verificar hash de contraseña
    const foundUser = await User.findOne({ username });
    console.log('Usuario encontrado:', foundUser);
    console.log('Hash almacenado:', foundUser.password);

    // Comparar contraseña manualmente
    console.log('Comparando contraseña manualmente...');
    const isMatch = await bcrypt.compare(password, foundUser.password);
    console.log('Comparación de contraseñas:', isMatch ? 'Coincide' : 'No coincide');

    // Comparar contraseña usando el método del esquema
    console.log('Comparando contraseña usando el método del esquema...');
    const schemaMatch = await foundUser.comparePassword(password);
    console.log('Comparación de contraseñas usando el método del esquema:', schemaMatch ? 'Coincide' : 'No coincide');

    // Limpiar la base de datos después de la prueba
    await User.deleteOne({ _id: foundUser._id });
    console.log('Usuario de prueba eliminado');
  } catch (err) {
    console.error('Error en las pruebas:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

runTests();
