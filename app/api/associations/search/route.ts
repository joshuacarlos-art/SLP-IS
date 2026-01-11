import { NextRequest, NextResponse } from 'next/server';
import { searchAssociations } from '@/lib/db/associations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const associations = await searchAssociations(query);
    return NextResponse.json(associations);
  } catch (error) {
    console.error('Error searching associations:', error);
    return NextResponse.json(
      { error: 'Failed to search associations' },
      { status: 500 }
    );
  }
}