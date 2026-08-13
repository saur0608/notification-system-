import { NextResponse } from 'next/server';
import { findUserByEmail, createUser, hashPassword } from '@/lib/db-service';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { name, email, password, department } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Determine role based on email (you can customize this logic)
    let role: 'admin' | 'engineer' | 'operator' | 'viewer' = 'viewer';
    
    if (email.includes('admin')) {
      role = 'admin';
    } else if (email.includes('engineer')) {
      role = 'engineer';
    } else if (email.includes('operator')) {
      role = 'operator';
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate a new company ID for the new user (assuming signup creates a new organization)
    const companyId = new ObjectId().toString();

    // Create user
    const user = await createUser({
      name,
      email,
      passwordHash,
      role,
      department,
      companyId
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id?.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
