import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Institutional Buyers Collection Connection...');
    
    const collection = await getCollection('institutional_buyers');
    
    // Basic connection test
    const count = await collection.countDocuments();
    
    // Get collection stats
    const db = collection.db;
    const collections = await db.listCollections({ name: 'institutional_buyers' }).toArray();
    const collectionInfo = collections[0] || {};
    
    // Test write operation
    const testDocument = {
      buyer_name: 'TEST_BUYER_DELETE_ME',
      contact_person: 'Test Contact',
      contact_number: '+0000000000',
      email: 'test@example.com',
      type: 'corporate',
      status: 'active',
      buyer_id: `TEST-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await collection.insertOne(testDocument);
    const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });

    console.log('✅ Institutional Buyers Connection test successful');

    return NextResponse.json({
      status: 'success',
      message: 'Institutional Buyers collection is working correctly',
      tests: {
        connection: '✅ PASS - Connected to database',
        read_operation: '✅ PASS - Can read from collection',
        write_operation: '✅ PASS - Can write to collection',
        delete_operation: '✅ PASS - Can delete from collection'
      },
      collection: {
        name: 'institutional_buyers',
        exists: collections.length > 0,
        documentCount: count,
        info: {
          name: collectionInfo.name,
          type: collectionInfo.type
        }
      },
      operations: {
        insertedId: insertResult.insertedId.toString(),
        deletedCount: deleteResult.deletedCount
      }
    });
    
  } catch (error: any) {
    console.error('❌ Institutional Buyers Connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Institutional Buyers collection test failed',
      error: error.message,
      tests: {
        connection: '❌ FAIL - Cannot connect to database',
        read_operation: '❌ FAIL - Cannot read from collection',
        write_operation: '❌ FAIL - Cannot write to collection'
      }
    }, { status: 500 });
  }
}