export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/store';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    console.log('=== SIGNUP ATTEMPT ===');
    console.log('Registering:', {email, username});

    if (!email || !password || !username) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }
    
    const normalizedEmail = email.toLowerCase();

    const db = await loadDb();
    const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      console.log('Signup failed: User already exists');
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      username,
      password: hashedPassword,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
    };

    db.users.push(newUser);
    await saveDb(db);
    console.log('New user added to DB:', JSON.stringify(newUser, null, 2));


    // Create session for the new user immediately
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({ userId: newUser.id, expires });

    (await cookies()).set('session', session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Create a default "My First Board" for the new user
    const newBoard = {
      id: `board-${Date.now()}`,
      name: 'My First Board',
      userId: newUser.id,
    };
    db.boards.push(newBoard);
    await saveDb(db);
    console.log('Created default board for new user.');
    console.log('====================');

    const { password: _omit, ...userToReturn } = newUser;
    return NextResponse.json({ message: 'User registered successfully', user: userToReturn }, { status: 201 });

  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
