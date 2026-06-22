# UB-Books - Online Bookstore

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)

UB-Books is a full-stack MERN (MongoDB, Express.js, React, Node.js) application that provides a complete online bookstore experience. Users can browse books, manage their cart, place orders, and enjoy a seamless shopping experience.

## 📸 Screenshots

*Coming soon - Screenshots will be added to showcase the application interface*

## 🚀 Features

### Frontend Features
- **Modern UI/UX**: Clean, responsive design with dark/light theme support
- **User Authentication**: Secure login and registration system
- **Book Browsing**: Browse and search through curated book collections
- **Shopping Cart**: Add/remove books, manage quantities
- **Order Management**: Place orders and track order history
- **Payment Integration**: Secure payment processing with Stripe
- **Responsive Design**: Works perfectly on desktop and mobile devices

### Backend Features
- **RESTful API**: Well-structured API endpoints
- **User Management**: Authentication and authorization
- **Book Management**: CRUD operations for books
- **Cart System**: Persistent shopping cart functionality
- **Order Processing**: Complete order management system
- **Email Notifications**: Automated email notifications via Gmail SMTP
- **PDF Generation**: Order receipts in PDF format
- **Database Integration**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Beautiful UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling
- **React Hot Toast** - Toast notifications
- **Stripe** - Payment processing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **PDFKit** - PDF generation
- **Stripe** - Payment processing
- **Jest** - Testing framework

## 📁 Project Structure

```
UB-Books/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── Home/           # Home page components
│   │   └── Courses/        # Course/Books page components
│   ├── public/             # Static assets
│   └── package.json
├── Backend/                 # Node.js backend API
│   ├── controller/         # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── tests/             # Test files
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/shaishav/ub-books.git
cd ub-books
```

2. **Install root dependencies**
```bash
npm install
```

3. **Setup Backend**
```bash
cd Backend
npm install
```

4. **Setup Frontend**
```bash
cd Frontend
npm install
```

5. **Environment Configuration**
Create a `.env` file in the Backend directory:
```env
URI=your_mongodb_connection_string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
CONTACT_EMAIL=your_contact_email@gmail.com
```

6. **Seed the Database**
```bash
cd Backend
npm run seed
```

### Running the Application

1. **Start Backend Server**
```bash
cd Backend
node server.js
```
Backend will run on `http://localhost:4001`

2. **Start Frontend Development Server**
```bash
cd Frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## 🌐 Live Demo

*Live demo link will be added once deployed*

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `cd Frontend && npm run build`
2. Deploy the `dist` folder to your preferred hosting service

### Backend Deployment (Heroku/Railway)
1. Set up environment variables on your hosting platform
2. Deploy the Backend folder
3. Update the frontend API base URL to point to your deployed backend

## 📊 Project Status

- ✅ Core functionality complete
- ✅ Authentication system implemented
- ✅ Shopping cart and orders working
- ✅ Payment integration with Stripe
- ✅ Email notifications configured
- ✅ Responsive design implemented
- 🔄 Continuous improvements and bug fixes

## 🧪 Testing

Run backend tests:
```bash
cd Backend
npm test
```

## 📧 Email Configuration

The application uses Gmail SMTP for sending contact form emails. Make sure to:
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Use the app password in the `SMTP_PASSWORD` environment variable

**Note**: For production deployment, consider using professional email services like SendGrid, Mailgun, or AWS SES.

## 🔧 Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```env
# Database
URI=your_mongodb_connection_string

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
CONTACT_EMAIL=your_contact_email@gmail.com

# Optional
PORT=4001
NODE_ENV=development
```

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Toggle between themes
- **Smooth Animations**: Professional transitions and effects
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Graceful error messages
- **Toast Notifications**: Real-time feedback

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Sensitive data protection

## 📱 API Endpoints

### Authentication
- `POST /user/signup` - User registration
- `POST /user/login` - User login

### Books
- `GET /book` - Get all books
- `GET /book/:id` - Get book by ID

### Cart
- `GET /cart/:userId` - Get user cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item
- `DELETE /cart/remove` - Remove item from cart

### Orders
- `POST /order/create` - Create new order
- `GET /order/:userId` - Get user orders
- `GET /order/receipt/:id` - Download order receipt

### Contact
- `POST /contact` - Send contact message

## 👨‍💻 Developer

**Shaishav** - Full Stack Developer

- 📧 Email: sk.shaishav.17@gmail.com
- 💼 LinkedIn: [Connect with Shaishav](https://www.linkedin.com/in/shaishav-967318252/)
- 🐙 GitHub: [@Shaishav13](https://github.com/Shaishav13)

Built with ❤️ for book lovers everywhere.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests to ensure everything works
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure all tests pass before submitting

### Reporting Issues

If you find a bug or have a feature request, please create an issue with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the ISC License.

---

**UB-Books** - Your gateway to knowledge and imagination. 📚

*Developed by Shaishav*