const mongoose = require('mongoose');
const { Schema } = mongoose;

const BorrowingSchema = new Schema({
  member_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  book_id: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  issue_date: { type: Date, default: Date.now },
  due_date: { type: Date },
  return_date: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Borrowing', BorrowingSchema);
