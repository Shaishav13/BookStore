import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/book.model.js';

dotenv.config();

const URI = process.env.URI || process.env.MONGODB_URI || 'mongodb+srv://bookstore:shaishav123@cluster0.kaobvho.mongodb.net/myStore?appName=Cluster0';

const books = [
    {
        name: "Ikigai: The Japanese Secret to a Long and Happy Life",
        price: 399,
        category: "Self Help",
        image: "https://m.media-amazon.com/images/I/81l3rZK4lnL._SY425_.jpg",
        title: "Ikigai: The Japanese Secret to a Long and Happy Life"
    },
    {
        name: "One Arranged Murder",
        price: 199,
        category: "Fiction",
        image: "https://m.media-amazon.com/images/I/71aFt4+OTOL._SY425_.jpg",
        title: "One Arranged Murder by Chetan Bhagat"
    },
    {
        name: "The Alchemist",
        price: 299,
        category: "Fiction",
        image: "https://m.media-amazon.com/images/I/71aFt4+OTOL._SY425_.jpg",
        title: "The Alchemist by Paulo Coelho"
    },
    {
        name: "Rich Dad Poor Dad",
        price: 349,
        category: "Finance",
        image: "https://m.media-amazon.com/images/I/81bsw6fnUiL._SY425_.jpg",
        title: "Rich Dad Poor Dad by Robert Kiyosaki"
    },
    {
        name: "Sapiens: A Brief History of Humankind",
        price: 499,
        category: "History",
        image: "https://m.media-amazon.com/images/I/713jIoM3xpL._SY425_.jpg",
        title: "Sapiens: A Brief History of Humankind by Yuval Noah Harari"
    },
    {
        name: "The 5 AM Club",
        price: 299,
        category: "Self Help",
        image: "https://m.media-amazon.com/images/I/71zytzrg6lL._SY425_.jpg",
        title: "The 5 AM Club by Robin Sharma"
    },
    {
        name: "Think and Grow Rich",
        price: 249,
        category: "Self Help",
        image: "https://m.media-amazon.com/images/I/61IxJuRI39L._SY522_.jpg",
        title: "Think and Grow Rich by Napoleon Hill"
    }
];

async function seedBooks() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(URI);
        console.log('Connected to MongoDB successfully!');

        // Clear existing books (optional - comment out if you want to keep existing books)
        // await Book.deleteMany({});
        // console.log('Cleared existing books');

        // Check if books already exist
        const existingBooks = await Book.find({ name: { $in: books.map(b => b.name) } });
        if (existingBooks.length > 0) {
            console.log(`Found ${existingBooks.length} books that already exist. Skipping duplicates...`);
            const existingNames = existingBooks.map(b => b.name);
            const newBooks = books.filter(b => !existingNames.includes(b.name));
            
            if (newBooks.length > 0) {
                const insertedBooks = await Book.insertMany(newBooks);
                console.log(`✅ Successfully added ${insertedBooks.length} new books!`);
            } else {
                console.log('All books already exist in the database.');
            }
        } else {
            const insertedBooks = await Book.insertMany(books);
            console.log(`✅ Successfully added ${insertedBooks.length} books!`);
        }

        // Display all books
        const allBooks = await Book.find();
        console.log(`\n📚 Total books in database: ${allBooks.length}`);
        console.log('\nBooks list:');
        allBooks.forEach((book, index) => {
            console.log(`${index + 1}. ${book.name} - ₹${book.price}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding books:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedBooks();
