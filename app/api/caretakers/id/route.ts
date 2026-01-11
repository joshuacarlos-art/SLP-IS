import { NextRequest, NextResponse } from 'next/server';
import { 
  getCaretakerById, 
  updateCaretaker, 
  deleteCaretaker 
} from '@/lib/db/caretaker';

export async function GET(request: NextRequest) {
  try {
    // Get ID from query parameters for static routes
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required as query parameter' },
        { status: 400 }
      );
    }

    const caretaker = await getCaretakerById(id);
    
    if (!caretaker) {
      return NextResponse.json(
        { error: 'Caretaker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(caretaker);
  } catch (error) {
    console.error('Error fetching caretaker:', error);
    return NextResponse.json(
      { error: 'Failed to fetch caretaker' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required as query parameter' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    const success = await updateCaretaker(id, updateData);

    if (!success) {
      return NextResponse.json(
        { error: 'Caretaker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Caretaker updated successfully' 
    });
  } catch (error) {
    console.error('Error updating caretaker:', error);
    return NextResponse.json(
      { error: 'Failed to update caretaker' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required as query parameter' },
        { status: 400 }
      );
    }

    const success = await deleteCaretaker(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Caretaker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Caretaker deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting caretaker:', error);
    return NextResponse.json(
      { error: 'Failed to delete caretaker' },
      { status: 500 }
    );
  }
}