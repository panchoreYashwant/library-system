const mongoose = require('mongoose');
const { Schema } = mongoose;

const MemberSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  membership_date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);
