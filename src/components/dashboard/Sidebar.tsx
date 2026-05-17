'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Music, 
  Settings, 
  TrendingUp,
  Menu,
  X,
  BarChart3,
  Receipt,
  FileText,
  MessageSquare
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';

interface SidebarProps {
    user: any;
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const sidebarLinks = [
        { name: 'Overview', href: '/', icon: LayoutDashboard }, 
        { name: 'My Collaborations', href: '/my-packs', icon: Music },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Revenue Splits', href: '/revenue', icon: TrendingUp },
        { name: 'Payout History', href: '/payout-history', icon: Receipt },
        { name: 'Agreements', href: '/agreements', icon: FileText },
        { name: 'Support', href: '/support', icon: MessageSquare },
        { name: 'Payout Settings', href: '/settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 w-full p-4 border-b-4 border-black bg-studio-charcoal flex items-center justify-between z-[60]">
                <Link href="/" onClick={() => setIsOpen(false)}>
                    <h1 className="text-lg font-black italic uppercase tracking-tighter">
                        SAMPLES <span className="text-studio-blue">WALA</span>
                    </h1>
                </Link>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 border-2 border-black bg-white text-black hover:bg-studio-yellow transition-colors">
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </header>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-[40] md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed md:sticky top-0 h-screen w-64 border-r-4 border-black bg-studio-charcoal flex flex-col z-[50] shadow-[4px_0_0_rgba(0,0,0,1)]
                transition-transform duration-300 ease-in-out md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
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
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 font-black uppercase text-[10px] tracking-widest transition-all border-2 border-transparent ${
                            pathname === link.href 
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
        </>
    );
}
