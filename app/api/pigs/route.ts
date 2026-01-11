import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const participantId = searchParams.get('participant_id');
    const projectId = searchParams.get('project_id');
    const healthStatus = searchParams.get('health_status');
    const search = searchParams.get('search');
    
    const collection = await getCollection('pigs');
    
    // Build query
    const query: any = { is_archived: false };
    
    if (participantId) {
      query.participant_id = parseInt(participantId);
    }
    
    if (projectId) {
      query.project_id = parseInt(projectId);
    }
    
    if (healthStatus && healthStatus !== 'all') {
      query.health_status = healthStatus;
    }
    
    if (search) {
      query.$or = [
        { pig_tag_number: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pigs = await collection.find(query).sort({ created_at: -1 }).toArray();
    
    // Get participant and caretaker info
    const participantsCollection = await getCollection('participants');
    const usersCollection = await getCollection('users');
    
    const enrichedPigs = await Promise.all(
      pigs.map(async (pig) => {
        let participantName = 'Unknown';
        let caretakerName = 'Unknown';
        
        if (pig.participant_id) {
          const participant = await participantsCollection.findOne({ id: pig.participant_id });
          if (participant) {
            const user = await usersCollection.findOne({ id: participant.user_id });
            if (user) {
              caretakerName = `${user.first_name} ${user.last_name}`;
              participantName = caretakerName;
            }
          }
        }
        
        return {
          id: pig.id || pig._id?.toString(),
          tagNumber: pig.pig_tag_number,
          breed: pig.breed,
          sex: pig.sex || 'unknown',
          healthStatus: pig.health_status,
          breedingStatus: pig.breeding_status || 'Not Ready',
          currentWeight: pig.current_weight,
          birthDate: pig.birth_date?.toISOString().split('T')[0],
          acquisitionDate: pig.acquisition_date?.toISOString().split('T')[0],
          acquisitionType: pig.acquisition_type,
          damTag: pig.dam_tag,
          sireTag: pig.sire_tag,
          vaccinationStatus: pig.vaccination_status,
          feedingProgram: pig.feeding_program,
          notes: pig.notes,
          cost: pig.cost_of_piglet,
          participantId: pig.participant_id,
          projectId: pig.project_id,
          participantName,
          caretakerName,
          createdAt: pig.created_at?.toISOString(),
          updatedAt: pig.updated_at?.toISOString()
        };
      })
    );
    
    return NextResponse.json(enrichedPigs);
  } catch (error) {
    console.error('Error fetching pigs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pig records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['pig_tag_number', 'breed', 'participant_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    const collection = await getCollection('pigs');
    
    // Check if tag number already exists for this participant
    const existingPig = await collection.findOne({ 
      pig_tag_number: body.pig_tag_number,
      participant_id: body.participant_id,
      is_archived: false
    });
    
    if (existingPig) {
      return NextResponse.json(
        { error: 'A pig with this tag number already exists for this participant' },
        { status: 400 }
      );
    }
    
    // Get next ID
    const lastPig = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const nextId = (lastPig[0]?.id || 0) + 1;
    
    const newPig = {
      id: nextId,
      pig_tag_number: body.pig_tag_number,
      breed: body.breed,
      sex: body.sex || 'unknown',
      birth_date: body.birth_date ? new Date(body.birth_date) : null,
      acquisition_date: body.acquisition_date ? new Date(body.acquisition_date) : null,
      acquisition_type: body.acquisition_type || 'Purchased',
      dam_tag: body.dam_tag,
      sire_tag: body.sire_tag,
      current_weight: parseFloat(body.current_weight) || 0,
      health_status: body.health_status || 'Healthy',
      vaccination_status: body.vaccination_status || 'Not Vaccinated',
      feeding_program: body.feeding_program || 'Standard',
      notes: body.notes,
      cost_of_piglet: parseFloat(body.cost_of_piglet) || 0,
      participant_id: parseInt(body.participant_id),
      project_id: body.project_id ? parseInt(body.project_id) : null,
      recorded_by: body.recorded_by ? parseInt(body.recorded_by) : null,
      is_archived: false,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await collection.insertOne(newPig);
    
    // Log activity
    if (newPig.recorded_by) {
      const activityCollection = await getCollection('activity_logs');
      await activityCollection.insertOne({
        user_id: newPig.recorded_by,
        action: 'INSERT',
        table_name: 'pig_records',
        record_id: nextId,
        new_values: newPig,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date()
      });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Pig added successfully',
      pig_id: nextId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pig:', error);
    return NextResponse.json(
      { error: 'Failed to create pig record' },
      { status: 500 }
    );
  }
}