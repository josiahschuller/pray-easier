import { supabaseService } from '@/services/supabase';
import { NextResponse } from 'next/server';

export async function authoriseRequest(authHeader: string | null, userId: string | null) {
  /*
  Authorise a request by checking the authorization header and user ID in query parameters.
  */
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization token' },
      { status: 401 }
    );
  }

  const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required in query parameters' },
      { status: 400 }
    );
  }

  const dbUser = await supabaseService.getUserById(Number(userId));
  if (!dbUser) {
    return NextResponse.json(
      { error: 'Invalid or expired access token' },
      { status: 401 }
    );
  }

  // Verify the access token is valid
  if (accessToken !== dbUser.access_token) {
    return NextResponse.json(
      { error: 'Invalid or expired access token' },
      { status: 401 }
    );
  }
}
