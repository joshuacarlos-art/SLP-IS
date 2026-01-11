import { NextRequest, NextResponse } from 'next/server';
import { getAssociationsByStatus } from '@/lib/db/associations';

// GET /api/associations/status/[status] - Get associations by status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ status: string }> }
) {
  try {
    const { status } = await params; // Await the params Promise
    
    const validStatuses = ['active', 'inactive', 'pending', 'suspended', 'archived'];
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, inactive, pending, suspended, or archived' },
        { status: 400 }
      );
    }

    console.log(`Fetching associations with status: ${status}`);
    const associations = await getAssociationsByStatus(status);
    
    return NextResponse.json(associations);
  } catch (error: any) {
    console.error('Error fetching associations by status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch associations: ' + error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';