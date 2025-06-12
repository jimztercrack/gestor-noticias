const mongoose = require('mongoose');

const corteSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now, index: true },
  containerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Container', default: null }
});

module.exports = mongoose.model('Corte', corteSchema);
