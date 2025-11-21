const express = require("express");
const { reserveBook } = require("../controllers/reservationController");

const router = express.Router();

router.post("/reserve", reserveBook);

module.exports = router;