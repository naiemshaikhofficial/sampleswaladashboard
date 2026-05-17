'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

async function verifyTurnstile(token: string | null) {
  if (!token) return false
  const secretKey = process.env.TURNSTILE_SECRET_KEY!
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: secretKey, response: token }),
  })
  const data = await response.json()
  return data.success
}

export async function signIn(formData: FormData) {
  const token = formData.get('cf-turnstile-response') as string
  if (!(await verifyTurnstile(token))) {
    return { error: "Security check failed. Please try again." }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  
  const next = formData.get('next') as string || '/'
  redirect(next)
}


export async function signUp(formData: FormData) {
  const token = formData.get('cf-turnstile-response') as string
  if (!(await verifyTurnstile(token))) {
    return { error: "Security check failed. Please try again." }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const supabase = await createClient()

  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const currentOrigin = `${protocol}://${host}`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${currentOrigin}/auth/callback`,
      data: {
        full_name: fullName,
      }
    },
  })

  if (error) return { error: error.message }
  return { success: "Check your email to confirm your account." }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function signInWithGoogle(next: string = '/') {
  const supabase = await createClient()
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const currentOrigin = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: next === '/' 
        ? `${currentOrigin}/auth/callback` 
        : `${currentOrigin}/auth/callback?next=${next}`,
    },
  })
  
  console.log('[signInWithGoogle] OAuth URL:', data.url, 'Error:', error)

  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}

export async function forgotPassword(formData: FormData) {
  const token = formData.get('cf-turnstile-response') as string
  if (!(await verifyTurnstile(token))) {
    return { error: "Security check failed. Please try again." }
  }

  const email = formData.get('email') as string
  const supabase = await createClient()

  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const currentOrigin = `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${currentOrigin}/auth/reset`,
  })

  if (error) return { error: error.message }
  return { success: "Password reset link sent to your email." }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) return { error: error.message }
  redirect('/')
}
