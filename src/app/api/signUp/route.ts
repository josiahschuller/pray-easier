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

function generateAccessToken() {
  // Generate a random access token
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
      // User already exists, so return an error
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // User does not exist, so create a new user
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);
    const accessToken = generateAccessToken();
    await supabaseService.createUser(emailAddress, hashedPassword, salt, name, accessToken);

    return NextResponse.json({
      status: 201,
      body: { message: 'User created successfully', accessToken }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
