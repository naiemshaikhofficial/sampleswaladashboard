import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Music, 
  Settings, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

import { LogoutButton } from '@/components/dashboard/LogoutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: { user } } = await getUser();

  // Strict Access Control: Check if user is an Artist or Admin
  if (user) {
    const admin = getAdminClient();
    const [artistRes, adminRes] = await Promise.all([
      admin.from('artist_collaborations').select('id').eq('artist_id', user.id).limit(1),
      admin.from('admins').select('user_id').eq('user_id', user.id).limit(1)
    ]);

    // TEMPORARY FOR DEBUGGING: Allow all logged in users to see the dashboard
    const isAuthorized = true; // (artistRes.data && artistRes.data.length > 0) || (adminRes.data && adminRes.data.length > 0);

    if (!isAuthorized) {
        return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono">
            <div className="w-full max-w-md bg-studio-charcoal border-4 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center">
              <h2 className="text-2xl font-black italic uppercase text-studio-pink mb-4">ACCESS DENIED</h2>
              <p className="text-xs text-white/60 font-bold uppercase leading-relaxed mb-8">
                Your account ({user.email}) is not registered in our Artist Portal.<br/><br/>
                Please contact our support to get your artist access enabled.
              </p>
              <div className="space-y-4">
                <LogoutButton />
                <Link 
                  href="https://sampleswala.com" 
                  className="block text-[10px] text-studio-neon font-black uppercase hover:underline tracking-widest pt-4"
                >
                  Back to Sampleswala.com
                </Link>
              </div>
            </div>
          </div>
        );
    }
  }

  const sidebarLinks = [
    { name: 'Overview', href: '/', icon: LayoutDashboard }, 
    { name: 'My Collaborations', href: '/my-packs', icon: Music },
    { name: 'Revenue & Payouts', href: '/revenue', icon: TrendingUp },
    { name: 'Payout Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-black font-mono relative overflow-hidden">
        {/* Background Splatter Effect */}
        <div className="splatter-effect bg-studio-pink top-[-10%] left-[-10%] opacity-20" />
        <div className="splatter-effect bg-studio-neon bottom-[-10%] right-[-10%] opacity-20" />

      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 border-r-4 border-black bg-studio-charcoal flex flex-col relative z-20 shadow-[4px_0_0_rgba(0,0,0,1)]">
        <div className="p-8 border-b-4 border-black">
          <Link href="/" className="block">
            <div className="flex flex-col gap-2">
              <Image 
                src="/Logo.png" 
                alt="SamplesWala Logo" 
                width={140} 
                height={30} 
                className="h-auto w-auto brightness-0 invert"
              />
              <span className="block text-[8px] text-white/40 tracking-[0.3em] font-black uppercase">ARTIST PORTAL</span>
            </div>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 p-3 font-black uppercase text-[10px] tracking-widest transition-all border-2 border-transparent ${
                typeof window !== 'undefined' && window.location.pathname === link.href 
                  ? 'bg-studio-neon text-black border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon size={16} />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-black bg-black/20">
          {user && (
            <div className="flex flex-col gap-2">
              <div className="p-2 bg-white/5 border border-white/10 mb-1">
                <p className="text-[7px] text-white/40 uppercase font-black tracking-widest mb-1">Artist Account</p>
                <p className="text-[9px] font-black truncate text-studio-neon">{user.email}</p>
              </div>
              
              <LogoutButton />
              
              <Link 
                href="https://sampleswala.com"
                className="flex items-center justify-center gap-2 p-2 border-2 border-black bg-studio-neon text-black hover:bg-white transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[9px] font-black uppercase italic"
              >
                Back to main site
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b-4 border-black bg-studio-charcoal flex items-center justify-between">
            <h1 className="text-lg font-black italic uppercase tracking-tighter">
                SAMPLES <span className="text-studio-neon">WALA</span>
            </h1>
            <button className="p-2 border-2 border-black bg-white text-black">
                <LayoutDashboard size={20} />
            </button>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-12 overflow-y-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
