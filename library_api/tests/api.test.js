const request = require("supertest");
const app = require("../app");
const db = require("./testHelper");
const Book = require("../models/Book");
const Member = require("../models/Member");
const Borrowing = require("../models/Borrowing");

beforeAll(async () => await db.connect());
afterAll(async () => await db.closeDatabase());
afterEach(async () => await db.clearDatabase());

describe("Books API", () => {
  test("Add book", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ title: "A", author: "B", quantity: 3 });
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
      .send({ name: "M", email: "m@example.com" });
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
    const b = await Book.create({
      title: "Loan",
      author: "A",
      quantity: 2,
      available_quantity: 2,
    });
    const m = await Member.create({ name: "Mem", email: "mem@example.com" });
    const res = await request(app)
      .post("/api/borrowing/issue")
      .send({ memberId: m._id, bookId: b._id });
    expect(res.statusCode).toBe(201);
    const book = await Book.findById(b._id);
    expect(book.available_quantity).toBe(1);
    const rec = await Borrowing.findOne({ member_id: m._id, book_id: b._id });
    expect(rec).not.toBeNull();
  });

  test("Cannot borrow when no copies available", async () => {
    const b = await Book.create({
      title: "NoCopy",
      author: "A",
      quantity: 0,
      available_quantity: 0,
    });
    const m = await Member.create({ name: "Mem2", email: "m2@example.com" });
    const res = await request(app)
      .post("/api/borrowing/issue")
      .send({ memberId: m._id, bookId: b._id });
    expect(res.statusCode).toBe(400);
  });

  test("Return book updates return_date and increments available_quantity", async () => {
    const b = await Book.create({
      title: "Return",
      author: "A",
      quantity: 1,
      available_quantity: 1,
    });
    const m = await Member.create({ name: "Mem3", email: "m3@example.com" });
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
    const rec = await Borrowing.findOne({ member_id: m._id, book_id: b._id });
    expect(rec.return_date).not.toBeNull();
  });

  test("Get borrowing history for member", async () => {
    const b = await Book.create({
      title: "Hist",
      author: "A",
      quantity: 1,
      available_quantity: 1,
    });
    const m = await Member.create({ name: "HistMem", email: "hm@example.com" });
    await request(app)
      .post("/api/borrowing/issue")
      .send({ memberId: m._id, bookId: b._id });
    const res = await request(app).get("/api/borrowing/history/" + m._id);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });
});
