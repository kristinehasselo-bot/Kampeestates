import { NextResponse } from 'next/server';

// Auth is handled in each protected server component (dashboard/page.tsx).
// This middleware is intentionally minimal to avoid Edge Runtime crypto issues.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
