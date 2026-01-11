import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching assets from MongoDB...');
    
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const asset_type = searchParams.get('asset_type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    const collection = await getCollection('assets');
    
    // Build query
    let query: any = {};
    
    if (project_id) {
      query.project_id = project_id;
    }
    
    if (asset_type) {
      query.asset_type = { $regex: asset_type, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }
    
    const [assets, totalCount] = await Promise.all([
      collection.find(query)
        .sort({ acquisition_date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    const convertedAssets = convertDocsIds(assets);
    
    console.log('📋 Assets fetched:', convertedAssets.length);
    
    return NextResponse.json(convertedAssets);

  } catch (error: any) {
    console.error('❌ Error in assets API:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const assetData = await request.json();
    console.log('🔄 Creating new asset:', assetData);

    const collection = await getCollection('assets');

    // Validate required fields
    const requiredFields = [
      'project_id', 'project_name', 'asset_type', 'asset_name', 
      'provider_name', 'acquisition_date', 'source_type', 
      'quantity', 'unit_value', 'status'
    ];
    const missingFields = requiredFields.filter(field => !assetData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate total value
    const total_value = assetData.quantity * assetData.unit_value;

    // Generate unique asset ID
    const assetId = `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const finalAssetData = {
      ...assetData,
      asset_id: assetId,
      total_value: total_value,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(finalAssetData);
    
    console.log('✅ Asset created successfully:', result.insertedId);

    return NextResponse.json({ 
      success: true, 
      assetId: assetId,
      insertedId: result.insertedId,
      message: 'Asset created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating asset:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create asset',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const collection = await getCollection('assets');

    // Remove fields that shouldn't be updated
    const { asset_id, createdAt, _id, ...safeUpdateData } = updateData;

    // Recalculate total value if quantity or unit_value is updated
    if (safeUpdateData.quantity || safeUpdateData.unit_value) {
      const currentAsset = await collection.findOne({ asset_id: id });
      if (currentAsset) {
        const quantity = safeUpdateData.quantity || currentAsset.quantity;
        const unit_value = safeUpdateData.unit_value || currentAsset.unit_value;
        safeUpdateData.total_value = quantity * unit_value;
      }
    }

    const result = await collection.updateOne(
      { asset_id: id },
      { 
        $set: {
          ...safeUpdateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    console.log('✅ Asset updated successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Asset updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating asset:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update asset',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('assets');
    const result = await collection.deleteOne({ asset_id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    console.log('✅ Asset deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting asset:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete asset',
        message: error.message 
      },
      { status: 500 }
    );
  }
}