import { MongoClient, Collection, Document, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Utility functions
export async function getDatabase(dbName?: string) {
  const client = await clientPromise;
  return client.db(dbName || process.env.DATABASE_NAME || 'slp');
}

export async function getCollection(collectionName: string, dbName?: string) {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}

// Function to safely convert string to ObjectId
export async function toObjectId(id: string): Promise<ObjectId> {
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

export function convertDocId(doc: any) {
  if (doc && doc._id && doc._id instanceof ObjectId) {
    return {
      ...doc,
      _id: doc._id.toString()
    };
  }
  return doc;
}

export function convertDocsIds(docs: any[]) {
  return docs.map(doc => convertDocId(doc));
}

// Helper to build query for string ID (handles both string _id and numeric id)
export async function buildIdQuery(id: string): Promise<any> {
  const numericId = parseInt(id, 10);
  const objectId = safeToObjectId(id);
  
  // Build query with multiple possibilities
  const query: any = { $or: [] };
  
  // Try numeric ID if valid number
  if (!isNaN(numericId)) {
    query.$or.push({ id: numericId });
  }
  
  // Try ObjectId if valid
  if (objectId) {
    query.$or.push({ _id: objectId });
  }
  
  // Try as string for other fields
  query.$or.push({ pig_tag_number: id });
  
  return query;
}

// Helper to find document by any ID format
export async function findDocument(collection: Collection, id: string): Promise<any> {
  const query = await buildIdQuery(id);
  return await collection.findOne(query);
}