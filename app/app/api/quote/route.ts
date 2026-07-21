import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://zenquotes.io/api/today');
    
    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    if (data && data.length > 0 && data[0].q && data[0].a) {
      return NextResponse.json({
        quote: data[0].q,
        author: data[0].a,
      });
    }
    
    throw new Error('Invalid API response');
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
