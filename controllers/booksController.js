const Book = require('../models/Book');

const escapeRegex = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');


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
      let { query } = req.query;
      if (!query || query.trim() === "") {
        return res.status(400).json({ message: "Query is required" });
      }
  
      const safeQuery = escapeRegex(query);
      const books = await Book.find({
        $or: [
          { title: { $regex: safeQuery, $options: "i" } },
          { author: { $regex: safeQuery, $options: "i" } },
        ]
      });
  
      return res.status(200).json(books);
    } catch (err) {
      return res.status(500).json({ message: err.message });
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
