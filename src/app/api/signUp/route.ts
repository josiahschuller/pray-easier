import crypto from 'crypto';
import { supabaseService } from '@/services/supabase';
import { NextResponse } from 'next/server';

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password: string, salt: string) {
  return crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
}

function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: Request) {
  try {
    const { emailAddress, password, name } = await request.json();

    // Validate input
    if (!emailAddress || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await supabaseService.getUserByEmailAddress(emailAddress);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create a new user
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);
    const accessToken = generateAccessToken();
    await supabaseService.createUser(emailAddress, hashedPassword, salt, name, accessToken);

    console.log('Signup successful for:', emailAddress);
    return NextResponse.json(
      { 
        message: 'User created successfully',
        accessToken,
        name
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: `Failed to create user: ${error}` },
      { status: 500 }
    );
  }
}
