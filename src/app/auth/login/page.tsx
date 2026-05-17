import { getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthForm } from '@/components/auth/AuthForm';
import React from 'react';

export default async function ArtistLoginPage() {
    const { data: { user } } = await getUser();

    if (user) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-studio-pink blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-studio-neon blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="mb-12 text-center">
                    <Link href="/" className="inline-block mb-6">
                        <div className="flex flex-col items-center gap-2">
                            <Image 
                                src="/Logo.png" 
                                alt="SamplesWala Logo" 
                                width={200} 
                                height={50} 
                                className="h-auto w-auto max-w-[200px] brightness-0 invert hover:scale-105 transition-transform"
                                priority
                            />
                            <span className="block text-[10px] mt-2 text-white/40 tracking-[0.4em] font-black uppercase">ARTIST PORTAL LOGIN</span>
                        </div>
                    </Link>
                    <div className="inline-block px-4 py-1 bg-studio-charcoal border-2 border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">
                        Collaborators Only
                    </div>
                </div>

                <div className="bg-studio-charcoal border-4 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)] relative">
                    {/* Comic Corner Tag */}
                    <div className="absolute -top-4 -right-4 bg-studio-pink text-black px-4 py-1 font-black text-xs uppercase italic border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] z-20 skew-x-[-10deg]">
                        Secure Entry
                    </div>

                    <AuthForm allowSignup={false} next="/" />

                    <div className="mt-8 pt-6 border-t-2 border-black flex flex-col gap-4">
                        <p className="text-[10px] text-white/40 font-bold uppercase text-center leading-relaxed">
                            Need access? Reach out to your collaboration manager at <br />
                            <span className="text-white/80">careers@sampleswala.com</span>
                        </p>
                        <Link
                            href="https://sampleswala.com"
                            className="text-[10px] text-studio-neon font-black uppercase text-center hover:underline tracking-widest"
                        >
                            Back to SamplesWala.com
                        </Link>
                    </div>
                </div>

                <p className="mt-12 text-center text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">
                    SamplesWala :: Artist Security :: 2026
                </p>
            </div>
        </div>
    );
}
