import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/user.model.js';

dotenv.config();

const URI = process.env.URI || 'mongodb+srv://bookstore:shaishav123@cluster0.kaobvho.mongodb.net/myStore?appName=Cluster0';

const ADMIN_EMAIL    = 'admin@ub-books.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_NAME     = 'UB-Books Admin';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(URI);
    console.log('Connected to MongoDB successfully!');

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      // Make sure the existing account has admin role
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Existing account promoted to admin.');
      } else {
        console.log('ℹ️  Admin account already exists. Nothing to do.');
      }
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin account created successfully!');
    }

    console.log(`\n🔐 Admin credentials:`);
    console.log(`   Email    : ${ADMIN_EMAIL}`);
    console.log(`   Password : ${ADMIN_PASSWORD}`);
    console.log(`   Role     : admin`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();
