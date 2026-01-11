import nodemailer from 'nodemailer';

// Gmail SMTP configuration with explicit host/port
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
};

// Create transporter for Gmail
export const emailTransporter = nodemailer.createTransport(emailConfig);

// Verify transporter configuration
export const verifyEmailConfig = async () => {
  try {
    await emailTransporter.verify();
    console.log('✅ Email transporter is ready');
    console.log('📧 Using Gmail SMTP:', {
      host: emailConfig.host,
      port: emailConfig.port,
      user: process.env.GMAIL_USER ? 'Configured' : 'Missing'
    });
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  passwordChangeOTP: (otp: string, userName: string) => ({
    subject: 'SLP Admin - Password Change OTP Verification',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
          }
          .content { 
            padding: 40px 30px; 
          }
          .otp-container {
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          .otp-code { 
            font-size: 42px; 
            font-weight: bold; 
            color: #059669; 
            letter-spacing: 10px; 
            margin: 15px 0;
            font-family: 'Courier New', monospace;
          }
          .warning { 
            background: #fef3c7; 
            border-left: 4px solid #f59e0b; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 20px 0; 
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 12px; 
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .user-info {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 SLP Admin Portal</h1>
            <p>Department of Social Welfare and Development</p>
          </div>
          <div class="content">
            <h2 style="color: #059669; margin-top: 0;">Password Change Verification</h2>
            
            <div class="user-info">
              <strong>User:</strong> ${userName}<br>
              <strong>Email:</strong> joshuacarlosgonzales@gmail.com<br>
              <strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })}
            </div>
            
            <p>Hello <strong>${userName}</strong>,</p>
            <p>You have requested to change your password for the SLP Admin Portal. Use the OTP code below to verify your identity:</p>
            
            <div class="otp-container">
              <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Your One-Time Password</div>
              <div class="otp-code">${otp}</div>
              <div style="color: #6b7280; font-size: 12px;">Valid for 10 minutes</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This OTP is valid for 10 minutes only. Do not share this code with anyone. DSWD staff will never ask for your OTP.
            </div>
            
            <p>If you didn't request this password change, please:<br>
            1. Ignore this email<br>
            2. Contact your system administrator immediately<br>
            3. Review your account security</p>
            
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              <strong>SLP Admin Team</strong><br>
              Department of Social Welfare and Development
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Sustainable Livelihood Program Admin Portal.</p>
            <p>📍 Negros Occidental, Philippines</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Email sending function
export async function sendOTPEmail(email: string, otp: string, userName: string) {
  try {
    const template = emailTemplates.passwordChangeOTP(otp, userName);
    
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