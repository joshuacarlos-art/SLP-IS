import { NextResponse } from 'next/server';
import { getCollection, getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Detailed MongoDB Debugging...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('DATABASE_NAME:', process.env.DATABASE_NAME);

    const db = await getDatabase();
    console.log('📊 Database name from getDatabase():', db.databaseName);

    // Get the actual MongoDB client to see connection details
    const client = await import('@/lib/mongodb').then(mod => mod.default);
    const mongoClient = await client;
    console.log('🔗 Connected to MongoDB cluster');
    
    // List ALL databases to see what's available
    const adminDb = mongoClient.db().admin();
    const databaseList = await adminDb.listDatabases();
    console.log('🗄️ All databases on cluster:');
    databaseList.databases.forEach(dbInfo => {
      console.log(`   - ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`);
    });

    // Test if we can create and see data in general_projects
    const generalProjectsCollection = await getCollection('general_projects');
    
    // Insert a test document with a unique identifier
    const testDoc = {
      project_id: `DEBUG-${Date.now()}`,
      project_name: 'DEBUG TEST PROJECT',
      participant_name: 'Debug User',
      barangay: 'Debug Barangay',
      city_municipality: 'Debug City',
      province: 'Debug Province',
      enterprise_type: 'Debug',
      association_name: 'Debug Association',
      monitoring_date: new Date().toISOString().split('T')[0],
      project_status: 'ongoing',
      budget_allocation: 1000,
      project_description: 'This is a debug test to verify data is being inserted',
      debug_timestamp: new Date(),
      debug_marker: 'FROM_NEXTJS_DEBUG',
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 Inserting test document:', testDoc);
    const result = await generalProjectsCollection.insertOne(testDoc);
    console.log('✅ Insert result:', result);

    // Read it back immediately to verify
    const insertedDoc = await generalProjectsCollection.findOne({ 
      _id: result.insertedId 
    });
    console.log('🔍 Document read back from database:', insertedDoc);

    // Count all documents
    const count = await generalProjectsCollection.countDocuments();
    console.log(`📊 Total documents in general_projects: ${count}`);

    // Find all documents with debug marker
    const debugDocs = await generalProjectsCollection.find({ 
      debug_marker: 'FROM_NEXTJS_DEBUG' 
    }).toArray();
    console.log(`🔎 Found ${debugDocs.length} debug documents`);

    return NextResponse.json({
      success: true,
      database: db.databaseName,
      insertedId: result.insertedId,
      documentCount: count,
      debugDocumentCount: debugDocs.length,
      connectionInfo: {
        uri: process.env.MONGODB_URI ? 'Set' : 'Missing',
        dbName: process.env.DATABASE_NAME || 'slp (default)'
      },
      allDatabases: databaseList.databases.map(db => db.name)
    });

  } catch (error: any) {
    console.error('❌ Detailed debug failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      detailedError: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}