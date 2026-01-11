import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This will help us see what's actually in your database
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/associations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      rawResponse: JSON.stringify(data, null, 2)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}