import { compare, hash } from 'bcryptjs';

export async function verifyPassword(password: string, hashedPassword: string) {
  try {
    console.log('Verifying password...');
    const isValid = await compare(password, hashedPassword);
    console.log('Password verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export async function hashPassword(password: string) {
  return await hash(password, 12);
}