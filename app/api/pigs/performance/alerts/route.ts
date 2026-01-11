import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pigId = searchParams.get('pigId');
    
    const collection = await getCollection('pig_alerts');
    
    // Create query object
    const query: any = { resolved: false };
    
    if (pigId) {
      query.pig_id = pigId;
    }
    
    const alerts = await collection.find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    return NextResponse.json(convertDocsIds(alerts));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.pig_id || !body.alert_type || !body.message) {
      return NextResponse.json(
        { error: 'pig_id, alert_type, and message are required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('pig_alerts');
    
    // Get next ID
    const lastAlert = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const nextId = (lastAlert[0]?.id || 0) + 1;
    
    const newAlert = {
      id: nextId,
      pig_id: body.pig_id,
      pig_tag_number: body.pig_tag_number,
      alert_type: body.alert_type, // 'health', 'feeding', 'weight', 'breeding'
      severity: body.severity || 'medium', // 'low', 'medium', 'high', 'critical'
      message: body.message,
      details: body.details,
      suggested_action: body.suggested_action,
      resolved: false,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await collection.insertOne(newAlert);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Alert created successfully',
      alert_id: nextId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const alertId = body.alertId;
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('pig_alerts');
    const result = await collection.updateOne(
      { id: alertId },
      { 
        $set: { 
          resolved: true, 
          resolved_at: new Date(), 
          updated_at: new Date(),
          resolved_by: body.resolved_by,
          resolution_notes: body.resolution_notes
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    console.error('Error resolving alert:', error);
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    );
  }
}