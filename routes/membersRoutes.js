const express = require("express");
const router = express.Router();
const createMembersController = require("../controllers/membersController");
const { validateMember } = require("../middlewares/validationMiddleware");
const membersController = createMembersController();

router.post("/register", validateMember, membersController.registerMember);
router.get("/:id", membersController.getMemberDetails);
// router.get("/:id/borrowing-history", membersController.getBorrowingHistory);

module.exports = router;
