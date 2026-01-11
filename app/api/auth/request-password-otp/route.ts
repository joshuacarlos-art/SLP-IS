import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Inline email service functions
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOTPEmail(email: string, otp: string, userName: string) {
  try {
    const template = {
      subject: 'SLP Admin - Password Change OTP Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .otp-code { font-size: 42px; font-weight: bold; color: #059669; letter-spacing: 10px; margin: 15px 0; font-family: 'Courier New', monospace; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 SLP Admin Portal</h1>
              <p>Department of Social Welfare and Development</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #059669; margin-top: 0;">Password Change Verification</h2>
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Use the OTP code below to verify your identity:</p>
              <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Your One-Time Password</div>
                <div class="otp-code">${otp}</div>
                <div style="color: #6b7280; font-size: 12px;">Valid for 10 minutes</div>
              </div>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This OTP is valid for 10 minutes only.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    const mailOptions = {
      from: `"SLP Admin Portal" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return { success: false, error };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 OTP Request Started...');
    
    const { currentPassword, resend } = await request.json();
    console.log('Request received:', { hasCurrentPassword: !!currentPassword, resend });

    // Validate current password first
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      );
    }

    const userEmail = 'joshuacarlosgonzales@gmail.com';
    const client = await clientPromise;
    const db = client.db('slp');
    
    // Verify current password
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
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

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('✅ Generated OTP:', otp);

    // Save to database
    const otpCollection = db.collection('passwordResetOTPs');

    // Clean old OTPs for this user
    const deleteResult = await otpCollection.deleteMany({ 
      email: userEmail,
      type: 'password_change' 
    });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} old OTPs`);

    // Save new OTP
    const insertResult = await otpCollection.insertOne({
      email: userEmail,
      otp,
      type: 'password_change',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
      used: false
    });

    console.log('💾 OTP saved to database with ID:', insertResult.insertedId);

    // Try to send OTP via email
    let emailSent = false;
    
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const emailResult = await sendOTPEmail(userEmail, otp, user.name || 'User');
      emailSent = emailResult.success;
      
      if (emailResult.success) {
        console.log('📧 OTP email sent successfully');
      } else {
        console.error('❌ Failed to send OTP email:', emailResult.error);
      }
    } else {
      console.log('📧 Email credentials not configured, skipping email send');
    }

    // Return response based on environment and email status
    if (process.env.NODE_ENV === 'development' || !emailSent) {
      return NextResponse.json({
        success: true,
        message: emailSent 
          ? 'OTP generated and email sent! Check the response for the OTP code.'
          : 'OTP generated! Email service not configured - use OTP below.',
        otp: otp,
        emailSent: emailSent,
        debug: {
          note: emailSent ? 'Email service is working' : 'Email service not configured',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toLocaleString(),
        }
      });
    } else {
      // In production with successful email
      return NextResponse.json({
        success: true,
        message: 'OTP has been sent to your email address. Please check your inbox.',
        emailSent: true,
      });
    }

  } catch (error: any) {
    console.error('❌ OTP Request Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate OTP. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}