import express from "express";
import cors from "cors";
import mongoose from "mongoose";



const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/books";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const Author = mongoose.model("Author", {
  name: String,
});

const Book = mongoose.model("Book", {
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  }
});

if (process.env.RESET_DATABASE) {
  const seedDatabase = async () => {

    await Author.deleteMany();


    const tolkien =  new Author({ name: "J.R.R. Tolkien" });
    await tolkien.save();

    const rowling = new Author({ name: "J.K. Rowling" });
    await rowling.save();

    await new Book({ title: "Harry Potter", author: rowling }).save();
    await new Book({ title: "Harry Potter and the Philosopher's Stone", author: rowling }).save();
    await new Book({ title: "The Hobbit", author: tolkien }).save();
    await new Book({ title: "The Lord of the Rings", author: tolkien }).save();
  };
  seedDatabase();
}

// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

app.get("/authors", async (req, res) => {
  const authors = await Author.find();
  res.json(authors);
});

app.get("/books", async (req, res) => {
  
  const books = await Book.find().populate('author');
  res.json(books);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get("/authors/:id/books", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    const books = await Book.find({ author: author._id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});


app.get('/authors/:id', async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (author) {
    res.json(author);
  } else {
    res.status(404).json({ error: 'Author not found' });
  }
});