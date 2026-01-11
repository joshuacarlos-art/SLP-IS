import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching institutional buyers from MongoDB...');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;
    
    const collection = await getCollection('institutional_buyers');
    
    // Build query for search and filters
    let query: any = {};
    
    if (search) {
      query.$or = [
        { buyer_name: { $regex: search, $options: 'i' } },
        { contact_person: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { buyer_id: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }
    
    const [buyers, totalCount] = await Promise.all([
      collection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    const convertedBuyers = convertDocsIds(buyers);
    
    console.log('📋 Buyers fetched:', convertedBuyers.length);
    
    return NextResponse.json(convertedBuyers);

  } catch (error: any) {
    console.error('❌ Error in institutional buyers API:', error);
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
    const buyerData = await request.json();
    console.log('🔄 Creating new institutional buyer:', buyerData);

    const collection = await getCollection('institutional_buyers');

    // Validate required fields
    const requiredFields = [
      'buyer_name', 'contact_person', 'contact_number', 'email', 'type'
    ];
    const missingFields = requiredFields.filter(field => !buyerData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for duplicate email or contact number
    const existingBuyer = await collection.findOne({
      $or: [
        { email: buyerData.email },
        { contact_number: buyerData.contact_number }
      ]
    });

    if (existingBuyer) {
      return NextResponse.json(
        { error: 'Buyer with this email or contact number already exists' },
        { status: 409 }
      );
    }

    // Generate unique buyer ID
    const buyerId = `BUY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const finalBuyerData = {
      ...buyerData,
      buyer_id: buyerId,
      status: buyerData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(finalBuyerData);
    
    console.log('✅ Buyer created successfully:', result.insertedId);

    return NextResponse.json({ 
      success: true, 
      buyerId: buyerId,
      insertedId: result.insertedId,
      message: 'Institutional buyer created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating buyer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create buyer',
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
        { error: 'Buyer ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const collection = await getCollection('institutional_buyers');

    // Remove fields that shouldn't be updated
    const { buyer_id, createdAt, _id, ...safeUpdateData } = updateData;

    const result = await collection.updateOne(
      { buyer_id: id },
      { 
        $set: {
          ...safeUpdateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      );
    }

    console.log('✅ Buyer updated successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Buyer updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating buyer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update buyer',
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
        { error: 'Buyer ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('institutional_buyers');
    const result = await collection.deleteOne({ buyer_id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      );
    }

    console.log('✅ Buyer deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Buyer deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting buyer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete buyer',
        message: error.message 
      },
      { status: 500 }
    );
  }
}