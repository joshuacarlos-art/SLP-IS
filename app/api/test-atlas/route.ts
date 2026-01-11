import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  let client: MongoClient | null = null;
  
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI is not defined'
      }, { status: 500 });
    }

    console.log('Testing Atlas connection...');
    
    // Test with the corrected URI format
    const testUri = 'mongodb+srv://joshuagonzales:jorry062102@cluster0.kmdtmhl.mongodb.net/slp?retryWrites=true&w=majority';
    
    client = new MongoClient(testUri);
    
    console.log('Attempting to connect to Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const db = client.db('slp');
    console.log('✅ Connected to database: slp');

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas connection successful!',
      database: 'slp',
      collections: collections.map(c => c.name)
    });

  } catch (error: any) {
    console.error('❌ Atlas connection failed:', error);
    
    let suggestion = '';
    if (error.message?.includes('bad auth') || error.message?.includes('authentication failed')) {
      suggestion = 'Check your MongoDB Atlas username and password.';
    } else if (error.message?.includes('ETIMEOUT')) {
      suggestion = 'Network timeout. Check your internet connection.';
    } else if (error.message?.includes('ENOTFOUND')) {
      suggestion = 'Cannot resolve hostname. Check your cluster URL.';
    }

    return NextResponse.json({
      success: false,
      error: 'Atlas connection failed',
      message: error.message,
      suggestion: suggestion
    }, { status: 500 });
    
  } finally {
    if (client) {
      await client.close();
    }
  }
}