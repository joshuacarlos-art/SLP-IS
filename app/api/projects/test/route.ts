import { NextResponse } from 'next/server';
import { getCollection, toObjectId } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🧪 Projects API Test: Starting comprehensive test');
    
    const projectsCollection = await getCollection('projects');
    
    // Test 1: Count projects
    const projectCount = await projectsCollection.countDocuments();
    console.log('📊 Test 1 - Project count:', projectCount);
    
    // Test 2: Get a sample project
    const sampleProject = await projectsCollection.findOne();
    console.log('📄 Test 2 - Sample project:', sampleProject ? 'Found' : 'Not found');
    
    // Test 3: Test ObjectId conversion
    let objectIdTest = 'Failed';
    if (sampleProject) {
      try {
        const testId = await toObjectId(sampleProject._id.toString());
        objectIdTest = 'Success';
      } catch (error) {
        objectIdTest = 'Failed: ' + error;
      }
    }
    
    console.log('🔑 Test 3 - ObjectId conversion:', objectIdTest);
    
    return NextResponse.json({
      success: true,
      tests: {
        databaseConnection: 'Success',
        projectCount: projectCount,
        sampleProject: sampleProject ? 'Available' : 'None',
        objectIdConversion: objectIdTest,
        timestamp: new Date().toISOString()
      },
      sampleProjectId: sampleProject?._id.toString(),
      message: 'Projects API test completed'
    });
    
  } catch (error) {
    console.error('💥 Projects API Test: Comprehensive test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: `Comprehensive test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}