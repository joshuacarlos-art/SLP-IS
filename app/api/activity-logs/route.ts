import { NextRequest, NextResponse } from 'next/server';

// Disable static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to safely get MongoDB connection
async function getMongoDB() {
  try {
    // Dynamic import to avoid build-time errors
    const { getCollection, checkMongoConnection } = await import('@/lib/mongodb');
    
    // Check if MongoDB is available
    const isConnected = await checkMongoConnection();
    if (!isConnected) {
      throw new Error('MongoDB connection failed');
    }
    
    return await getCollection('activityLogs');
  } catch (error) {
    console.error('MongoDB initialization error:', error);
    throw new Error('Database service unavailable');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const module = searchParams.get('module') || 'all';
    const status = searchParams.get('status') || 'all';

    const collection = await getMongoDB();

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
      id: activity._id?.toString() || '',
      timestamp: activity.timestamp ? new Date(activity.timestamp) : new Date(),
      user: activity.user || 'Unknown',
      action: activity.action || '',
      module: activity.module || 'General',
      details: activity.details || '',
      ipAddress: activity.ipAddress || 'Unknown',
      status: activity.status || 'success'
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
    
    // Return empty data instead of error during build
    if (process.env.NODE_ENV === 'production' && error instanceof Error && error.message.includes('MongoDB')) {
      return NextResponse.json({
        activities: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 20
        },
        message: 'Activity logs service is temporarily unavailable'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getMongoDB();

    const newActivity = {
      timestamp: new Date(),
      user: body.user || 'System',
      action: body.action || 'Unknown Action',
      module: body.module || 'General',
      details: body.details || '',
      ipAddress: body.ipAddress || request.headers.get('x-forwarded-for') || 'Unknown',
      status: body.status || 'success'
    };

    const result = await collection.insertOne(newActivity);

    return NextResponse.json({
      success: true,
      id: result.insertedId?.toString() || '',
      ...newActivity,
      message: 'Activity logged successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating activity log:', error);
    
    // Still return success even if logging fails (graceful degradation)
    return NextResponse.json({
      success: false,
      message: 'Activity logging service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 200 });
  }
}

export async function DELETE() {
  try {
    const collection = await getMongoDB();
    const result = await collection.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} activity logs`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error clearing activity logs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear activity logs',
        message: 'Database service unavailable'
      },
      { status: 503 }
    );
  }
}