'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
    const supabase = createClient();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/auth/login');
    };

    return (
        <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full p-3 border-2 border-black bg-studio-red text-white hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase italic group"
        >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
            Sign Out
        </button>
    );
}
