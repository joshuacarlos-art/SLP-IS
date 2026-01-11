import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

const dbName = process.env.DATABASE_NAME || 'slp';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    console.log('📝 Registration attempt:', { name, email });
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);
    console.log('🔑 Password hashed successfully');

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    
    const createdUser = {
      ...newUser,
      _id: result.insertedId.toString()
    };

    console.log('✅ User created successfully:', createdUser.email);

    // Return user without password
    const { password: _, ...userWithoutPassword } = createdUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}