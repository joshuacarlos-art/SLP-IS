const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://joshuagonzales:jorry062102@ac-rqb3od5-shard-00-00.kmdtmhl.mongodb.net:27017,ac-rqb3od5-shard-00-01.kmdtmhl.mongodb.net:27017,ac-rqb3od5-shard-00-02.kmdtmhl.mongodb.net:27017/?replicaSet=atlas-xisqwf-shard-0&ssl=true&authSource=admin";

async function addSampleData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('pigfarm_pro');
    
    // Add sample associations
    console.log('🏢 Adding sample associations...');
    const associations = [
      {
        name: 'Green Valley Farmers Association',
        location: 'Barangay Green Valley',
        contactPerson: 'Juan Dela Cruz',
        contactNumber: '+639123456789',
        totalMembers: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sustainable Livestock Cooperative',
        location: 'Barangay Progress',
        contactPerson: 'Maria Santos',
        contactNumber: '+639987654321',
        totalMembers: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('associations').insertMany(associations);
    console.log('✅ Added sample associations');
    
    // Add sample pigs
    console.log('🐷 Adding sample pigs...');
    const association = await db.collection('associations').findOne();
    
    const pigs = [
      {
        tagNumber: 'PIG-001',
        breed: 'Large White',
        dateOfBirth: new Date('2024-01-15'),
        gender: 'female',
        weight: 85.5,
        status: 'healthy',
        caretakerId: 'admin',
        associationId: association._id.toString(),
        penNumber: 'PEN-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tagNumber: 'PIG-002',
        breed: 'Landrace',
        dateOfBirth: new Date('2024-02-20'),
        gender: 'male',
        weight: 92.3,
        status: 'healthy',
        caretakerId: 'admin',
        associationId: association._id.toString(),
        penNumber: 'PEN-2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('pigs').insertMany(pigs);
    console.log('✅ Added sample pigs');
    
    // Add sample activity logs
    console.log('📝 Adding sample activities...');
    const activities = [
      {
        userId: 'admin',
        action: 'create',
        resource: 'pig',
        resourceId: 'PIG-001',
        details: 'Registered new pig PIG-001',
        timestamp: new Date()
      },
      {
        userId: 'admin',
        action: 'create',
        resource: 'association',
        details: 'Created Green Valley Farmers Association',
        timestamp: new Date()
      }
    ];
    
    await db.collection('activity_logs').insertMany(activities);
    console.log('✅ Added sample activities');
    
    console.log('\n🎉 Sample data added successfully!');
    console.log('📊 Your dashboard should now show real data');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

addSampleData();