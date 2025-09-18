import { NextResponse } from 'next/server';
import { openAIService } from '@/services/openai';
import { authoriseRequest } from '@/utils/authoriseRequest';

export async function POST(request: Request) {
  const userId = (new URL(request.url)).searchParams.get('userId');
  const authResult = await authoriseRequest(
      request.headers.get('authorization'),
      userId,
  );
  
  // If authorization failed, return the error response
  if (authResult) {
    return authResult;
  }
  
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Process the prayer text using OpenAI
    const processedPrayers = await openAIService.processPrayerText(text);
    
    return NextResponse.json({
      prayers: processedPrayers
    });
    
  } catch (error) {
    console.error('Error processing prayer text:', error);
    return NextResponse.json(
      { error: 'Failed to process prayer text' },
      { status: 500 }
    );
  }
}
