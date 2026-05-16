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

      <Sidebar user={user} />

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
