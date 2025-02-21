import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Authentication disabled - allow all requests
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};