import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, checkPassword, getSessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!checkPassword(body?.password)) {
    return NextResponse.json({ error: 'Feil passord. Prøv igjen.' }, { status: 401 });
  }

  const token = await createSessionToken();
  const { name, options } = getSessionCookieOptions();

  const response = NextResponse.json({ ok: true });
  response.cookies.set(name, token, options);
  return response;
}

export async function DELETE() {
  const { name } = getSessionCookieOptions();
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(name);
  return response;
}
