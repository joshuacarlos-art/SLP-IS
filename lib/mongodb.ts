import { MongoClient, Collection, Document, ObjectId, Db, Filter } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

// Keep the old pattern for compatibility
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

interface MongoOptions {
  maxPoolSize: number;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
}

const options: MongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Initialize only if URI exists
if (uri) {
  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // Production mode
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Fallback - create a promise that will reject if used without URI
  clientPromise = Promise.reject(new Error('MONGODB_URI is not defined'));
}

// Export the promise directly for backward compatibility
export default clientPromise;

// Safe wrapper function (optional)
export function getClientPromise(): Promise<MongoClient> {
  return clientPromise;
}

// Utility functions
export async function getDatabase(dbName?: string): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  const client = await clientPromise;
  return client.db(dbName || process.env.DATABASE_NAME || 'slp');
}

export async function getCollection<T extends Document>(
  collectionName: string, 
  dbName?: string
): Promise<Collection<T>> {
  const db = await getDatabase(dbName);
  return db.collection<T>(collectionName);
}

// Function to safely convert string to ObjectId
export function toObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch {
    throw new Error('Invalid ID format');
  }
}

// Safe version that doesn't throw
export function safeToObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// Document type helpers
interface BaseDocument {
  [key: string]: unknown;
  _id?: ObjectId | string;
}

export interface DocumentWithStringId {
  [key: string]: unknown;
  _id?: string;
}

export function convertDocId<T extends BaseDocument>(doc: T | null): DocumentWithStringId | null {
  if (!doc) return null;
  
  if (doc._id && doc._id instanceof ObjectId) {
    const { _id, ...rest } = doc;
    return {
      ...rest,
      _id: _id.toString()
    };
  }
  return doc as DocumentWithStringId;
}

export function convertDocsIds<T extends BaseDocument>(docs: T[]): DocumentWithStringId[] {
  return docs.map(doc => convertDocId(doc)).filter(Boolean) as DocumentWithStringId[];
}

// Helper to build query for string ID
export function buildIdQuery(id: string): { $or: Filter<Document>[] } {
  const numericId = parseInt(id, 10);
  const objectId = safeToObjectId(id);
  
  // Build query with multiple possibilities
  const query = { $or: [] as Filter<Document>[] };
  
  // Try numeric ID if valid number
  if (!isNaN(numericId)) {
    query.$or.push({ id: numericId } as Filter<Document>);
  }
  
  // Try ObjectId if valid
  if (objectId) {
    query.$or.push({ _id: objectId } as Filter<Document>);
  }
  
  // Try as string for other fields
  query.$or.push({ pig_tag_number: id } as Filter<Document>);
  
  return query;
}

// Helper to find document by any ID format
export async function findDocument<T extends Document>(
  collection: Collection<T>, 
  id: string
): Promise<DocumentWithStringId | null> {
  const query = buildIdQuery(id);
  const doc = await collection.findOne(query as Filter<T>);
  return convertDocId(doc as BaseDocument | null);
}

// Check MongoDB connection health
export async function checkMongoConnection(): Promise<boolean> {
  try {
    if (!uri) {
      console.warn('MONGODB_URI is not defined');
      return false;
    }
    
    const client = await clientPromise;
    await client.db().admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB connection check failed:', error);
    return false;
  }
}