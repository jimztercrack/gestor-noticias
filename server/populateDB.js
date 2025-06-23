// populateDB.js
const mongoose = require('mongoose');
const Nota = require('./models/Note'); // Asegúrate de que esta ruta sea correcta
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Conectado a MongoDB");
    return Nota.insertMany([
      {
        titulo: "Nota de Ejemplo 1",
        contenido: "Contenido de la nota de ejemplo 1",
        cintillos: [
          { tipo: "Informativo", informacion: "Información adicional 1" }
        ]
      },
      {
        titulo: "Nota de Ejemplo 2",
        contenido: "Contenido de la nota de ejemplo 2",
        cintillos: [
          { tipo: "Nombre", nombre: "Nombre 1", cargo: "Cargo 1" }
        ]
      }
    ]);
  })
  .then(() => {
    console.log("Notas de ejemplo insertadas");
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Error al conectar a MongoDB o insertar datos:", err);
  });
