import crypto from 'crypto';
import { supabaseService } from '@/services/supabase';
import { NextResponse } from 'next/server';

function hashPassword(password: string, salt: string) {
  // Hash the password with the provided salt
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return hashedPassword;
}

export async function POST(request: Request) {
  try {    
    const { emailAddress, password } = await request.json();

    // Validate input
    if (!emailAddress || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await supabaseService.getUserByEmailAddress(emailAddress);
    
    if (!existingUser) {
      // User does not exist, so return an error
      return NextResponse.json(
        { error: 'Email or password is wrong' },
        { status: 401 }
      );
    }

    // User exists, so verify the password
    const { password_hash: storedPassword, salt: storedSalt, access_token: accessToken } = existingUser;
    const hashedPassword = hashPassword(password, storedSalt);

    if (hashedPassword !== storedPassword) {
      return NextResponse.json(
        { error: 'Email or password is wrong' },
        { status: 401 }
      );
    }

    // Password is valid, return the user
    console.log('Login successful for:', emailAddress);
    return NextResponse.json(
      {
        message: 'Login successful',
        accessToken: accessToken,
        name: existingUser.name,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Failed to process login' },
      { status: 500 }
    );
  }
}
