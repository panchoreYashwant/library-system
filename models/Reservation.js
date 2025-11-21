const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReservationSchema = new Schema({
  member_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  book_id: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  reserved_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reservation', ReservationSchema);