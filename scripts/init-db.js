const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME || 'slp';

async function initDatabase() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Create collections
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
    
    // Create indexes
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
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the initialization
initDatabase();