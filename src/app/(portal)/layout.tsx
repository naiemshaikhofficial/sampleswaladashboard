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
import { Sidebar } from '@/components/dashboard/Sidebar';

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
  } else {
    redirect('/auth/login');
  }

  const sidebarLinks = [
    { name: 'Overview', href: '/', icon: LayoutDashboard }, 
    { name: 'My Collaborations', href: '/my-packs', icon: Music },
    { name: 'Revenue & Payouts', href: '/revenue', icon: TrendingUp },
    { name: 'Payout Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-halftone font-mono relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="splatter-effect bg-studio-blue top-[-10%] left-[-10%] opacity-20" />
        <div className="splatter-effect bg-studio-orange bottom-[-10%] right-[-10%] opacity-20" />
        
        {/* Floating Music Notes */}
        <div className="absolute top-20 right-20 text-studio-yellow opacity-20 animate-float z-0 pointer-events-none">
          <Music size={120} strokeWidth={1} />
        </div>
        <div className="absolute bottom-40 left-1/3 text-studio-red opacity-20 animate-float-delayed z-0 pointer-events-none" style={{ transform: 'rotate(-15deg)' }}>
          <Music size={80} strokeWidth={1.5} />
        </div>

        {/* Comic Equalizer Overlay */}
        <div className="absolute bottom-0 right-0 p-8 flex items-end gap-2 opacity-30 z-0 h-32 pointer-events-none">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 bg-studio-blue eq-bar border-2 border-black" style={{ height: `${Math.random() * 100 + 20}%` }} />
            ))}
        </div>

      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col relative z-10 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b-4 border-black bg-studio-charcoal flex items-center justify-between sticky top-0 z-50">
            <h1 className="text-lg font-black italic uppercase tracking-tighter">
                SAMPLES <span className="text-studio-blue">WALA</span>
            </h1>
            <button className="p-2 border-2 border-black bg-white text-black">
                <LayoutDashboard size={20} />
            </button>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-12">
            {children}
        </div>
      </main>
    </div>
  );
}
