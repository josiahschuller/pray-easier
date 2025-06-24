import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseService } from '@/services/supabase';

function generateSalt() {
  // Generate a random salt
  return crypto.randomBytes(16).toString('hex');
}

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

    // Check if user already exists
    const existingUser = await supabaseService.getUserByEmailAddress(emailAddress);
    
    if (!existingUser) {
      // User does not exist, so return an error
      return NextResponse.json(
        { error: 'Email or password is wrong' },
        { status: 401 }
      );
    }

    // User exists, so verify the password
    const { password: storedPassword, salt: storedSalt } = existingUser;

    const hashedPassword = hashPassword(password, storedSalt);

    if (hashedPassword !== storedPassword) {
      return NextResponse.json(
        { error: 'Email or password is wrong' },
        { status: 401 }
      );
    }

    // Password is valid, return the user
    return NextResponse.json(
      { message: 'Login successful', accessToken: existingUser.accessToken },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
