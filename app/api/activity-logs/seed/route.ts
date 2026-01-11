import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('activityLogs');

    const sampleActivities = [
      {
        timestamp: new Date(),
        user: 'admin',
        action: 'login',
        module: 'Authentication',
        details: 'User logged in successfully',
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        user: 'john.doe',
        action: 'create_user',
        module: 'User Management',
        details: 'Created new user account',
        ipAddress: '192.168.1.101',
        status: 'success'
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        user: 'system',
        action: 'database_backup',
        module: 'System',
        details: 'Nightly database backup completed',
        ipAddress: 'localhost',
        status: 'success'
      },
      {
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: 'jane.smith',
        action: 'update_association',
        module: 'Associations',
        details: 'Updated association details for ABC Association',
        ipAddress: '192.168.1.102',
        status: 'success'
      },
      {
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        user: 'system',
        action: 'error',
        module: 'Database',
        details: 'Failed to connect to external service',
        ipAddress: 'localhost',
        status: 'error'
      },
      {
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        user: 'admin',
        action: 'export_data',
        module: 'Reports',
        details: 'Exported user report as CSV',
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'bob.wilson',
        action: 'create_association',
        module: 'Associations',
        details: 'Created new association: Community Helpers',
        ipAddress: '192.168.1.103',
        status: 'success'
      },
      {
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        user: 'system',
        action: 'warning',
        module: 'System',
        details: 'High memory usage detected',
        ipAddress: 'localhost',
        status: 'warning'
      }
    ];

    // Clear existing data first
    await collection.deleteMany({});
    
    // Insert new sample data
    const result = await collection.insertMany(sampleActivities);

    return NextResponse.json({
      message: 'Sample activities seeded successfully',
      insertedCount: result.insertedCount,
      totalActivities: sampleActivities.length
    });

  } catch (error) {
    console.error('Error seeding activities:', error);
    return NextResponse.json(
      { error: 'Failed to seed activities' },
      { status: 500 }
    );
  }
}