import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Ako pokušavamo pristupiti admin rutama
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // Ako nema sesije, redirektuj na login
      return NextResponse.redirect(new URL('/prijava', req.url));
    }

    // Proveri da li je korisnik admin koristeći RPC funkciju is_admin
    const { data: isAdmin, error } = await supabase.rpc('is_admin');

    if (error) {
      console.error('Greška pri proveri admin statusa:', error);
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (!isAdmin) {
      // Ako nije admin, redirektuj na početnu
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*']
};
