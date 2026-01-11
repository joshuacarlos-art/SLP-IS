  import { NextRequest, NextResponse } from 'next/server';
  import { getCollection, toObjectId } from '@/lib/mongodb';

  export async function PATCH(request: NextRequest) {
    try {
      const associationsCollection = await getCollection('associations');
      const { id } = await request.json(); // Get ID from request body

      console.log('🔍 [ARCHIVE API] Archiving association ID:', id);

      if (!id) {
        return NextResponse.json(
          { error: 'Association ID is required in request body' },
          { status: 400 }
        );
      }

      const objectId = await toObjectId(id);
      
      const result = await associationsCollection.updateOne(
        { _id: objectId },
        { 
          $set: { 
            status: 'archived',
            archived: true,
            updated_at: new Date()
          }
        }
      );

      console.log('🔍 [ARCHIVE API] MongoDB update result:', result);

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
          { error: 'Failed to fetch archived association' },
          { status: 500 }
        );
      }

      console.log('✅ [ARCHIVE API] Archive successful:', updatedAssociation);
      return NextResponse.json(updatedAssociation);
    } catch (error) {
      console.error('❌ [ARCHIVE API] Error archiving association:', error);
      return NextResponse.json(
        { error: 'Failed to archive association' },
        { status: 500 }
      );
    }
  }