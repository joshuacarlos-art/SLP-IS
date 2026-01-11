import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId } from '@/lib/mongodb';
import { UpdateAssociationInput } from '@/types/association';

export async function PUT(request: NextRequest) {
  try {
    const associationsCollection = await getCollection('associations');
    const body = await request.json();
    
    console.log('🔍 [UPDATE API] Received request:', body);

    // Extract ID from the request body
    const { id, ...updateData } = body;

    if (!id) {
      console.error('❌ [UPDATE API] No ID provided in request body');
      return NextResponse.json(
        { error: 'Association ID is required in request body' },
        { status: 400 }
      );
    }

    console.log('🔍 [UPDATE API] Updating association ID:', id);
    console.log('🔍 [UPDATE API] Update data:', updateData);

    const objectId = await toObjectId(id);
    
    // Handle date conversion if date_formulated is provided
    if (updateData.date_formulated) {
      updateData.date_formulated = new Date(updateData.date_formulated);
    }
    
    // Add updated_at timestamp
    const updateDocument = {
      $set: {
        ...updateData,
        updated_at: new Date()
      }
    };

    console.log('🔍 [UPDATE API] Update document:', updateDocument);

    const result = await associationsCollection.updateOne(
      { _id: objectId },
      updateDocument
    );

    console.log('🔍 [UPDATE API] MongoDB update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Association not found' },
        { status: 404 }
      );
    }

    // Fetch the updated document
    const updatedAssociation = await associationsCollection.findOne({ _id: objectId });
    
    if (!updatedAssociation) {
      return NextResponse.json(
        { error: 'Failed to fetch updated association' },
        { status: 500 }
      );
    }

    console.log('✅ [UPDATE API] Update successful:', updatedAssociation);
    return NextResponse.json(updatedAssociation);
  } catch (error) {
    console.error('❌ [UPDATE API] Error updating association:', error);
    return NextResponse.json(
      { error: 'Failed to update association' },
      { status: 500 }
    );
  }
}