const express = require('express');
const router = express.Router();
const createBorrowingController = require('../controllers/borrowingController');
const borrowingController = createBorrowingController();

router.post('/issue', borrowingController.issueBook);
router.post('/return', borrowingController.returnBook);
router.get('/history/:memberId', borrowingController.getBorrowingRecords);

module.exports = router;
