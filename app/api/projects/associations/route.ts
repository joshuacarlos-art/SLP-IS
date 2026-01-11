import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds, toObjectId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const associationIds = searchParams.get('associationIds');
    
    const associationsCollection = await getCollection('associations');
    let associations: any[] = [];
    
    if (associationIds) {
      // Handle multiple association IDs
      const ids = associationIds.split(',');
      const objectIds = [];
      
      for (const id of ids) {
        try {
          const objectId = await toObjectId(id);
          objectIds.push(objectId);
        } catch (error) {
          console.warn(`Invalid association ID: ${id}`);
        }
      }
      
      if (objectIds.length > 0) {
        associations = await associationsCollection.find({
          _id: { $in: objectIds },
          archived: { $ne: true }
        }).toArray();
      }
    } else if (projectId) {
      // Get associations for a specific project
      const projectsCollection = await getCollection('projects');
      
      try {
        const projectObjectId = await toObjectId(projectId);
        const project = await projectsCollection.findOne({ _id: projectObjectId });
        
        if (project && project.associationId) {
          const associationObjectId = await toObjectId(project.associationId);
          const association = await associationsCollection.findOne({ 
            _id: associationObjectId,
            archived: { $ne: true }
          });
          
          if (association) {
            associations = [association];
          }
        }
      } catch (error) {
        console.error('Error fetching project associations:', error);
      }
    } else {
      // Get all active associations
      associations = await associationsCollection.find({
        archived: { $ne: true }
      }).toArray();
    }
    
    const formattedAssociations = convertDocsIds(associations);
    return NextResponse.json(formattedAssociations);
  } catch (error) {
    console.error('Error fetching associations for projects:', error);
    return NextResponse.json({ error: 'Failed to fetch associations' }, { status: 500 });
  }
}