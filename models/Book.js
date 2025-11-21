const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  ISBN: { type: String },
  quantity: { type: Number, required: true, min: 0 },
  available_quantity: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
