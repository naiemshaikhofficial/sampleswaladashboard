'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  CreditCard, 
  ShieldCheck,
  Save,
  AlertCircle
} from 'lucide-react';

export default function PayoutSettings() {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="max-w-4xl space-y-12">
      {/* Heading */}
      <div className="relative">
        <h2 className="section-heading">
            Payout <span className="text-studio-pink">Settings</span>
        </h2>
        <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">
            Manage your bank account details and tax information. We use this data to process your monthly revenue payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2 space-y-6">
            <div className="comic-panel p-8 pink-border bg-studio-grey">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                    <Building2 className="text-studio-pink" />
                    <h3 className="text-xl font-black uppercase italic">Banking Details</h3>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Account Holder Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="AS PER BANK RECORDS"
                                    className="w-full bg-black border-2 border-black p-4 pl-12 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Bank Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="E.G. HDFC BANK"
                                    className="w-full bg-black border-2 border-black p-4 pl-12 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Account Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input 
                                type="password" 
                                placeholder="•••• •••• •••• ••••"
                                className="w-full bg-black border-2 border-black p-4 pl-12 text-xs font-black focus:border-studio-pink outline-none transition-colors tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">IFSC Code</label>
                            <input 
                                type="text" 
                                placeholder="E.G. HDFC0001234"
                                className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">PAN Number</label>
                            <input 
                                type="text" 
                                placeholder="ABCDE1234F"
                                className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <button 
                        type="button"
                        onClick={() => {
                            setIsSaving(true);
                            setTimeout(() => setIsSaving(false), 2000);
                        }}
                        className="studio-button w-full md:w-auto"
                    >
                        {isSaving ? 'Processing...' : (
                            <>
                                <Save size={16} />
                                Save Payout Details
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>

        {/* Security Info */}
        <div className="space-y-6">
            <div className="comic-panel p-6 neon-border">
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-studio-neon" size={24} />
                    <h4 className="text-sm font-black uppercase italic">Secure Vault</h4>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                    Your banking information is encrypted and stored in a secure environment. 
                    Only the finance team has access for processing payouts.
                </p>
            </div>

            <div className="comic-panel p-6 yellow-border bg-studio-yellow text-black">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle size={24} />
                    <h4 className="text-sm font-black uppercase italic">Important</h4>
                </div>
                <p className="text-[10px] leading-relaxed uppercase font-black tracking-tighter">
                    Payouts are processed on the 1st of every month for balances exceeding ₹5,000. 
                    Ensure your details are accurate to avoid payment delays.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
