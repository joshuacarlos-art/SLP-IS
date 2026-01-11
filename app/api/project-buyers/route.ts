import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'your-database-name';
const COLLECTION_NAME = 'project_buyers';

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Return single project buyer
      const project = await collection.findOne({ 
        $or: [
          { _id: new ObjectId(id) },
          { project_id: id }
        ]
      });
      
      if (!project) {
        return NextResponse.json({ error: 'Project buyer not found' }, { status: 404 });
      }
      return NextResponse.json(project);
    }

    // Return all project buyers
    const projects = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(projects);

  } catch (error) {
    console.error('Error fetching project buyers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const body = await request.json();
    
    // Generate a new project ID
    const count = await collection.countDocuments();
    const newProjectId = `PROJ-${String(count + 1).padStart(3, '0')}`;
    
    const newProject = {
      project_id: newProjectId,
      project_name: body.project_name,
      buyer_name: body.buyer_name,
      type: body.type,
      engagement_start_date: body.engagement_start_date,
      verification_method: body.verification_method,
      active: body.active,
      contact_person: body.contact_person,
      contact_email: body.contact_email,
      contact_number: body.contact_number,
      contract_value: body.contract_value ? parseFloat(body.contract_value) : undefined,
      project_status: body.project_status,
      address: body.address,
      description: body.description,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newProject);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...newProject
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project buyer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function PUT(request: NextRequest) {
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const updateData = {
      project_name: body.project_name,
      buyer_name: body.buyer_name,
      type: body.type,
      engagement_start_date: body.engagement_start_date,
      verification_method: body.verification_method,
      active: body.active,
      contact_person: body.contact_person,
      contact_email: body.contact_email,
      contact_number: body.contact_number,
      contract_value: body.contract_value ? parseFloat(body.contract_value) : undefined,
      project_status: body.project_status,
      address: body.address,
      description: body.description,
      updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
      { 
        $or: [
          { _id: new ObjectId(id) },
          { project_id: id }
        ]
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Project buyer not found' }, { status: 404 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error updating project buyer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function DELETE(request: NextRequest) {
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const result = await collection.findOneAndDelete({
      $or: [
        { _id: new ObjectId(id) },
        { project_id: id }
      ]
    });

    if (!result) {
      return NextResponse.json({ error: 'Project buyer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project buyer deleted successfully' });

  } catch (error) {
    console.error('Error deleting project buyer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}