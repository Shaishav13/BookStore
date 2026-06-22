import Book from '../models/book.model.js'

// GET all books with optional filters: ?category=&minPrice=&maxPrice=&search=&featured=
export const getBook = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, featured } = req.query;
        const filter = {};

        if (category) filter.category = { $regex: category, $options: 'i' };
        if (featured === 'true') filter.featured = true;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ];
        }

        const books = await Book.find(filter).sort({ _id: -1 });
        res.status(200).json(books);
    } catch (error) {
        console.log("Error :", error);
        res.status(500).json(error);
    }
}

// GET single book by ID
export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.status(200).json(book);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: error.message });
    }
}

// GET related books by same category (excluding current book)
export const getRelatedBooks = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        const related = await Book.find({
            category: book.category,
            _id: { $ne: bookId },
            inStock: true,
        }).limit(6);

        res.status(200).json(related);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: error.message });
    }
}

// GET all unique categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Book.distinct('category');
        res.status(200).json(categories.filter(Boolean).sort());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const createBook = async (req, res) => {
    try {
        const { name, price, category, image, title } = req.body;
        const book = new Book({ name, price, category, image, title });
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: error.message });
    }
}

export const createMultipleBooks = async (req, res) => {
    try {
        const books = req.body;
        const createdBooks = await Book.insertMany(books);
        res.status(201).json(createdBooks);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: error.message });
    }
}
