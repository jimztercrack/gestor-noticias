const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  titulo: { type: String, required: true, index: true },
  contenido: { type: String, required: true },
  cintillos: [{ tipo: String, nombre: String, cargo: String, informacion: String }],
  createdAt: { type: Date, default: Date.now, index: true },
  containerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Container' },
  originalNoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
  order: { type: Number, default: 0 },  // Campo de orden
  reviewed: { type: Boolean, default: false },  // New property
  createdBy: { 
    firstName: { type: String, required: true }, 
    lastName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }  // New field for creator info
});

module.exports = mongoose.model('Note', noteSchema);
