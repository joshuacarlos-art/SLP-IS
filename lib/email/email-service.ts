import nodemailer from 'nodemailer';

// Create transporter for Gmail - FIXED: use createTransport instead of createTransporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    console.log('🔧 Attempting to send email to:', to);
    console.log('🔧 Using Gmail user:', process.env.GMAIL_USER);

    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Send actual email
    const mailOptions = {
      from: `"SLP Admin" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      
      // Gmail-specific error handling
      if (error.message.includes('Invalid login')) {
        console.error('❌ Gmail authentication failed. Please check:');
        console.error('   1. GMAIL_USER is correct');
        console.error('   2. GMAIL_APP_PASSWORD is correct (16 characters)');
        console.error('   3. 2FA is enabled and app password is generated');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('❌ Connection refused. Check your network/firewall');
      }
    }
    
    // Fallback to console log with OTP
    const otpMatch = html.match(/>(\d{6})</) || html.match(/(\d{6})/);
    if (otpMatch) {
      console.log('🔐 OTP CODE FOR TESTING:', otpMatch[1]);
    }
    
    console.log('📧 ========== EMAIL CONTENT ==========');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    console.log('📧 ====================================');
    
    throw new Error('Failed to send email');
  }
}