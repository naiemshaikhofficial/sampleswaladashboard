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

    const isAuthorized = (artistRes.data && artistRes.data.length > 0) || (adminRes.data && adminRes.data.length > 0);

    if (!isAuthorized) {
        return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono">
            <div className="w-full max-w-md bg-studio-charcoal border-4 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center">
              <a href="https://sampleswala.com" className="inline-block mb-8">
                <Image 
                    src="/Logo.png" 
                    alt="SamplesWala Logo" 
                    width={180} 
                    height={40} 
                    className="h-auto w-auto max-w-[180px] brightness-0 invert hover:scale-105 transition-transform mx-auto"
                />
              </a>
              <h2 className="text-2xl font-black italic uppercase text-studio-pink mb-4">ACCESS DENIED</h2>
              <p className="text-[10px] text-white/60 font-bold uppercase leading-relaxed mb-8">
                This portal is exclusively for artists who actively collaborate with us. Your account ({user.email}) does not have access.<br/><br/>
                If you want to work with us and get access to the dashboard, please visit <a href="https://sampleswala.com/careers" className="text-studio-yellow hover:underline">sampleswala.com/careers</a> and follow the steps.
              </p>
              <div className="space-y-4">
                <LogoutButton />
                <a 
                  href="https://sampleswala.com" 
                  className="block text-[10px] text-studio-neon font-black uppercase hover:underline tracking-widest pt-4"
                >
                  Back to Sampleswala.com
                </a>
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
    <div className="flex h-screen bg-black font-mono relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="splatter-effect bg-studio-blue top-[-10%] left-[-10%] opacity-20" />
        <div className="splatter-effect bg-studio-orange bottom-[-10%] right-[-10%] opacity-20" />
        

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
