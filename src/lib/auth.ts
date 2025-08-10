
import type { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}

export async function getSession() {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) return null;
  
  const decryptedSession = await decrypt(sessionCookie);
  if (!decryptedSession || !decryptedSession.userId) {
    return null;
  }
  return { user: { id: decryptedSession.userId } } as any;
}

export async function getSessionFromMiddleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return null;
    
    const decryptedSession = await decrypt(sessionCookie);
    if (!decryptedSession || !decryptedSession.userId) {
        return null;
    }
    return { user: { id: decryptedSession.userId } } as any;
}

export async function logout() {
    cookies().set('session', '', { expires: new Date(0), path: '/' });
}
