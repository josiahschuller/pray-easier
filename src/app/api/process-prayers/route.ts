import { NextResponse } from 'next/server';
import { processPrayerText } from '@/services/openai';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const prayers = await processPrayerText(text);
    return NextResponse.json(prayers);
  } catch (error) {
    console.error('Error processing prayers:', error);
    return NextResponse.json(
      { error: 'Failed to process prayers' },
      { status: 500 }
    );
  }
} 