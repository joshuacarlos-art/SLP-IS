// lib/db/pigs.ts
import { getCollection } from '../mongodb'; // Changed from './mongodb' to '../mongodb'

const COLLECTION_NAME = 'pigs';

export interface Pig {
  _id?: string;
  earTag: string;
  status: 'active' | 'sold' | 'deceased' | 'transferred';
  breed: string;
  dateOfBirth: Date;
  weight: number;
  associationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPigs() {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const pigs = await collection.find({}).toArray();
    
    return pigs.map(pig => ({
      ...pig,
      _id: pig._id.toString()
    }));
  } catch (error) {
    console.error('Error in getPigs:', error);
    throw error;
  }
}

export async function createPig(pigData: Omit<Pig, '_id'>) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    
    const newPig = {
      ...pigData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(newPig);
    
    return {
      ...newPig,
      _id: result.insertedId.toString()
    };
  } catch (error) {
    console.error('Error in createPig:', error);
    throw error;
  }
}

export async function getPigById(id: string) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const { ObjectId } = await import('mongodb');
    
    const pig = await collection.findOne({ _id: new ObjectId(id) });
    
    if (pig && pig._id) {
      return {
        ...pig,
        _id: pig._id.toString()
      };
    }
    
    return pig;
  } catch (error) {
    console.error('Error in getPigById:', error);
    throw error;
  }
}