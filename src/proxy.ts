import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Protect dashboard routes (anything except /auth, /api, _next, etc.)
  const isAuthRoute = pathname.startsWith('/auth')
  const isPublicRoute = isAuthRoute || pathname.startsWith('/_next') || pathname.match(/\.(.*)$/)

  // Failsafe: If Supabase redirects to the root or login with a code parameter because of URL mismatches
  if (request.nextUrl.searchParams.has('code') && !pathname.startsWith('/auth/callback')) {
    return NextResponse.redirect(new URL(`/auth/callback?${request.nextUrl.searchParams.toString()}`, request.url))
  }

  if (!user && !isPublicRoute) {
    const res = NextResponse.redirect(new URL('/auth/login', request.url))
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie.name, cookie.value, cookie)
    })
    return res
  }

  if (user && isAuthRoute && pathname === '/auth/login') {
    const res = NextResponse.redirect(new URL('/', request.url))
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie.name, cookie.value, cookie)
    })
    return res
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
