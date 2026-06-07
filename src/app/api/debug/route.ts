import { NextResponse } from 'next/server';

// Temporary diagnostic endpoint — DELETE after debugging
export async function GET() {
  return NextResponse.json({
    ADMIN_PASSWORD_set: !!process.env.ADMIN_PASSWORD,
    ADMIN_PASSWORD_length: process.env.ADMIN_PASSWORD?.length ?? 0,
    SESSION_SECRET_set: !!process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
}
