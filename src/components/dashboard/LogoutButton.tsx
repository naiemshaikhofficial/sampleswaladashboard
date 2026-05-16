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
            className="flex items-center gap-3 w-full p-4 font-black uppercase text-xs border-2 border-transparent hover:bg-studio-red hover:text-white transition-all group"
        >
            <LogOut size={18} />
            Logout
        </button>
    );
}
