import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const module = searchParams.get('module') || 'all';
    const status = searchParams.get('status') || 'all';

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('activityLogs');

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { user: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { module: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (module !== 'all') {
      filter.module = module;
    }
    
    if (status !== 'all') {
      filter.status = status;
    }

    const total = await collection.countDocuments(filter);
    const skip = (page - 1) * limit;

    const activities = await collection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedActivities = activities.map(activity => ({
      id: activity._id.toString(),
      timestamp: new Date(activity.timestamp),
      user: activity.user,
      action: activity.action,
      module: activity.module,
      details: activity.details,
      ipAddress: activity.ipAddress,
      status: activity.status
    }));

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('activityLogs');

    const newActivity = {
      timestamp: new Date(),
      user: body.user,
      action: body.action,
      module: body.module,
      details: body.details,
      ipAddress: body.ipAddress || 'Unknown',
      status: body.status || 'success'
    };

    const result = await collection.insertOne(newActivity);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newActivity
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('activityLogs');

    const result = await collection.deleteMany({});

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} activity logs`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error clearing activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear activity logs' },
      { status: 500 }
    );
  }
}