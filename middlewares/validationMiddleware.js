// exports.validateIssueBook = (req, res, next) => {
//   const { memberId, bookId } = req.body;
//   if (!memberId || !bookId) return res.status(400).json({ message: 'memberId and bookId required' });
//   next();
// };

// exports.validateReturnBook = (req, res, next) => {
//   const { memberId, bookId } = req.body;
//   if (!memberId || !bookId) return res.status(400).json({ message: 'memberId and bookId required' });
//   next();
// };

// // exports.validateMember = (req, res, next) => {
// //   const { name, email } = req.body;
// //   if (!name || !email) return res.status(400).json({ message: 'name and email required' });
// //   next();
// // };


const { body, validationResult } = require('express-validator');

exports.validateBook = [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('ISBN').isISBN().withMessage('Invalid ISBN'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateMember = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateBorrowing = [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  body('bookId').notEmpty().withMessage('Book ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];