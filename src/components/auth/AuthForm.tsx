'use client'
import React, { useState } from 'react'
import { Shield, Loader2, ArrowRight, Mail, Lock, Chrome, User, Eye, EyeOff } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn, signUp, signInWithGoogle, forgotPassword } from '@/app/auth/actions'

type AuthMode = 'login' | 'signup' | 'forgot'

export function AuthForm({ allowSignup = true, next: defaultNext }: { allowSignup?: boolean, next?: string }) {
  const searchParams = useSearchParams()
  const next = defaultNext || searchParams.get('next') || '/browse'
  
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState(0)

  const checkStrength = (pass: string) => {
    let s = 0
    if (pass.length > 7) s++
    if (/[A-Z]/.test(pass)) s++
    if (/[0-9]/.test(pass)) s++
    if (/[^A-Za-z0-9]/.test(pass)) s++
    setStrength(s)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    formData.append('next', next)

    if (mode === 'signup') {
      const pass = formData.get('password') as string
      const confirm = formData.get('confirmPassword') as string
      if (pass !== confirm) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }
    }
    
    let result;
    if (mode === 'login') result = await signIn(formData)
    else if (mode === 'signup') result = await signUp(formData)
    else result = await forgotPassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setMessage(result.success)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const result = await signInWithGoogle(next)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Social Login */}
      {mode !== 'forgot' && (
        <>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 bg-white text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-3 hover:bg-studio-yellow transition-all group"
            >
              <Chrome size={18} />
              Continue with Google
            </button>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative bg-[#0a0a0a] px-4 text-xs text-white/20">OR</span>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="p-4 bg-studio-neon/10 border border-studio-neon/20 text-studio-neon text-xs rounded-xl text-center">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  name="fullName"
                  type="text" 
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm focus:border-studio-neon outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                name="email"
                type="email" 
                required
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm focus:border-studio-neon outline-none transition-all"
                placeholder="example@mail.com"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-medium text-studio-yellow hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  name="password"
                  type={showPassword ? 'text' : 'password'} 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    checkStrength(e.target.value)
                  }}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 text-sm focus:border-studio-neon outline-none transition-all"
                  placeholder="Enter password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {mode === 'signup' && password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          strength >= level 
                            ? strength <= 2 ? 'bg-red-500' : strength === 3 ? 'bg-yellow-500' : 'bg-studio-neon'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'} 
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 text-sm focus:border-studio-neon outline-none transition-all"
                  placeholder="Repeat password"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center py-2">
          <Turnstile 
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} 
            options={{ theme: 'dark' }}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full h-12 bg-studio-neon text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              {mode === 'login' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Link'}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {allowSignup && (
          <div className="flex flex-col gap-3">
            <button 
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="w-full text-center text-sm text-white/50 hover:text-white transition-colors"
            >
              {mode === 'signup' ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
