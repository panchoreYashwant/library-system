const Reservation = require("../models/Reservation");
const Book = require("../models/Book");
const Member = require("../models/Member");
const { sendMail } = require("../utils/mailer");

// Reserve a book
const reserveBook = async (req, res) => {
  try {
    const { memberId, bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.available_quantity > 0) {
      return res.status(400).json({ message: "Book is available, no need to reserve" });
    }

    const reservation = new Reservation({ member_id: memberId, book_id: bookId });
    await reservation.save();

    return res.status(201).json({ message: "Book reserved successfully", reservation });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Notify the next member in the reservation queue
const notifyReservation = async (bookId) => {
  const reservation = await Reservation.findOne({ book_id: bookId }).populate("member_id");
  if (reservation) {
    const member = reservation.member_id;
    await sendMail(
      member.email,
      "Book Available Notification",
      `Dear ${member.name},\n\nThe book you reserved is now available. Please visit the library to borrow it.\n\nThank you,\nLibrary Management System`
    );
    await reservation.deleteOne(); // Remove the reservation after notifying
  }
};

module.exports = { reserveBook, notifyReservation };