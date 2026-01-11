import clientPromise from '../mongodb'; // Adjust path based on your structure
import { ObjectId } from 'mongodb';

const dbName = process.env.DATABASE_NAME || 'slp';

// Caretaker operations
export async function getCaretakers(status?: string): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    let query = {};
    if (status && status !== 'all') {
      query = { status };
    }
    
    const caretakers = await db.collection('caretakers')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return caretakers.map((caretaker: any) => ({
      ...caretaker,
      _id: caretaker._id?.toString()
    }));
  } catch (error) {
    console.error('Error getting caretakers:', error);
    return [];
  }
}

export async function getCaretakerById(id: string): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    let caretaker;
    if (id.length === 24) {
      // MongoDB ObjectId
      const objectId = new ObjectId(id);
      caretaker = await db.collection('caretakers').findOne({ _id: objectId });
    } else {
      // Custom ID
      caretaker = await db.collection('caretakers').findOne({ id });
    }
    
    if (!caretaker) return null;
    
    return {
      ...caretaker,
      _id: caretaker._id?.toString()
    };
  } catch (error) {
    console.error('Error getting caretaker by id:', error);
    return null;
  }
}

export async function createCaretaker(caretakerData: any): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    const newCaretaker = {
      ...caretakerData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('caretakers').insertOne(newCaretaker);
    
    return {
      ...newCaretaker,
      _id: result.insertedId.toString()
    };
  } catch (error) {
    console.error('Error creating caretaker:', error);
    throw error;
  }
}

export async function updateCaretaker(id: string, updateData: any): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    const updateDoc = {
      ...updateData,
      updatedAt: new Date()
    };

    let result;
    if (id.length === 24) {
      const objectId = new ObjectId(id);
      result = await db.collection('caretakers').updateOne(
        { _id: objectId },
        { $set: updateDoc }
      );
    } else {
      result = await db.collection('caretakers').updateOne(
        { id },
        { $set: updateDoc }
      );
    }

    return result.matchedCount > 0;
  } catch (error) {
    console.error('Error updating caretaker:', error);
    return false;
  }
}

export async function deleteCaretaker(id: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    let result;
    if (id.length === 24) {
      const objectId = new ObjectId(id);
      result = await db.collection('caretakers').deleteOne({ _id: objectId });
    } else {
      result = await db.collection('caretakers').deleteOne({ id });
    }

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting caretaker:', error);
    return false;
  }
}

// Assessment operations
export async function getAssessments(caretakerId?: string): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    let query = {};
    if (caretakerId) {
      query = { caretakerId };
    }
    
    const assessments = await db.collection('assessments')
      .find(query)
      .sort({ assessmentDate: -1 })
      .toArray();
    
    return assessments.map((assessment: any) => ({
      ...assessment,
      _id: assessment._id?.toString()
    }));
  } catch (error) {
    console.error('Error getting assessments:', error);
    return [];
  }
}

export async function createAssessment(assessmentData: any): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    const newAssessment = {
      ...assessmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('assessments').insertOne(newAssessment);
    
    return {
      ...newAssessment,
      _id: result.insertedId.toString()
    };
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
}