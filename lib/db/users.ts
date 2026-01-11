import clientPromise from '../mongodb';

export async function getUserByEmail(email: string) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const user = await db.collection('users').findOne({ email });
    
    if (!user) return null;
    
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}