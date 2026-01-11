// scripts/create-admin-user.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME || 'slp';

async function createAdminUser() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Check if admin user already exists
    const existingAdmin = await db.collection('users').findOne({ email: 'joshuacarlos@gmail.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🎯 Role:', existingAdmin.role);
      return;
    }
    
    // Create admin user with YOUR credentials
    const hashedPassword = await bcrypt.hash('joshua062102', 12);
    
    const adminUser = {
      name: 'Joshua Carlos',
      email: 'joshuacarlos@gmail.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: joshuacarlos@gmail.com');
    console.log('🔑 Password: joshua062102');
    console.log('👤 Name: Joshua Carlos');
    console.log('🎯 Role: admin');
    console.log('🆔 User ID:', result.insertedId);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the admin user creation
createAdminUser();