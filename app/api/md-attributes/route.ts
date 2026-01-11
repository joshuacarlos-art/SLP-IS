import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds, toObjectId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching MD attributes...');
    
    const collection = await getCollection('md_attributes');
    
    const mdAttributes = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    console.log(`✅ Found ${mdAttributes.length} MD attributes`);
    
    const convertedAttributes = convertDocsIds(mdAttributes);
    
    return NextResponse.json(convertedAttributes);
    
  } catch (error: any) {
    console.error('❌ Error fetching MD attributes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MD attributes', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const mdCollection = await getCollection('md_attributes');
    const projectsCollection = await getCollection('projects');
    
    const body = await request.json();
    
    // Validate that the project exists
    let project;
    try {
      // Try to find by ObjectId first
      project = await projectsCollection.findOne({ 
        _id: await toObjectId(body.project_id)
      });
    } catch {
      // If ObjectId fails, try to find by string ID
      project = await projectsCollection.findOne({ 
        $or: [
          { id: body.project_id },
          { _id: body.project_id }
        ]
      });
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Generate a new ID
    const count = await mdCollection.countDocuments();
    const newId = `MDA-${String(count + 1).padStart(3, '0')}`;
    
    const totalScore = body.market_demand_score + body.market_supply_score + 
                      body.enterprise_plan_score + body.financial_stability_score;
    
    const newAttribute = {
      id: newId,
      project_id: body.project_id,
      assessment_date: body.assessment_date,
      market_demand_score: body.market_demand_score,
      market_demand_remarks: body.market_demand_remarks,
      market_supply_score: body.market_supply_score,
      market_supply_remarks: body.market_supply_remarks,
      enterprise_plan_score: body.enterprise_plan_score,
      enterprise_plan_remarks: body.enterprise_plan_remarks,
      financial_stability_score: body.financial_stability_score,
      financial_stability_remarks: body.financial_stability_remarks,
      total_score: totalScore,
      livelihood_status: body.livelihood_status,
      assessed_by: body.assessed_by,
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      is_archived: body.is_archived || false
    };

    const result = await mdCollection.insertOne(newAttribute);
    
    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...newAttribute
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating MD attribute:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const collection = await getCollection('md_attributes');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'MD Attribute ID is required' }, { status: 400 });
    }

    const body = await request.json();

    const totalScore = body.market_demand_score + body.market_supply_score + 
                      body.enterprise_plan_score + body.financial_stability_score;

    const updateData = {
      project_id: body.project_id,
      assessment_date: body.assessment_date,
      market_demand_score: body.market_demand_score,
      market_demand_remarks: body.market_demand_remarks,
      market_supply_score: body.market_supply_score,
      market_supply_remarks: body.market_supply_remarks,
      enterprise_plan_score: body.enterprise_plan_score,
      enterprise_plan_remarks: body.enterprise_plan_remarks,
      financial_stability_score: body.financial_stability_score,
      financial_stability_remarks: body.financial_stability_remarks,
      total_score: totalScore,
      livelihood_status: body.livelihood_status,
      assessed_by: body.assessed_by,
      is_archived: body.is_archived,
      updatedAt: new Date().toISOString()
    };

    let result;
    try {
      // Try to update by ObjectId first
      result = await collection.findOneAndUpdate(
        { _id: await toObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
    } catch {
      // If ObjectId fails, try to update by string ID
      result = await collection.findOneAndUpdate(
        { id: id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
    }

    if (!result) {
      return NextResponse.json({ error: 'MD Attribute not found' }, { status: 404 });
    }

    const convertedResult = {
      ...result,
      _id: result._id.toString()
    };

    return NextResponse.json(convertedResult);

  } catch (error: any) {
    console.error('Error updating MD attribute:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const collection = await getCollection('md_attributes');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'MD Attribute ID is required' }, { status: 400 });
    }

    let result;
    try {
      // Try to delete by ObjectId first
      result = await collection.findOneAndDelete({
        _id: await toObjectId(id)
      });
    } catch {
      // If ObjectId fails, try to delete by string ID
      result = await collection.findOneAndDelete({
        id: id
      });
    }

    if (!result) {
      return NextResponse.json({ error: 'MD Attribute not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'MD Attribute deleted successfully',
      deletedId: id
    });

  } catch (error: any) {
    console.error('Error deleting MD attribute:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}