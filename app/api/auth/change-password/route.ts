import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Change Password Request Started...');
    
    const { currentPassword, newPassword, otp } = await request.json();
    console.log('Request data:', { 
      hasCurrentPassword: !!currentPassword, 
      hasNewPassword: !!newPassword,
      hasOTP: !!otp,
      otpLength: otp?.length 
    });

    // Validate input
    if (!currentPassword || !newPassword || !otp) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      console.log('❌ Password too short');
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const userEmail = 'joshuacarlosgonzales@gmail.com';

    // Validate OTP
    const client = await clientPromise;
    const db = client.db('slp');
    const otpCollection = db.collection('passwordResetOTPs');

    console.log('🔍 Checking OTP in database for:', userEmail);
    
    const otpRecord = await otpCollection.findOne({
      email: userEmail,
      otp: otp,
      type: 'password_change',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      console.log('❌ Invalid or expired OTP');
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please generate a new one.' },
        { status: 400 }
      );
    }

    console.log('✅ OTP validated successfully:', otpRecord._id);

    // Verify current password again for security
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('🔑 Password hashed successfully');

    // Update user password in database
    const updateResult = await usersCollection.updateOne(
      { email: userEmail },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    console.log('📊 Update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount
    });

    if (updateResult.matchedCount === 0) {
      console.log('❌ User not found for password update');
      return NextResponse.json(
        { error: 'User account not found. Please contact administrator.' },
        { status: 404 }
      );
    }

    console.log('✅ Password updated in database');

    // Mark OTP as used
    await otpCollection.updateOne(
      { _id: otpRecord._id },
      { $set: { used: true, usedAt: new Date() } }
    );

    console.log('✅ OTP marked as used');

    return NextResponse.json({
      success: true,
      message: '🎉 Password changed successfully! You can now use your new password to login.'
    });

  } catch (error: any) {
    console.error('❌ Change Password Error:', error);
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}