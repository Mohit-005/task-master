export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loadDb } from '@/lib/store';
import { encrypt } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const db = await loadDb();
    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    console.log('All users in DB:', db.users.map(u => u.email));

    if (!user || !user.password) {
      console.log("Login failed: User not found.");
      console.log('All users in DB:', db.users.map(u => u.email));
      console.log('=====================');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      console.log("Login failed: Password incorrect.");
      console.log('=====================');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    console.log("Login successful for user:", { id: user.id, email: user.email });
    console.log('=====================');

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    // Sign minimal payload to keep cookie size small
    const session = await encrypt({ userId: user.id, expires });

    (await cookies()).set('session', session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    const { password: _omit, ...userToReturn } = user;
    return NextResponse.json({ message: 'Logged in successfully', user: userToReturn }, { status: 200 });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
