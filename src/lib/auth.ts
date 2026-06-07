import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'kampe-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dager

function getSecret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET!);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ isLoggedIn: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret());
}

export async function getSession(): Promise<{ isLoggedIn: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return { isLoggedIn: false };
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { isLoggedIn: payload.isLoggedIn === true };
  } catch {
    return { isLoggedIn: false };
  }
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    },
  };
}

export function checkPassword(input: string): boolean {
  return input === process.env.ADMIN_PASSWORD;
}
