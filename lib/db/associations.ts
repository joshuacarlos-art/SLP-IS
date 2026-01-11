import { getCollection, toObjectId, convertDocId } from '@/lib/mongodb';

const COLLECTION_NAME = 'associations';

export interface Association {
  _id?: string;
  name: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
  dateFormulated: Date;
  activeMembers: number;
  inactiveMembers: number;
  location: string;
  contactPerson: string;
  contactNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getAssociations() {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const associations = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return associations.map(convertDocId);
  } catch (error) {
    console.error('Error in getAssociations:', error);
    throw error;
  }
}

export async function getAssociationById(id: string) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const queryId = await toObjectId(id);
    const association = await collection.findOne({ _id: queryId });
    return convertDocId(association);
  } catch (error) {
    console.error('Error in getAssociationById:', error);
    throw error;
  }
}

export async function createAssociation(associationData: Omit<Association, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const now = new Date();
    
    const association = {
      ...associationData,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await collection.insertOne(association);
    const newAssociation = await collection.findOne({ _id: result.insertedId });
    return convertDocId(newAssociation);
  } catch (error) {
    console.error('Error in createAssociation:', error);
    throw error;
  }
}

export async function updateAssociation(id: string, updateData: Partial<Association>) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const queryId = await toObjectId(id);
    
    const result = await collection.findOneAndUpdate(
      { _id: queryId },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return convertDocId(result);
  } catch (error) {
    console.error('Error in updateAssociation:', error);
    throw error;
  }
}
export async function archiveAssociation(id: string) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const queryId = await toObjectId(id);
    
    const result = await collection.findOneAndUpdate(
      { _id: queryId },
      { 
        $set: { 
          status: 'archived',
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return convertDocId(result);
  } catch (error) {
    console.error('Error in archiveAssociation:', error);
    throw error;
  }
}

export async function restoreAssociation(id: string) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const queryId = await toObjectId(id);
    
    const result = await collection.findOneAndUpdate(
      { _id: queryId },
      { 
        $set: { 
          status: 'active',
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return convertDocId(result);
  } catch (error) {
    console.error('Error in restoreAssociation:', error);
    throw error;
  }
}

export async function searchAssociations(query: string) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    
    const associations = await collection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { contactPerson: { $regex: query, $options: 'i' } },
        { contactNumber: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 }).toArray();
    
    return associations.map(convertDocId);
  } catch (error) {
    console.error('Error in searchAssociations:', error);
    throw error;
  }
}

export async function updateAssociationStatus(id: string, status: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived') {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const queryId = await toObjectId(id);
    
    const result = await collection.findOneAndUpdate(
      { _id: queryId },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return convertDocId(result);
  } catch (error) {
    console.error('Error in updateAssociationStatus:', error);
    throw error;
  }
}

export async function getAssociationsByStatus(status: string) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const associations = await collection.find({ status }).sort({ createdAt: -1 }).toArray();
    return associations.map(convertDocId);
  } catch (error) {
    console.error('Error in getAssociationsByStatus:', error);
    throw error;
  }
}

export async function deleteAssociation(id: string) {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const queryId = await toObjectId(id);
    
    const result = await collection.deleteOne({ _id: queryId });
    return result.deletedCount === 1;
  } catch (error) {
    console.error('Error in deleteAssociation:', error);
    throw error;
  }
}