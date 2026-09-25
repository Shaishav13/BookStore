# UB-Books - Online Bookstore

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**Live Demo (Vercel):** [Insert Vercel Link Here]

UB-Books is a full-stack MERN (MongoDB, Express.js, React, Node.js) application that provides a complete online bookstore experience. Users can browse books, manage their cart, place orders, and enjoy a seamless shopping experience.

## 🚀 Core Features
- **User Authentication**: Secure login and registration system using JWT and bcrypt.
- **Book Catalog & Search**: Browse, search, and filter through curated book collections.
- **Shopping Cart & Checkout**: Persistent cart functionality with secure payment integration (Stripe).
- **Order Management**: Track order history and download PDF receipts.
- **Responsive UI/UX**: Clean, mobile-friendly design with dark/light theme support.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, DaisyUI, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Stripe
- **Testing**: Jest, Supertest

## 🚀 How to Run Locally (3-Step Guide)

**Step 1: Clone the repository and install root dependencies**
```bash
git clone https://github.com/shaishav/ub-books.git
cd ub-books
npm install
```

**Step 2: Setup and start the Backend**
Create a `.env` file in the `Backend` directory with your MongoDB `URI` and other environment variables (e.g., email settings). Then run:
```bash
cd Backend
npm install
npm run seed  # (Optional: to seed books)
npm run dev
```

**Step 3: Setup and start the Frontend**
In a new terminal window:
```bash
cd Frontend
npm install
npm run dev
```
The frontend will be running at `http://localhost:5173` and the backend at `http://localhost:4001`.

## 🧪 Testing
We have automated API integration tests set up with Jest. To run them:
```bash
cd Backend
npm test
```

## 👨‍💻 Developer
**Shaishav** - Full Stack Developer
- 📧 Email: sk.shaishav.17@gmail.com
- 💼 LinkedIn: [Connect with Shaishav](https://www.linkedin.com/in/shaishav-967318252/)
- 🐙 GitHub: [@Shaishav13](https://github.com/Shaishav13)

Built with ❤️ for book lovers everywhere.