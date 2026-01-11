// Simple setup script without external dependencies
const { MongoClient } = require('mongodb');

// Read environment variables directly (for development)
const MONGODB_URI = "mongodb://joshuagonzales:jorry062102@ac-rqb3od5-shard-00-00.kmdtmhl.mongodb.net:27017,ac-rqb3od5-shard-00-01.kmdtmhl.mongodb.net:27017,ac-rqb3od5-shard-00-02.kmdtmhl.mongodb.net:27017/?replicaSet=atlas-xisqwf-shard-0&ssl=true&authSource=admin";
const DATABASE_NAME = "slp";

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Step 1: Create collections
    console.log('\n📁 Creating collections...');
    const collections = [
      'users',
      'associations',
      'pigs',
      'health_records',
      'feeding_records',
      'weight_records',
      'breeding_records',
      'projects',
      'inventory',
      'activity_logs'
    ];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`ℹ️  Collection already exists: ${collectionName}`);
        } else {
          console.error(`❌ Error creating collection ${collectionName}:`, error.message);
        }
      }
    }
    
    // Step 2: Create indexes
    console.log('\n📊 Creating indexes...');
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('✅ Created unique index on users.email');
    } catch (error) {
      console.log('ℹ️  Index on users.email already exists');
    }
    
    try {
      await db.collection('pigs').createIndex({ tagNumber: 1 }, { unique: true });
      console.log('✅ Created unique index on pigs.tagNumber');
    } catch (error) {
      console.log('ℹ️  Index on pigs.tagNumber already exists');
    }
    
    // Step 3: Create admin user (with plain text password for now)
    console.log('\n👤 Creating admin user...');
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@slp.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
    } else {
      // For now, store plain text password - we'll hash it in the application
      const adminUser = {
        name: 'Admin User',
        email: 'admin@slp.com',
        password: 'password', // Plain text for now
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('users').insertOne(adminUser);
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@slp.com');
      console.log('🔑 Password: password');
      console.log('👤 Name: Admin User');
      console.log('🆔 User ID:', result.insertedId);
      console.log('⚠️  Note: Password is stored in plain text. Update to hashed password later.');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🚀 You can now start your application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the complete setup
setupDatabase();