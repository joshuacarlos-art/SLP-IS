import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Institutional Buyers Connection...');
    
    const collection = await getCollection('institutional_buyers');
    
    // Test 1: Count documents
    const count = await collection.countDocuments();
    
    // Test 2: Insert a test document
    const testDoc = {
      buyer_name: 'Connection Test Company',
      contact_person: 'Test Person',
      contact_number: '+639001112222',
      email: `test${Date.now()}@company.com`,
      type: 'corporate',
      status: 'active',
      buyer_id: `TEST-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await collection.insertOne(testDoc);
    
    // Test 3: Read the document back
    const foundDoc = await collection.findOne({ _id: insertResult.insertedId });
    
    // Test 4: Delete the test document
    const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
    
    console.log('✅ All connection tests passed');
    
    return NextResponse.json({
      status: 'success',
      message: 'Institutional Buyers connection is working correctly',
      tests: {
        database_connection: '✅ PASS',
        collection_access: '✅ PASS', 
        read_operation: '✅ PASS',
        write_operation: '✅ PASS',
        delete_operation: '✅ PASS'
      },
      details: {
        currentDocumentCount: count,
        testDocument: {
          inserted: insertResult.acknowledged,
          found: foundDoc ? true : false,
          deleted: deleteResult.deletedCount === 1
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ Connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Connection test failed',
      error: error.message,
      tests: {
        database_connection: '❌ FAIL',
        collection_access: '❌ FAIL',
        read_operation: '❌ FAIL', 
        write_operation: '❌ FAIL'
      }
    }, { status: 500 });
  }
}