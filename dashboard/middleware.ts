import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for NextAuth session cookie
  // NextAuth v5 uses different cookie names depending on environment
  const sessionToken = 
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value

  // Allow API routes to pass through
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // If accessing login page
  if (pathname === '/login') {
    // If already logged in, redirect to dashboard
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Otherwise allow access to login
    return NextResponse.next()
  }

  // For root path, redirect based on auth status
  if (pathname === '/') {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect ALL other routes (including /dashboard/*) - redirect to login if not authenticated
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
