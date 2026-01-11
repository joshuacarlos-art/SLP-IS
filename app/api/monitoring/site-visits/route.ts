import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds, convertDocId, toObjectId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');
    const visitNumber = searchParams.get('visit_number');
    const associationName = searchParams.get('association_name');

    const collection = await getCollection('site_visits');
    
    // Build filter
    const filter: any = { is_archived: { $ne: true } };
    
    if (projectId) {
      filter.project_id = projectId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (visitNumber) {
      filter.visit_number = parseInt(visitNumber);
    }
    
    if (associationName) {
      filter.association_name = associationName;
    }

    // Get site visits
    const siteVisits = await collection
      .find(filter)
      .sort({ visit_date: -1, visit_number: 1 })
      .toArray();

    // Convert MongoDB _id to string
    const convertedSiteVisits = convertDocsIds(siteVisits);
    
    return NextResponse.json(convertedSiteVisits);

  } catch (error) {
    console.error('Error fetching site visits:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['project_id', 'visit_number', 'visit_date', 'status', 'visit_purpose', 'location', 'association_name'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const collection = await getCollection('site_visits');
    
    // Get project details to populate project_name
    const projectsCollection = await getCollection('projects');
    let project;
    
    try {
      project = await projectsCollection.findOne({ _id: await toObjectId(body.project_id) });
    } catch {
      project = await projectsCollection.findOne({ id: body.project_id });
    }

    let project_name = 'Unknown Project';

    if (project) {
      project_name = project.projectName || project.enterpriseSetup?.projectName || 'Unknown Project';
    }

    // Prepare the site visit document
    const siteVisitData = {
      project_id: body.project_id,
      project_name,
      association_name: body.association_name,
      visit_number: body.visit_number,
      visit_date: body.visit_date,
      status: body.status,
      visit_purpose: body.visit_purpose,
      participants: body.participants || [],
      location: body.location,
      findings: body.findings || '',
      recommendations: body.recommendations || '',
      next_steps: body.next_steps || '',
      caretakers: body.caretakers || [],
      assigned_caretaker_id: body.assigned_caretaker_id || '',
      created_by: body.created_by || 'Admin User',
      created_at: new Date(),
      updated_at: new Date(),
      is_archived: false
    };

    // Insert the site visit
    const result = await collection.insertOne(siteVisitData);
    
    // Get the created document
    const createdSiteVisit = await collection.findOne({ _id: result.insertedId });
    
    if (!createdSiteVisit) {
      throw new Error('Failed to retrieve created site visit');
    }

    return NextResponse.json(convertDocId(createdSiteVisit), { status: 201 });

  } catch (error) {
    console.error('Error creating site visit:', error);
    return NextResponse.json(
      { error: 'Failed to create site visit' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const collection = await getCollection('site_visits');
    
    // If project_id is being updated, get updated project details
    if (body.project_id) {
      const projectsCollection = await getCollection('projects');
      let project;
      
      try {
        project = await projectsCollection.findOne({ _id: await toObjectId(body.project_id) });
      } catch {
        project = await projectsCollection.findOne({ id: body.project_id });
      }

      if (project) {
        body.project_name = project.projectName || project.enterpriseSetup?.projectName || 'Unknown Project';
      }
    }

    // Update the document
    const updateData: any = {
      project_id: body.project_id,
      project_name: body.project_name,
      association_name: body.association_name,
      visit_number: body.visit_number,
      visit_date: body.visit_date,
      status: body.status,
      visit_purpose: body.visit_purpose,
      participants: body.participants,
      location: body.location,
      findings: body.findings,
      recommendations: body.recommendations,
      next_steps: body.next_steps,
      caretakers: body.caretakers,
      assigned_caretaker_id: body.assigned_caretaker_id,
      updated_at: new Date()
    };

    // Remove any undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    let result;
    try {
      result = await collection.updateOne(
        { _id: await toObjectId(id) },
        { $set: updateData }
      );
    } catch {
      result = await collection.updateOne(
        { id: id },
        { $set: updateData }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Site visit not found' },
        { status: 404 }
      );
    }

    // Get the updated document
    let updatedSiteVisit;
    try {
      updatedSiteVisit = await collection.findOne({ _id: await toObjectId(id) });
    } catch {
      updatedSiteVisit = await collection.findOne({ id: id });
    }
    
    if (!updatedSiteVisit) {
      throw new Error('Failed to retrieve updated site visit');
    }

    return NextResponse.json(convertDocId(updatedSiteVisit));

  } catch (error) {
    console.error('Error updating site visit:', error);
    return NextResponse.json(
      { error: 'Failed to update site visit' },
      { status: 500 }
    );
  }
}