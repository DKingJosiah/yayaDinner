const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dinner-registration');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@dinnerregistration.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = new Admin({
      email: 'admin@dinnerregistration.com',
      password: 'admin123', // Change this password!
      name: 'Admin User'
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@dinnerregistration.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();