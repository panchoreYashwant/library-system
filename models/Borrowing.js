const mongoose = require('mongoose');
const { Schema } = mongoose;

const BorrowingSchema = new Schema({
  member_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  book_id: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  issue_date: { type: Date, default: Date.now },
  due_date: { type: Date },
  return_date: { type: Date, default: null }
}, { timestamps: true });

BorrowingSchema.methods.calculateFine = function () {
  const today = new Date();
  if ( today <= this.due_date) return 0;
  const overdueDays = Math.ceil((today - this.due_date) / (1000 * 60 * 60 * 24));
  const finePerDay = 5; // Example fine amount
  return overdueDays * finePerDay;
};

module.exports = mongoose.model('Borrowing', BorrowingSchema);
