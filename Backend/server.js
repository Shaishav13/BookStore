import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bookRoute from './routes/book.route.js'
import userRoute from './routes/user.route.js'
import contactRoute from './routes/contact.route.js'
import cartRoute from './routes/cart.route.js'
import orderRoute from './routes/order.route.js'
import cors from 'cors'
const app = express()

app.use(cors())
app.use(express.json())
dotenv.config()
const PORT = process.env.PORT || 4001;
let URI = process.env.URI || process.env.MONGODB_URI || 'mongodb+srv://nayansaxena456_db_user:1234@cluster0.3pabkob.mongodb.net/myStore';

// Fix connection string if database name is missing
if (URI.includes('mongodb+srv://') && !URI.match(/\.mongodb\.net\/[^?]/)) {
    // Add database name if missing (before query parameters)
    if (URI.includes('?')) {
        URI = URI.replace('?', '/myStore?');
    } else {
        URI = URI.endsWith('/') ? URI + 'myStore' : URI + '/myStore';
    }
}

//connecting to mongodb
console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs

// Set up connection event handlers
mongoose.connection.on('connected', () => {
    console.log("✅ Connected to MongoDB successfully");
});

mongoose.connection.on('error', (error) => {
    console.error("❌ MongoDB connection error:", error.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn("⚠️  MongoDB disconnected");
});

// Connect to MongoDB
mongoose.connect(URI, {
    // These options help with connection stability
    serverSelectionTimeoutMS: 30000, // Increased to 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    connectTimeoutMS: 30000, // Increased to 30 seconds
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain at least 2 socket connections
})
    .then(() => {
        console.log("✅ MongoDB connection established");
    })
    .catch((error) => {
        console.error("❌ Error connecting to MongoDB:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        
        if (error.code === 'ENOTFOUND') {
            console.error("\n⚠️  DNS Resolution Failed!");
            console.error("Possible solutions:");
            console.error("1. Check your internet connection");
            console.error("2. Verify the MongoDB cluster exists in MongoDB Atlas");
            console.error("3. Check if the connection string is correct");
            console.error("4. Try using a local MongoDB: mongodb://localhost:27017/myStore");
            console.error("5. Check MongoDB Atlas Network Access settings (IP whitelist)");
        } else if (error.code === 'EAUTH') {
            console.error("\n⚠️  Authentication Failed!");
            console.error("Check your username and password in the connection string");
        }
        
        console.error("\nFull error details:", error);
        console.warn("\n⚠️  Server will continue without database connection. Some features may not work.");
    });

app.get('/', (req, res) => {
  res.send('Mern project!')
})
app.use("/book",bookRoute);
app.use("/user",userRoute);
app.use("/contact",contactRoute);
app.use("/cart",cartRoute);
app.use("/order",orderRoute)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`💡 Solution: Kill the process using port ${PORT} or change the PORT in your .env file`);
    console.error(`   To find and kill the process: netstat -ano | findstr :${PORT}`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});