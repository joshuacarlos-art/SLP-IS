import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('👤 Creating test user...');
    
    const client = await clientPromise;
    const db = client.db('slp');
    const usersCollection = db.collection('users');

    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const user = {
      email: 'joshuacarlosgonzales@gmail.com',
      password: hashedPassword,
      name: 'Joshua Carlos Gonzales',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 User data prepared');

    // Upsert - create if doesn't exist, update if exists
    const result = await usersCollection.updateOne(
      { email: user.email },
      { $set: user },
      { upsert: true }
    );

    console.log('✅ User operation result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });

    return NextResponse.json({
      success: true,
      message: 'Test user created/updated successfully',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
      result: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      }
    });

  } catch (error: any) {
    console.error('❌ Create test user error:', error);
    return NextResponse.json(
      { error: 'Failed to create test user: ' + error.message },
      { status: 500 }
    );
  }
}