const mongoose = require('mongoose');

const DolarSchema = new mongoose.Schema({
  compra: {
    type: String,
    required: true,
  },
  venta: {
    type: String,
    required: true,
  },
  containerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Container',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Dolar', DolarSchema);
