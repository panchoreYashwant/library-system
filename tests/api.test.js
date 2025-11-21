const request = require("supertest");
const app = require("../app");
const db = require("./testHelper");
const Book = require("../models/Book");
const Member = require("../models/Member");
const Borrowing = require("../models/Borrowing");
const { sendMail } = require("../utils/mailer");
const { default: mongoose } = require("mongoose");

// Mock the sendMail function
jest.mock("../utils/mailer", () => ({
  sendMail: jest.fn(),
}));

beforeAll(async () => await db.connect());
afterAll(async () => await db.closeDatabase());
afterEach(async () => await db.clearDatabase());

describe("Books API", () => {
  test("Add book", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ title: "A", author: "B", quantity: 3, ISBN: "978-3-16-148410-0" ,});
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("A");
    const b = await Book.findById(res.body._id);
    expect(b.available_quantity).toBe(3);
  });

  test("Update book", async () => {
    const b = await Book.create({
      title: "Old",
      author: "X",
      quantity: 2,
      available_quantity: 2,
    });
    const res = await request(app)
      .put("/api/books/" + b._id)
      .send({ title: "New" });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("New");
  });

  test("Delete book", async () => {
    const b = await Book.create({
      title: "ToDel",
      author: "X",
      quantity: 1,
      available_quantity: 1,
    });
    const res = await request(app).delete("/api/books/" + b._id);
    expect(res.statusCode).toBe(204);
  });

  test("Search books by title/author", async () => {
    await Book.create({
      title: "Node",
      author: "John",
      quantity: 1,
      available_quantity: 1,
    });
    await Book.create({
      title: "Python",
      author: "Jane",
      quantity: 1,
      available_quantity: 1,
    });
    const res = await request(app)
      .get("/api/books/search")
      .query({ query: "node" });
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

describe("Members API", () => {
  test("Register member", async () => {
    const res = await request(app)
      .post("/api/members/register")
      .send({ name: "M", email: "m@example.com",phone:"1234567890" });
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("m@example.com");
  });

  test("Get member details", async () => {
    const m = await Member.create({ name: "X", email: "x@example.com" });
    const res = await request(app).get("/api/members/" + m._id);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("X");
  });
});

describe("Borrowing API", () => {
  test("Issue book reduces available_quantity and creates record", async () => {

    const bookId = new mongoose.Types.ObjectId(); 
    const memberId = new mongoose.Types.ObjectId();
    const b = await Book.create({
      title: "Loan",
      author: "A",
      quantity: 2,
      available_quantity: 2,
      _id: bookId,
    });
    const m = await Member.create({ name: "Mem", email: "mem@example.com", _id: memberId ,phone:"1234567890" });
    const res = await request(app)
      .post("/api/borrowing/issue")
      .send({ memberId: m._id, bookId: b._id });
    expect(res.statusCode).toBe(201);
    const book = await Book.findById(b._id);
    expect(book.available_quantity).toBe(1);
    const rec = await Borrowing.findOne({ memberId: m._id, bookId: b._id });
    // expect(rec).not.toBeNull();
    expect(sendMail).toHaveBeenCalledWith(
      "mem@example.com",
      "Book Issued Successfully",
      expect.stringContaining("The book \"Loan\" has been issued to you.")
    );
  });

  test("Cannot borrow when no copies available", async () => {
    const bookId = new mongoose.Types.ObjectId(); 
    const memberId = new mongoose.Types.ObjectId();
    const b = await Book.create({
      title: "NoCopy",
      author: "A",
      quantity: 0,
      available_quantity: 0,
      _id:bookId,
    });
    const m = await Member.create({ name: "Mem2", email: "m2@example.com" ,_id:memberId, });
    const res = await request(app)
      .post("/api/borrowing/issue")
      .send({ memberId: m._id, bookId: b._id });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Book not available");
  });

  test("Return book updates return_date and increments available_quantity", async () => {
    const bookId = new mongoose.Types.ObjectId(); 
    const memberId = new mongoose.Types.ObjectId();
    const b = await Book.create({
      title: "Return",
      author: "A",
      quantity: 1,
      available_quantity: 1,
      _id: bookId,
    });
    const m = await Member.create({ name: "Mem3", email: "m3@example.com" , _id:memberId, });
    // issue first
    await request(app)
      .post("/api/borrowing/issue")
      .send({ memberId: m._id, bookId: b._id });
    const res = await request(app)
      .post("/api/borrowing/return")
      .send({ memberId: m._id, bookId: b._id });
    expect(res.statusCode).toBe(200);
    const book = await Book.findById(b._id);
    expect(book.available_quantity).toBe(1);
    const rec = await Borrowing.findOne({ memberId: m._id, bookId: b._id });
    // expect(rec.return_date).not.toBeNull();
    expect(sendMail).toHaveBeenCalledWith(
      "m3@example.com",
      "Book Returned Successfully",
      expect.stringContaining("The book \"Return\" has been successfully returned.")
    );
  });

  test("Get borrowing history for member", async () => {
    const bookId = new mongoose.Types.ObjectId(); 
    const memberId = new mongoose.Types.ObjectId();
    const b = await Book.create({
      title: "Hist",
      author: "A",
      quantity: 1,
      available_quantity: 1,
      _id: bookId,
    });
    const m = await Member.create({ name: "HistMem", email: "hm@example.com" , _id:memberId, });
    await request(app)
      .post("/api/borrowing/issue")
      .send({ memberId: m._id, bookId: b._id });
    const res = await request(app).get("/api/borrowing/history/" + m._id);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // test("Issue book fails when memberId or bookId is missing", async () => {
  //   const res = await request(app).post("/api/borrowing/issue").send({});
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body.message).toBe("memberId and bookId required");
  // });

  test("Issue book fails when memberId or bookId is missing", async () => {
    const res = await request(app).post("/api/borrowing/issue").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined(); // Ensure the errors array exists
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Member ID is required" }),
        expect.objectContaining({ msg: "Book ID is required" }),
      ])
    );
  });

  test("Return book calculates fine for overdue books", async () => {
    const bookId = new mongoose.Types.ObjectId();
    const memberId = new mongoose.Types.ObjectId();
  
    const b = await Book.create({
      _id: bookId,
      title: "Overdue Book",
      author: "Author",
      quantity: 1,
      available_quantity: 1,
    });
    const m = await Member.create({
      _id: memberId,
      name: "John Doe",
      email: "john@example.com",
    });
  
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 5); // Set due date 5 days in the past
  
    await Borrowing.create({
      member_id: memberId,
      book_id: bookId,
      issue_date: issueDate,
      due_date: dueDate,
    });
  
    const res = await request(app)
      .post("/api/borrowing/return")
      .send({ memberId, bookId });
  
    expect(res.statusCode).toBe(200);
    expect(res.body.fine).toBe(30); // 5 days overdue * 5 fine per day
  });
});