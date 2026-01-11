import { getCollection, convertDocId, convertDocsIds, toObjectId } from './mongodb';
import { ObjectId } from 'mongodb';
import { Association } from '@/types/project';

export const formatAssociationForProject = (association: any) => {
  return {
    id: association._id || association.id,
    name: association.name,
    location: association.location,
    no_active_members: association.no_active_members || 0,
    no_inactive_members: association.no_inactive_members || 0,
    contact_person: association.contact_person,
    contact_number: association.contact_number,
    email: association.email,
    status: association.status,
    region: association.region || '',
    province: association.province || '',
    date_formulated: association.date_formulated,
    operational_reason: association.operational_reason,
    covid_affected: association.covid_affected || false,
    profit_sharing: association.profit_sharing || false,
    profit_sharing_amount: association.profit_sharing_amount || 0,
    loan_scheme: association.loan_scheme || false,
    loan_scheme_amount: association.loan_scheme_amount || 0,
    registrations_certifications: association.registrations_certifications || [],
    final_org_adjectival_rating: association.final_org_adjectival_rating || '',
    final_org_rating_assessment: association.final_org_rating_assessment || '',
  };
};

export const getMultipleAssociationsData = async (associationIds: string[]) => {
  try {
    if (!associationIds || associationIds.length === 0) return [];
    
    const associationsCollection = await getCollection('associations');
    const objectIds: ObjectId[] = [];
    
    for (const id of associationIds) {
      try {
        const objectId = await toObjectId(id);
        objectIds.push(objectId);
      } catch (error) {
        console.warn(`Invalid association ID: ${id}`);
      }
    }
    
    if (objectIds.length === 0) return [];
    
    const associations = await associationsCollection.find({
      _id: { $in: objectIds },
      archived: { $ne: true }
    }).toArray();
    
    return convertDocsIds(associations).map(formatAssociationForProject);
  } catch (error) {
    console.error('Error fetching multiple associations:', error);
    return [];
  }
};

export const enrichProjectWithAssociations = async (project: any, allAssociations: Association[] = []) => {
  try {
    // Handle multiple associations from operationalInformation
    const multipleAssociations = project.operationalInformation?.multipleAssociations || [];
    
    let associationData: any[] = [];
    
    if (multipleAssociations.length > 0) {
      // Use the provided multiple associations data
      associationData = multipleAssociations;
    } else if (project.associationId) {
      // Fallback to single association lookup
      const association = allAssociations.find(assoc => 
        assoc._id === project.associationId || assoc.id === project.associationId
      );
      if (association) {
        associationData = [formatAssociationForProject(association)];
      }
    }
    
    const associationNames = associationData.map((assoc: any) => assoc.name);
    const associationIds = associationData.map((assoc: any) => assoc.id);
    
    return {
      ...project,
      associationNames,
      associationIds,
      multipleAssociations: associationData,
      associationName: associationNames.join(', '),
      associationLocation: associationData[0]?.location || '',
      associationRegion: associationData[0]?.region || project.enterpriseSetup?.region || '',
      associationProvince: associationData[0]?.province || project.enterpriseSetup?.province || '',
    };
  } catch (error) {
    console.error('Error enriching project with associations:', error);
    return project;
  }
};

export const updateAssociationMemberCount = async (associationId: string, increment: boolean = true) => {
  try {
    const associationsCollection = await getCollection('associations');
    const objectId = await toObjectId(associationId);
    
    const update = increment 
      ? { $inc: { no_active_members: 1 } }
      : { $inc: { no_active_members: -1 } };
    
    const result = await associationsCollection.findOneAndUpdate(
      { _id: objectId },
      update,
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Association not found');
    }
    
    return convertDocId(result);
  } catch (error) {
    console.error('Error updating association member count:', error);
    throw error;
  }
};