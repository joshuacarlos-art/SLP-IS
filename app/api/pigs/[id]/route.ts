import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocId, safeToObjectId, findDocument } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Pig ID is required' }, { status: 400 });
    }

    const collection = await getCollection('pigs');
    
    // Use the helper function to find document
    const pig = await findDocument(collection, id);
    
    if (!pig || pig.is_archived) {
      return NextResponse.json({ error: 'Pig not found' }, { status: 404 });
    }

    // Convert for response
    const response = convertDocId(pig);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching pig:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pig record' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Pig ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const collection = await getCollection('pigs');
    
    // Find existing pig using helper
    const existingPig = await findDocument(collection, id);
    
    if (!existingPig || existingPig.is_archived) {
      return NextResponse.json({ error: 'Pig not found' }, { status: 404 });
    }

    // Check if tag number already exists (if changing tag number)
    if (body.pig_tag_number && body.pig_tag_number !== existingPig.pig_tag_number) {
      const duplicatePig = await collection.findOne({
        pig_tag_number: body.pig_tag_number,
        participant_id: existingPig.participant_id,
        is_archived: false,
        _id: { $ne: existingPig._id } // Use ObjectId comparison
      });
      
      if (duplicatePig) {
        return NextResponse.json(
          { error: 'A pig with this tag number already exists for this participant' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    // Helper to add fields conditionally
    const addField = (key: string, value: any, transform?: (val: any) => any) => {
      if (value !== undefined) {
        updateData[key] = transform ? transform(value) : value;
      }
    };

    addField('pig_tag_number', body.pig_tag_number);
    addField('breed', body.breed);
    addField('sex', body.sex);
    addField('birth_date', body.birth_date, (val) => val ? new Date(val) : null);
    addField('acquisition_date', body.acquisition_date, (val) => val ? new Date(val) : null);
    addField('acquisition_type', body.acquisition_type);
    addField('dam_tag', body.dam_tag);
    addField('sire_tag', body.sire_tag);
    addField('current_weight', body.current_weight, (val) => parseFloat(val) || 0);
    addField('health_status', body.health_status);
    addField('vaccination_status', body.vaccination_status);
    addField('feeding_program', body.feeding_program);
    addField('notes', body.notes);
    addField('cost_of_piglet', body.cost_of_piglet, (val) => parseFloat(val) || 0);
    updateData.updated_at = new Date();

    // Update using the existing pig's _id (ObjectId)
    const result = await collection.updateOne(
      { _id: existingPig._id },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No changes made' 
      });
    }

    // Get updated pig
    const updatedPig = await collection.findOne({ _id: existingPig._id });
    
    // Log activity if user_id provided
    if (body.user_id) {
      const activityCollection = await getCollection('activity_logs');
      await activityCollection.insertOne({
        user_id: parseInt(body.user_id) || 0,
        action: 'UPDATE',
        table_name: 'pig_records',
        record_id: existingPig.id || existingPig.pig_tag_number || id,
        old_values: {
          pig_tag_number: existingPig.pig_tag_number,
          breed: existingPig.breed,
          sex: existingPig.sex,
          birth_date: existingPig.birth_date,
          acquisition_date: existingPig.acquisition_date,
          acquisition_type: existingPig.acquisition_type,
          dam_tag: existingPig.dam_tag,
          sire_tag: existingPig.sire_tag,
          current_weight: existingPig.current_weight,
          health_status: existingPig.health_status,
          vaccination_status: existingPig.vaccination_status,
          feeding_program: existingPig.feeding_program,
          notes: existingPig.notes,
          cost_of_piglet: existingPig.cost_of_piglet
        },
        new_values: updateData,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date()
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pig updated successfully',
      data: convertDocId(updatedPig)
    });
  } catch (error: any) {
    console.error('Error updating pig:', error);
    return NextResponse.json(
      { error: 'Failed to update pig record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Pig ID is required' }, { status: 400 });
    }

    const collection = await getCollection('pigs');
    
    // Find pig using helper
    const pig = await findDocument(collection, id);
    
    if (!pig) {
      return NextResponse.json({ error: 'Pig not found' }, { status: 404 });
    }

    // Soft delete (archive) using the pig's _id (ObjectId)
    const result = await collection.updateOne(
      { _id: pig._id }, // Use ObjectId
      { 
        $set: { 
          is_archived: true,
          updated_at: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Pig not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pig archived successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting pig:', error);
    return NextResponse.json(
      { error: 'Failed to delete pig record' },
      { status: 500 }
    );
  }
}