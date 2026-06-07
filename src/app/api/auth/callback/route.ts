import { NextRequest, NextResponse } from 'next/server';
import { getSession, checkPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (!password || !checkPassword(password)) {
    return NextResponse.json(
      { error: 'Feil passord. Prøv igjen.' },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
