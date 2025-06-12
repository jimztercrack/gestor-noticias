const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  items: [{
    type: { type: String, enum: ['Note', 'Corte'] },
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.type' }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Container', containerSchema);
