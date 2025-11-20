const express = require('express');
const router = express.Router();
const createMembersController = require('../controllers/membersController');
const membersController = createMembersController();

router.post('/register', membersController.registerMember);
router.get('/:id', membersController.getMemberDetails);
router.get('/:id/borrowing-history', membersController.getBorrowingHistory);

module.exports = router;
