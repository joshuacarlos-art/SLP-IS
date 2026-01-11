import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with your actual database operations
let practices: any[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const practice = practices.find(p => p.id === id);
    return practice 
      ? NextResponse.json(practice)
      : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(practices);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const practice = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      ...body
    };
    
    practices.push(practice);
    return NextResponse.json(practice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    const index = practices.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    practices[index] = { ...practices[index], ...body };
    return NextResponse.json(practices[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  practices = practices.filter(p => p.id !== id);
  return NextResponse.json({ success: true });
}