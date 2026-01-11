import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing site_visits collection...');
    
    let siteVisitsCount = 0;
    let testInsertResult = null;
    
    try {
      const siteVisitsCollection = await getCollection('site_visits');
      siteVisitsCount = await siteVisitsCollection.countDocuments();
      console.log(`📝 Documents in site_visits: ${siteVisitsCount}`);
      
      // Insert a test document if collection is empty
      if (siteVisitsCount === 0) {
        const testDoc = {
          project_id: 'test-project-1',
          project_name: 'Test Swine Farming Project',
          association_name: 'Test Farmers Association 1',
          visit_number: 1,
          visit_date: new Date().toISOString().split('T')[0],
          status: 'completed',
          visit_purpose: 'Test visit for database setup',
          participants: ['Test Officer 1', 'Test Officer 2'],
          location: 'Test Location, Negros Occidental',
          findings: 'Test findings',
          recommendations: 'Test recommendations',
          next_steps: 'Test next steps',
          caretakers: [
            {
              id: '1',
              name: 'Test Caretaker',
              role: 'Test Manager',
              contact_number: '+639000000000',
              email: 'test@example.com',
              notes: 'Test notes'
            }
          ],
          created_by: 'System',
          created_at: new Date(),
          updated_at: new Date(),
          is_archived: false,
          test_record: true
        };
        
        const result = await siteVisitsCollection.insertOne(testDoc);
        testInsertResult = {
          insertedId: result.insertedId?.toString(),
          success: !!result.insertedId
        };
        console.log('✅ Test site visit inserted with ID:', result.insertedId);
      }
      
    } catch (error) {
      console.error('❌ Error accessing site_visits collection:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'site_visits collection does not exist or cannot be accessed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      collection: 'site_visits',
      count: siteVisitsCount,
      testInsert: testInsertResult,
      message: siteVisitsCount === 0 
        ? 'Test document inserted to create collection'
        : 'Collection already exists'
    });
    
  } catch (error) {
    console.error('❌ Site visits collection test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Site visits collection test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}