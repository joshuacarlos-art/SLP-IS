import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Debugging Institutional Buyers Connection...');
    
    // Test the database connection first
    const db = await getDatabase();
    const dbName = db.databaseName;
    console.log('📁 Connected to database:', dbName);
    
    // Test collection access
    const collection = await getCollection('institutional_buyers');
    console.log('📋 Accessed collection:', collection.collectionName);
    
    // Get all collections to see what's available
    const allCollections = await db.listCollections().toArray();
    const collectionNames = allCollections.map(col => col.name);
    
    // Check if our collection exists
    const buyersCollectionExists = collectionNames.includes('institutional_buyers');
    
    // Count documents
    const documentCount = await collection.countDocuments();
    
    // Get sample data
    const sampleData = await collection.find({}).limit(5).toArray();
    
    // Test write operation
    let testWriteSuccess = false;
    let testDocumentId = null;
    
    if (!buyersCollectionExists || documentCount === 0) {
      const testDocument = {
        buyer_name: 'TEST_BUYER_DEBUG',
        contact_person: 'Test Contact',
        contact_number: '+639001234567',
        email: 'test@debug.com',
        type: 'corporate',
        status: 'active',
        buyer_id: `DEBUG-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(testDocument);
      testWriteSuccess = result.acknowledged;
      testDocumentId = result.insertedId;
      
      // Clean up test document
      if (testDocumentId) {
        await collection.deleteOne({ _id: testDocumentId });
      }
    }

    console.log('✅ Debug completed successfully');

    return NextResponse.json({
      debug: {
        timestamp: new Date().toISOString(),
        type: 'institutional_buyers_debug'
      },
      
      connection: {
        status: 'connected',
        database: dbName,
        databaseFromEnv: process.env.DATABASE_NAME || 'slp (default)',
        collection: 'institutional_buyers',
        connectionString: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'
      },
      
      collection: {
        exists: buyersCollectionExists,
        documentCount: documentCount,
        allCollections: collectionNames
      },
      
      sampleData: {
        count: sampleData.length,
        documents: sampleData.map(doc => ({
          _id: doc._id?.toString(),
          buyer_id: doc.buyer_id,
          buyer_name: doc.buyer_name,
          contact_person: doc.contact_person,
          email: doc.email,
          type: doc.type,
          status: doc.status,
          createdAt: doc.createdAt
        }))
      },
      
      testResults: {
        writeOperation: testWriteSuccess ? '✅ Success' : 'Not tested (collection has data)',
        readOperation: '✅ Success'
      },
      
      environment: {
        MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
        DATABASE_NAME: process.env.DATABASE_NAME || 'Not set (using default: slp)',
        NODE_ENV: process.env.NODE_ENV
      },
      
      recommendations: getRecommendations(buyersCollectionExists, documentCount)
    });

  } catch (error: any) {
    console.error('❌ Debug failed:', error);
    
    return NextResponse.json({
      debug: {
        timestamp: new Date().toISOString(),
        type: 'institutional_buyers_debug',
        status: 'error'
      },
      
      error: {
        message: error.message,
        code: error.code,
        name: error.name
      },
      
      connection: {
        status: 'failed',
        database: 'Unknown',
        collection: 'institutional_buyers'
      },
      
      environment: {
        MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
        DATABASE_NAME: process.env.DATABASE_NAME || 'Not set (using default: slp)',
        NODE_ENV: process.env.NODE_ENV
      },
      
      troubleshooting: [
        'Check if MongoDB Atlas cluster is running',
        'Verify network access in MongoDB Atlas',
        'Check if database user has read/write permissions',
        'Ensure connection string includes database name',
        'Check if collection exists in the database'
      ]
    }, { status: 500 });
  }
}

function getRecommendations(collectionExists: boolean, documentCount: number): string[] {
  const recommendations: string[] = [];
  
  if (!collectionExists) {
    recommendations.push('Collection does not exist. It will be created automatically when you add the first buyer.');
  }
  
  if (documentCount === 0) {
    recommendations.push('No documents found in collection. Use the POST API to add institutional buyers.');
  }
  
  if (!process.env.DATABASE_NAME) {
    recommendations.push('DATABASE_NAME not set in environment variables. Using default: "slp"');
  }
  
  return recommendations.length > 0 ? recommendations : ['✅ Everything looks good!'];
}