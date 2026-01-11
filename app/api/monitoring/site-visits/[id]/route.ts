import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocId, toObjectId } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    const collection = await getCollection('site_visits');
    
    let siteVisit;
    
    try {
      // First try to find by MongoDB ObjectId
      siteVisit = await collection.findOne({ _id: await toObjectId(id) });
    } catch {
      // If that fails, try to find by string id
      siteVisit = await collection.findOne({ id: id });
    }

    if (!siteVisit) {
      return NextResponse.json(
        { error: 'Site visit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(convertDocId(siteVisit));

  } catch (error) {
    console.error('Error fetching site visit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site visit' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    const collection = await getCollection('site_visits');
    
    let updateResult;
    
    try {
      // First try to update by MongoDB ObjectId
      updateResult = await collection.updateOne(
        { _id: await toObjectId(id) },
        { 
          $set: {
            ...body,
            updated_at: new Date()
          }
        }
      );
    } catch {
      // If that fails, try to update by string id
      updateResult = await collection.updateOne(
        { id: id },
        { 
          $set: {
            ...body,
            updated_at: new Date()
          }
        }
      );
    }

    if (updateResult.matchedCount === 0) {
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const collection = await getCollection('site_visits');
    
    let updateResult;
    
    try {
      // First try to soft delete by MongoDB ObjectId
      updateResult = await collection.updateOne(
        { _id: await toObjectId(id) },
        { 
          $set: {
            is_archived: true,
            archived_at: new Date(),
            updated_at: new Date()
          }
        }
      );
    } catch {
      // If that fails, try to soft delete by string id
      updateResult = await collection.updateOne(
        { id: id },
        { 
          $set: {
            is_archived: true,
            archived_at: new Date(),
            updated_at: new Date()
          }
        }
      );
    }

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Site visit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Site visit archived successfully' 
    });

  } catch (error) {
    console.error('Error archiving site visit:', error);
    return NextResponse.json(
      { error: 'Failed to archive site visit' },
      { status: 500 }
    );
  }
}