import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Debugging Assets Connection...');
    
    const db = await getDatabase();
    const collection = await getCollection('assets');
    
    // Get basic info
    const dbName = db.databaseName;
    const allCollections = await db.listCollections().toArray();
    const assetsCollectionExists = allCollections.some(col => col.name === 'assets');
    
    // Count documents
    const totalAssets = await collection.countDocuments();
    const assetsByProject = await collection.aggregate([
      { $group: { _id: '$project_id', count: { $sum: 1 } } },
      { $project: { project_id: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Get sample data
    const sampleAssets = await collection.find({}).limit(3).toArray();
    
    // Test write operation if no assets exist
    let testWriteSuccess = false;
    if (totalAssets === 0) {
      const testAsset = {
        asset_id: `DEBUG-${Date.now()}`,
        project_id: 'TEST-PROJECT',
        project_name: 'Test Project',
        asset_type: 'Equipment',
        asset_name: 'Test Asset',
        provider_name: 'Test Provider',
        acquisition_date: new Date(),
        source_type: 'purchased',
        quantity: 1,
        unit_value: 1000,
        total_value: 1000,
        status: 'active',
        description: 'Test asset for debugging',
        location: 'Test Location',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(testAsset);
      testWriteSuccess = result.acknowledged;
      
      // Clean up
      if (testWriteSuccess) {
        await collection.deleteOne({ _id: result.insertedId });
      }
    }

    console.log('✅ Assets debug completed');

    return NextResponse.json({
      debug: {
        timestamp: new Date().toISOString(),
        type: 'assets_debug'
      },
      
      connection: {
        status: 'connected',
        database: dbName,
        collection: 'assets',
        collectionExists: assetsCollectionExists
      },
      
      data: {
        totalAssets,
        assetsByProject,
        sampleAssets: sampleAssets.map(asset => ({
          asset_id: asset.asset_id,
          project_id: asset.project_id,
          asset_name: asset.asset_name,
          asset_type: asset.asset_type,
          status: asset.status,
          total_value: asset.total_value
        }))
      },
      
      testResults: {
        writeOperation: testWriteSuccess ? '✅ Success' : 'Not tested (assets exist)',
        readOperation: '✅ Success'
      },
      
      environment: {
        MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
        DATABASE_NAME: process.env.DATABASE_NAME || 'Not set (using default: slp)'
      }
    });

  } catch (error: any) {
    console.error('❌ Assets debug failed:', error);
    
    return NextResponse.json({
      debug: {
        timestamp: new Date().toISOString(),
        type: 'assets_debug',
        status: 'error'
      },
      
      error: {
        message: error.message,
        code: error.code
      },
      
      connection: {
        status: 'failed',
        database: 'Unknown',
        collection: 'assets'
      },
      
      troubleshooting: [
        'Check if assets collection exists',
        'Verify database connection',
        'Check MongoDB Atlas network access'
      ]
    }, { status: 500 });
  }
}