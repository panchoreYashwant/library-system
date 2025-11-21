const express = require("express");
const router = express.Router();
const createBorrowingController = require("../controllers/borrowingController");
const { validateBorrowing } = require("../middlewares/validationMiddleware");
const borrowingController = createBorrowingController();

router.post("/issue", validateBorrowing, borrowingController.issueBook);
router.post("/return", validateBorrowing, borrowingController.returnBook);
router.get("/history/:memberId", borrowingController.getBorrowingRecords);

module.exports = router;
