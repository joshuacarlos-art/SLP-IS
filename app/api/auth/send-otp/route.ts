import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP } from '@/lib/utils/otp-generator';
import { sendEmail } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    console.log('📝 Received OTP request for:', { email, name });

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP(6);
    console.log('🔐 Generated OTP:', otp);
    
    // Store OTP
    storeOTP(email, otp, name);
    console.log('💾 OTP stored for email:', email);

    try {
      // Send email
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - OTP Code - SLP Admin',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { 
                      font-family: 'Arial', sans-serif; 
                      background-color: #f4f4f4; 
                      margin: 0; 
                      padding: 20px; 
                  }
                  .container { 
                      max-width: 600px; 
                      margin: 0 auto; 
                      background: #ffffff; 
                      padding: 30px; 
                      border-radius: 10px; 
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                      border: 1px solid #e0e0e0;
                  }
                  .header { 
                      color: #16a34a; 
                      text-align: center; 
                      margin-bottom: 25px;
                      font-size: 24px;
                      font-weight: bold;
                  }
                  .otp-container { 
                      background: linear-gradient(135deg, #16a34a, #22c55e);
                      padding: 25px; 
                      text-align: center; 
                      font-size: 36px; 
                      font-weight: bold; 
                      letter-spacing: 15px; 
                      margin: 25px 0; 
                      border-radius: 8px;
                      color: white;
                      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                  }
                  .info-box {
                      background: #f8f9fa;
                      padding: 15px;
                      border-radius: 5px;
                      border-left: 4px solid #16a34a;
                      margin: 20px 0;
                  }
                  .footer { 
                      color: #6b7280; 
                      font-size: 14px; 
                      text-align: center; 
                      margin-top: 25px;
                      border-top: 1px solid #e5e7eb;
                      padding-top: 20px;
                  }
                  .warning {
                      color: #dc2626;
                      font-size: 12px;
                      text-align: center;
                      margin-top: 15px;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">🔐 Email Verification</div>
                  
                  <p>Hello <strong>${name}</strong>,</p>
                  
                  <p>Thank you for registering with SLP Admin. Use the verification code below to complete your registration:</p>
                  
                  <div class="otp-container">${otp}</div>
                  
                  <div class="info-box">
                      <strong>⚠️ This code will expire in 10 minutes</strong>
                      <p style="margin: 5px 0 0 0; font-size: 13px;">Enter this code in the verification field to proceed with your registration.</p>
                  </div>
                  
                  <div class="footer">
                      <p>If you didn't request this verification, please ignore this email.</p>
                      <p>This is an automated message, please do not reply to this email.</p>
                  </div>
                  
                  <div class="warning">
                      <strong>Do not share this code with anyone.</strong>
                  </div>
              </div>
          </body>
          </html>
        `
      });

      console.log('✅ OTP process completed for:', email);

      return NextResponse.json({ 
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: '10 minutes'
      });

    } catch (emailError) {
      console.error('❌ Email sending failed, but OTP was generated');
      
      // Even if email fails, return the OTP for testing
      return NextResponse.json({ 
        success: true,
        message: 'OTP generated successfully. Check console for code.',
        expiresIn: '10 minutes',
        debugOtp: otp // Include OTP in response for testing
      });
    }

  } catch (error) {
    console.error('❌ Error in send-otp route:', error);
    
    return NextResponse.json(
      { error: 'Failed to process OTP request. Please try again.' },
      { status: 500 }
    );
  }
}