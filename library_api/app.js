require("dotenv").config();
const express = require("express");
// const db = require('./config/db');
const connectDB = require("./config/db");

const booksRoutes = require("./routes/booksRoutes");
const membersRoutes = require("./routes/membersRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// db.connect();
connectDB();

app.use("/api/books", booksRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/borrowing", borrowingRoutes);

app.get("/", (req, res) => res.send("Library API running"));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
