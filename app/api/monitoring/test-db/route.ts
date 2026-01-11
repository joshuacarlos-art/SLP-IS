import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing MongoDB Atlas connection...');
    console.log('🔗 Using URI:', process.env.MONGODB_URI?.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@'));
    console.log('🏷️ Database name:', process.env.DATABASE_NAME);
    
    // Test if we can connect to monitoringRecords
    let monitoringCount = 0;
    let projectsCount = 0;
    let associationsCount = 0;
    
    try {
      const monitoringCollection = await getCollection('monitoringRecords');
      monitoringCount = await monitoringCollection.countDocuments();
      console.log(`📊 Documents in monitoringRecords: ${monitoringCount}`);
    } catch (error) {
      console.error('❌ Error accessing monitoringRecords:', error);
    }
    
    try {
      const projectsCollection = await getCollection('projects');
      projectsCount = await projectsCollection.countDocuments();
      console.log(`📋 Documents in projects: ${projectsCount}`);
    } catch (error) {
      console.error('❌ Error accessing projects:', error);
    }
    
    try {
      const associationsCollection = await getCollection('associations');
      associationsCount = await associationsCollection.countDocuments();
      console.log(`🏢 Documents in associations: ${associationsCount}`);
    } catch (error) {
      console.error('❌ Error accessing associations:', error);
    }
    
    // Try to insert a test document
    let testInsertResult = null;
    try {
      const monitoringCollection = await getCollection('monitoringRecords');
      
      const testDoc = {
        project_id: 'test-project-db',
        monitoring_date: new Date().toISOString().split('T')[0],
        monitoring_year: new Date().getFullYear(),
        monitoring_frequency: 'monthly',
        field_officer_id: 'TEST_DB',
        monitoring_type: 'test',
        monthly_gross_sales: 1000,
        monthly_cost_of_sales: 500,
        monthly_gross_profit: 500,
        monthly_operating_expenses: 200,
        monthly_net_income: 300,
        status: 'completed',
        verification_methods: 'Database Test',
        notes_remarks: 'This is a test record created by the database test API',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false,
        test_record: true
      };
      
      const result = await monitoringCollection.insertOne(testDoc);
      testInsertResult = {
        insertedId: result.insertedId?.toString(),
        success: !!result.insertedId
      };
      console.log('✅ Test document inserted with ID:', result.insertedId);
      
    } catch (insertError) {
      console.error('❌ Error inserting test document:', insertError);
      testInsertResult = {
        error: insertError instanceof Error ? insertError.message : 'Unknown error',
        success: false
      };
    }
    
    return NextResponse.json({
      success: true,
      connection: {
        database: process.env.DATABASE_NAME || 'slp',
        uriPresent: !!process.env.MONGODB_URI,
        databaseNamePresent: !!process.env.DATABASE_NAME
      },
      collections: {
        monitoringRecords: monitoringCount,
        projects: projectsCount,
        associations: associationsCount
      },
      testInsert: testInsertResult,
      message: 'MongoDB Atlas connection test completed'
    });
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'MongoDB Atlas connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        connection: {
          database: process.env.DATABASE_NAME || 'slp',
          uriPresent: !!process.env.MONGODB_URI,
          databaseNamePresent: !!process.env.DATABASE_NAME
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'create-collections') {
      console.log('📁 Creating collections if they dont exist...');
      
      // Just accessing the collections will create them if they don't exist
      const monitoringCollection = await getCollection('monitoringRecords');
      const projectsCollection = await getCollection('projects');
      const associationsCollection = await getCollection('associations');
      
      // Insert sample data to ensure collections are created
      const sampleMonitoring = {
        project_id: 'sample-project-1',
        monitoring_date: '2024-01-01',
        monitoring_year: 2024,
        monitoring_frequency: 'monthly',
        field_officer_id: 'SAMPLE_FO',
        monitoring_type: 'routine',
        monthly_gross_sales: 50000,
        monthly_cost_of_sales: 30000,
        monthly_gross_profit: 20000,
        monthly_operating_expenses: 15000,
        monthly_net_income: 5000,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false,
        sample_data: true
      };
      
      await monitoringCollection.insertOne(sampleMonitoring);
      
      return NextResponse.json({
        success: true,
        message: 'Collections created with sample data',
        collections: ['monitoringRecords', 'projects', 'associations']
      });
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create collections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 Cleaning up test and sample records...');
    
    const monitoringCollection = await getCollection('monitoringRecords');
    
    // Delete all test and sample records
    const result = await monitoringCollection.deleteMany({
      $or: [
        { test_record: true },
        { sample_data: true }
      ]
    });
    
    console.log(`🗑️ Deleted ${result.deletedCount} test/sample records`);
    
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} test/sample records`
    });
    
  } catch (error) {
    console.error('❌ Error cleaning up records:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clean up records',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}