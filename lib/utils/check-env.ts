export function checkEnvironmentVariables(): string[] {
  const missingVars: string[] = [];
  
  // Required environment variables
  const requiredVars = [
    'MONGODB_URI',
    'DATABASE_NAME',
    'NEXTAUTH_SECRET',
    'GMAIL_USER',
    'GMAIL_APP_PASSWORD',
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  return missingVars;
}

export function logEnvironmentStatus(): void {
  const missing = checkEnvironmentVariables();
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing);
    console.warn('Please check your .env.local file');
  } else {
    console.log('✅ All required environment variables are set');
  }
  
  // Log MongoDB connection status (without password)
  if (process.env.MONGODB_URI) {
    const uri = process.env.MONGODB_URI;
    const maskedUri = uri.replace(/:\/\/.*@/, '://****:****@');
    console.log(`📦 MongoDB URI: ${maskedUri}`);
  }
  
  // Log database name
  console.log(`🗃️ Database: ${process.env.DATABASE_NAME || 'slp'}`);
}