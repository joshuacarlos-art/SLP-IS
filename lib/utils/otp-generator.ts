// Simple in-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: Date; name: string }>();

export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
}

export function storeOTP(email: string, otp: string, name: string): void {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  otpStore.set(email, { otp, expiresAt, name });
  
  // Auto-cleanup after expiration
  setTimeout(() => {
    if (otpStore.get(email)?.otp === otp) {
      otpStore.delete(email);
    }
  }, 10 * 60 * 1000);
}

export function verifyOTP(email: string, otp: string): { isValid: boolean; name?: string } {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return { isValid: false };
  }
  
  if (new Date() > stored.expiresAt) {
    otpStore.delete(email);
    return { isValid: false };
  }
  
  if (stored.otp === otp) {
    const name = stored.name;
    otpStore.delete(email); // Remove OTP after successful verification
    return { isValid: true, name };
  }
  
  return { isValid: false };
}

export function getStoredName(email: string): string | null {
  return otpStore.get(email)?.name || null;
}