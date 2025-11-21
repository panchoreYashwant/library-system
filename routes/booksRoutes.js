const express = require('express');
const router = express.Router();
const createBooksController = require('../controllers/booksController');
const { validateBook } = require('../middlewares/validationMiddleware');
const booksController = createBooksController();

router.post('/',validateBook, booksController.addBook);
router.get('/', booksController.getAllBooks);
router.put('/:id', booksController.updateBook);
router.delete('/:id', booksController.deleteBook);
router.get('/search', booksController.searchBooks);

module.exports = router;
