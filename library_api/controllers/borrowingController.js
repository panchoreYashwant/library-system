const Borrowing = require("../models/Borrowing");
const Book = require("../models/Book");
const Member = require("../models/Member");

module.exports = () => {
  const issueBook = async (req, res) => {
    try {
      const { memberId, bookId } = req.body;
      if (!memberId || !bookId)
        return res
          .status(400)
          .json({ message: "memberId and bookId required" });

      const member = await Member.findById(memberId);
      if (!member) return res.status(404).json({ message: "Member not found" });

      const book = await Book.findById(bookId);
      if (!book) return res.status(404).json({ message: "Book not found" });

      if (book.available_quantity <= 0)
        return res.status(400).json({ message: "Book not available" });

      book.available_quantity -= 1;
      await book.save();

      const due = new Date();
      due.setDate(due.getDate() + 14); // 2 weeks
      const record = new Borrowing({
        member_id: memberId,
        book_id: bookId,
        due_date: due,
      });
      await record.save();
      return res.status(201).json(record);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  const returnBook = async (req, res) => {
    try {
      const { memberId, bookId } = req.body;
      if (!memberId || !bookId)
        return res
          .status(400)
          .json({ message: "memberId and bookId required" });

      const record = await Borrowing.findOne({
        member_id: memberId,
        book_id: bookId,
        return_date: null,
      });
      if (!record)
        return res.status(404).json({ message: "Borrowing record not found" });

      record.return_date = new Date();
      await record.save();

      const book = await Book.findById(bookId);
      if (book) {
        book.available_quantity += 1;
        await book.save();
      }

      return res.json(record);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  const getBorrowingRecords = async (req, res) => {
    try {
      const { memberId } = req.params;
      const records = await Borrowing.find({ member_id: memberId }).populate(
        "book_id"
      );
      return res.json(records);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  return { issueBook, returnBook, getBorrowingRecords };
};
