const Book = require('../models/Book');

module.exports = () => {
  const addBook = async (req, res) => {
    try {
      const data = req.body;
      const book = new Book(data);
      book.available_quantity = data.quantity;
      await book.save();
      return res.status(201).json(book);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  const updateBook = async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await Book.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Book not found' });
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  const deleteBook = async (req, res) => {
    try {
      const { id } = req.params;
      await Book.findByIdAndDelete(id);
      return res.status(204).send();
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  const searchBooks = async (req, res) => {
    try {
      const { query } = req.query;
      const q = query || '';
      const books = await Book.find({
        $or: [
          { title: new RegExp(q, 'i') },
          { author: new RegExp(q, 'i') }
        ]
      });
      return res.json(books);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  const getAllBooks = async (req, res) => {
    try {
      const books = await Book.find();
      return res.json(books);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  return { addBook, updateBook, deleteBook, searchBooks, getAllBooks };
};
