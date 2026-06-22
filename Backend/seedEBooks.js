import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EBook from './models/ebook.model.js';

dotenv.config();

const URI = process.env.URI || 'mongodb+srv://bookstore:shaishav123@cluster0.kaobvho.mongodb.net/myStore?appName=Cluster0';

const ebooks = [
  // ── Self Help ──────────────────────────────────────────────────────────
  {
    name: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    title: 'The landmark bestseller on achieving success and wealth',
    price: 99,
    category: 'Self Help',
    image: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/1232/1232-h/1232-h.htm',
    pages: 238,
    language: 'English',
  },
  {
    name: 'As a Man Thinketh',
    author: 'James Allen',
    title: 'A classic guide to the power of thought and self-mastery',
    price: 49,
    category: 'Self Help',
    image: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/4507/4507-h/4507-h.htm',
    pages: 60,
    language: 'English',
  },
  {
    name: 'The Science of Getting Rich',
    author: 'Wallace D. Wattles',
    title: 'A practical guide to acquiring wealth through focused thought',
    price: 59,
    category: 'Self Help',
    image: 'https://covers.openlibrary.org/b/id/8739535-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/1578/1578-h/1578-h.htm',
    pages: 96,
    language: 'English',
  },

  // ── Philosophy ─────────────────────────────────────────────────────────
  {
    name: 'Meditations',
    author: 'Marcus Aurelius',
    title: 'Personal writings of the Roman Emperor on Stoic philosophy',
    price: 79,
    category: 'Philosophy',
    image: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/2680/2680-h/2680-h.htm',
    pages: 254,
    language: 'English',
  },
  {
    name: 'The Republic',
    author: 'Plato',
    title: 'Plato\'s dialogue on justice, the ideal state, and the philosopher-king',
    price: 89,
    category: 'Philosophy',
    image: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/1497/1497-h/1497-h.htm',
    pages: 416,
    language: 'English',
  },

  // ── Strategy / Business ────────────────────────────────────────────────
  {
    name: 'The Art of War',
    author: 'Sun Tzu',
    title: 'Ancient Chinese military treatise on strategy and tactics',
    price: 49,
    category: 'Strategy',
    image: 'https://covers.openlibrary.org/b/id/8739535-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/132/132-h/132-h.htm',
    pages: 68,
    language: 'English',
  },
  {
    name: 'Acres of Diamonds',
    author: 'Russell H. Conwell',
    title: 'Opportunity lies right where you are — a timeless motivational classic',
    price: 39,
    category: 'Business',
    image: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/368/368-h/368-h.htm',
    pages: 52,
    language: 'English',
  },

  // ── Fiction ────────────────────────────────────────────────────────────
  {
    name: 'Pride and Prejudice',
    author: 'Jane Austen',
    title: 'A classic novel of manners, marriage, and society in Regency England',
    price: 79,
    category: 'Fiction',
    image: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm',
    pages: 432,
    language: 'English',
  },
  {
    name: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    title: 'A portrait of the Jazz Age and the hollowness of the American Dream',
    price: 69,
    category: 'Fiction',
    image: 'https://covers.openlibrary.org/b/id/8739535-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/64317/64317-h/64317-h.htm',
    pages: 180,
    language: 'English',
  },
  {
    name: 'The Jungle Book',
    author: 'Rudyard Kipling',
    title: 'Classic tales of Mowgli and the animals of the Indian jungle',
    price: 39,
    category: 'Fiction',
    image: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/236/236-h/236-h.htm',
    pages: 212,
    language: 'English',
  },
  {
    name: 'Frankenstein',
    author: 'Mary Shelley',
    title: 'The original science fiction novel about creation, responsibility, and horror',
    price: 59,
    category: 'Fiction',
    image: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/84/84-h/84-h.htm',
    pages: 280,
    language: 'English',
  },

  // ── Horror ─────────────────────────────────────────────────────────────
  {
    name: 'Dracula',
    author: 'Bram Stoker',
    title: 'The original vampire gothic horror novel',
    price: 69,
    category: 'Horror',
    image: 'https://covers.openlibrary.org/b/id/8739535-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/345/345-h/345-h.htm',
    pages: 418,
    language: 'English',
  },

  // ── Adventure ──────────────────────────────────────────────────────────
  {
    name: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    title: 'A swashbuckling tale of pirates, treasure maps, and adventure on the high seas',
    price: 49,
    category: 'Adventure',
    image: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/120/120-h/120-h.htm',
    pages: 292,
    language: 'English',
  },
  {
    name: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    title: 'Twelve classic detective stories featuring the legendary Sherlock Holmes',
    price: 79,
    category: 'Mystery',
    image: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/1661/1661-h/1661-h.htm',
    pages: 307,
    language: 'English',
  },

  // ── Science ────────────────────────────────────────────────────────────
  {
    name: 'On the Origin of Species',
    author: 'Charles Darwin',
    title: 'Darwin\'s groundbreaking work introducing the theory of evolution by natural selection',
    price: 89,
    category: 'Science',
    image: 'https://covers.openlibrary.org/b/id/8739535-L.jpg',
    pdfUrl: 'https://www.gutenberg.org/files/1228/1228-h/1228-h.htm',
    pages: 502,
    language: 'English',
  },
];

async function seedEBooks() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(URI);
    console.log('Connected to MongoDB successfully!');

    const existingNames = (await EBook.find({}, 'name')).map(e => e.name);
    const newEBooks = ebooks.filter(e => !existingNames.includes(e.name));

    if (newEBooks.length === 0) {
      console.log('ℹ️  All ebooks already exist. Nothing to insert.');
    } else {
      await EBook.insertMany(newEBooks);
      console.log(`✅ Successfully added ${newEBooks.length} new ebooks!`);
    }

    const all = await EBook.find();
    console.log(`\n📖 Total ebooks in database: ${all.length}`);
    console.log('\nEBooks list:');
    all.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.name} by ${e.author} — ₹${e.price} (${e.category})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding ebooks:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedEBooks();
