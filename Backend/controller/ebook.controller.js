import EBook from '../models/ebook.model.js';
import EBookOrder from '../models/ebookorder.model.js';
import Stripe from 'stripe';

const stripe = new Stripe(
  'sk_test_51SNo5JPgn4fVebeOseCJ0qvkWAplYqDFVKgc1ZTX5wGU0V8grsRlDkjF1vA3FGVrHeaXPfRCT7BRX4aLG4Zx97Rf0033TTzfAB'
);

// ── Get all ebooks ──────────────────────────────────────────────────────
export const getAllEBooks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.featured === "true") {
      filter.featured = true;
    }
    const ebooks = await EBook.find(filter);
    res.status(200).json(ebooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get single ebook ────────────────────────────────────────────────────
export const getEBookById = async (req, res) => {
  try {
    const ebook = await EBook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'EBook not found' });
    res.status(200).json(ebook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create payment intent for ebook ────────────────────────────────────
export const createEBookPaymentIntent = async (req, res) => {
  try {
    const { ebookId } = req.body;
    if (!ebookId) return res.status(400).json({ message: 'Missing ebookId' });

    const ebook = await EBook.findById(ebookId);
    if (!ebook) return res.status(404).json({ message: 'EBook not found' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: ebook.price * 100,
      currency: 'inr',
      description: `EBook purchase: ${ebook.name}`,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret, ebook });
  } catch (err) {
    console.error('EBook payment intent error:', err);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
};

// ── Confirm ebook purchase ──────────────────────────────────────────────
export const purchaseEBook = async (req, res) => {
  try {
    const { userId, ebookId, paymentIntentId } = req.body;
    if (!userId || !ebookId || !paymentIntentId) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Check already purchased
    const existing = await EBookOrder.findOne({ userId, ebookId });
    if (existing) {
      return res.status(400).json({ message: 'You already own this eBook' });
    }

    const ebook = await EBook.findById(ebookId);
    if (!ebook) return res.status(404).json({ message: 'EBook not found' });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const order = await EBookOrder.create({
      userId,
      ebookId,
      price: ebook.price,
      paymentIntentId,
      status: 'Paid',
    });

    res.status(201).json({ message: 'EBook purchased successfully', order });
  } catch (err) {
    console.error('EBook purchase error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── Get user's purchased ebooks ─────────────────────────────────────────
export const getUserEBooks = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await EBookOrder.find({ userId }).populate('ebookId');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Check if user owns an ebook ─────────────────────────────────────────
export const checkOwnership = async (req, res) => {
  try {
    const { userId, ebookId } = req.params;
    const order = await EBookOrder.findOne({ userId, ebookId });
    res.status(200).json({ owned: !!order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Seed ebooks (dev only) ──────────────────────────────────────────────
export const seedEBooks = async (req, res) => {
  try {
    const count = await EBook.countDocuments();
    if (count > 0) return res.status(200).json({ message: 'Already seeded' });

    const ebooks = [
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
        name: 'Pride and Prejudice',
        author: 'Jane Austen',
        title: 'A classic novel of manners, marriage, and society',
        price: 79,
        category: 'Fiction',
        image: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
        pdfUrl: 'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm',
        pages: 432,
        language: 'English',
      },
      {
        name: 'Meditations',
        author: 'Marcus Aurelius',
        title: 'Personal writings of the Roman Emperor on Stoic philosophy',
        price: 59,
        category: 'Philosophy',
        image: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
        pdfUrl: 'https://www.gutenberg.org/files/2680/2680-h/2680-h.htm',
        pages: 254,
        language: 'English',
      },
      {
        name: 'The Jungle Book',
        author: 'Rudyard Kipling',
        title: 'Classic tales of Mowgli and the animals of the jungle',
        price: 39,
        category: 'Fiction',
        image: 'https://covers.openlibrary.org/b/id/8739535-L.jpg',
        pdfUrl: 'https://www.gutenberg.org/files/236/236-h/236-h.htm',
        pages: 212,
        language: 'English',
      },
      {
        name: 'Dracula',
        author: 'Bram Stoker',
        title: 'The original vampire gothic horror novel',
        price: 69,
        category: 'Horror',
        image: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
        pdfUrl: 'https://www.gutenberg.org/files/345/345-h/345-h.htm',
        pages: 418,
        language: 'English',
      },
    ];

    await EBook.insertMany(ebooks);
    res.status(201).json({ message: `Seeded ${ebooks.length} ebooks` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPI purchase (test mode simulation) ────────────────────────────────
export const purchaseEBookUpi = async (req, res) => {
  try {
    const { userId, ebookId, upiId } = req.body;
    if (!userId || !ebookId || !upiId) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ message: 'Invalid UPI ID format' });
    }

    const existing = await EBookOrder.findOne({ userId, ebookId });
    if (existing) {
      return res.status(400).json({ message: 'You already own this eBook' });
    }

    const ebook = await EBook.findById(ebookId);
    if (!ebook) return res.status(404).json({ message: 'EBook not found' });

    const order = await EBookOrder.create({
      userId,
      ebookId,
      price: ebook.price,
      paymentIntentId: `upi_${Date.now()}`,
      status: 'Paid',
    });

    res.status(201).json({ message: 'EBook purchased via UPI', order });
  } catch (err) {
    console.error('EBook UPI purchase error:', err);
    res.status(500).json({ message: err.message });
  }
};
