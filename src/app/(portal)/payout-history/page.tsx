'use client';

import React, { useState, useEffect } from 'react';
import { 
    Wallet, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Receipt, 
    SendHorizontal, 
    CheckSquare,
    HelpCircle,
    ArrowUpRight
} from 'lucide-react';
import { getPayoutSummary, requestPayout } from '@/lib/dashboard-actions';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
    paid: { color: 'text-studio-neon', icon: CheckCircle2, label: 'Paid' },
    processing: { color: 'text-studio-yellow', icon: Loader2, label: 'Processing' },
    pending: { color: 'text-studio-blue', icon: Clock, label: 'Pending' },
    failed: { color: 'text-studio-red', icon: AlertCircle, label: 'Failed' },
};

export default function PayoutHistoryPage() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadData = async () => {
        setLoading(true);
        const data = await getPayoutSummary();
        if (data) setSummary(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRequestPayout = async () => {
        setRequesting(true);
        setFeedback(null);
        const result = await requestPayout();
        if (result.success) {
            setFeedback({ type: 'success', text: result.message || 'Payout request submitted successfully!' });
            await loadData();
        } else {
            setFeedback({ type: 'error', text: result.error || 'Failed to submit request.' });
        }
        setRequesting(false);
    };

    if (loading && !summary) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 size={36} className="animate-spin text-studio-yellow" />
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Loading financial ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="relative">
                <h2 className="section-heading">
                    Payout <span className="text-studio-yellow">History</span>
                </h2>
                <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">
                    Track your earnings, check payout status, and request monthly disbursements directly.
                </p>
            </div>

            {/* Payout Action Dashboard Panel */}
            <div className="comic-panel p-8 bg-studio-grey border-l-4 border-l-studio-yellow" style={{ boxShadow: '8px 8px 0px #FFD214' }}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center gap-2 text-studio-yellow font-black uppercase text-[10px] tracking-widest">
                            <Wallet size={14} /> Available Balance
                        </div>
                        <h3 className="text-4xl sm:text-5xl font-black text-white italic comic-text">
                            ₹{(summary?.availableBalance || 0).toLocaleString('en-IN')}
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed max-w-lg">
                            This balance reflects your total cleared, accumulated revenue share across all active pack collaborations, minus any previously processed or pending payouts.
                        </p>

                        {/* KYC & Verification Steps Guide */}
                        <div className="pt-2 flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${summary?.hasBankDetails ? 'bg-studio-neon' : 'bg-studio-red'}`} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-white/70">
                                    {summary?.hasBankDetails ? 'Bank Setup Completed' : 'Bank Setup Missing'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${summary?.settingsStatus === 'verified' ? 'bg-studio-neon' : 'bg-studio-yellow animate-pulse'}`} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-white/70">
                                    KYC Status: <span className="text-studio-yellow uppercase">{summary?.settingsStatus}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button Section */}
                    <div className="lg:col-span-2 flex flex-col justify-center space-y-4">
                        {feedback && (
                            <div className={`p-4 border-2 border-black flex items-start gap-2.5 ${feedback.type === 'success' ? 'bg-studio-neon/20' : 'bg-studio-red/20'}`}>
                                <AlertCircle className={feedback.type === 'success' ? 'text-studio-neon' : 'text-studio-red'} size={14} />
                                <p className={`text-[9px] font-black uppercase tracking-widest leading-relaxed ${feedback.type === 'success' ? 'text-studio-neon' : 'text-studio-red'}`}>
                                    {feedback.text}
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={handleRequestPayout}
                            disabled={requesting || (summary?.availableBalance || 0) < 5000 || summary?.settingsStatus !== 'verified'}
                            className={`studio-button w-full !py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-transform ${
                                (summary?.availableBalance || 0) >= 5000 && summary?.settingsStatus === 'verified'
                                    ? '!bg-studio-yellow text-black hover:-translate-y-0.5' 
                                    : '!bg-white/5 !text-white/30 border-2 border-white/10 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {requesting ? (
                                <><Loader2 size={16} className="animate-spin text-black" /> Processing Request...</>
                            ) : (
                                <><SendHorizontal size={16} /> Request Payout</>
                            )}
                        </button>

                        {/* Informative warning guides */}
                        {summary?.settingsStatus !== 'verified' ? (
                            <p className="text-[9px] font-mono text-studio-yellow/80 text-center uppercase tracking-widest">
                                ⚠️ Account Verification required to submit request.
                            </p>
                        ) : (summary?.availableBalance || 0) < 5000 ? (
                            <p className="text-[9px] font-mono text-white/30 text-center uppercase tracking-widest">
                                Minimum threshold for disbursement is ₹5,000.
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="comic-panel p-6 neon-border bg-studio-grey">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Total Paid Out</p>
                    <h3 className="text-3xl font-black italic text-studio-neon comic-text">₹{(summary?.totalPaid || 0).toLocaleString('en-IN')}</h3>
                </div>
                <div className="comic-panel p-6 yellow-border bg-studio-grey">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Total Revenue Earned</p>
                    <h3 className="text-3xl font-black italic text-studio-yellow comic-text">₹{(summary?.totalRevenue || 0).toLocaleString('en-IN')}</h3>
                </div>
                <div className="comic-panel p-6 blue-border bg-studio-grey">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Pending/Processing</p>
                    <h3 className="text-3xl font-black italic text-studio-blue comic-text">₹{(summary?.totalPending || 0).toLocaleString('en-IN')}</h3>
                </div>
            </div>

            {/* Payout History Table */}
            <div className="comic-panel p-8 yellow-border">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                    <Receipt className="text-studio-yellow" />
                    <h3 className="text-xl font-black uppercase italic">Transaction Ledger</h3>
                </div>

                {summary?.payouts && summary.payouts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-white/10">
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Date Requested</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Billing Cycle</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Amount</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">UTR / Txn ID</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Status</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Details / Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.payouts.map((payout: any) => {
                                    const config = STATUS_CONFIG[payout.status] || STATUS_CONFIG.pending;
                                    const StatusIcon = config.icon;
                                    return (
                                        <tr key={payout.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-xs font-bold text-white/70">
                                                {new Date(payout.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-3 text-xs font-black uppercase text-white/80">{payout.payout_month}</td>
                                            <td className="p-3">
                                                <span className="text-sm font-black text-studio-neon">₹{Number(payout.amount).toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-[10px] font-mono bg-black px-2 py-1 border border-white/10 text-white/60">
                                                    {payout.utr_number || 'Processing...'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                                                    {payout.status === 'processing' ? <Loader2 size={12} className="animate-spin" /> : <StatusIcon size={12} />}
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="p-3 text-[10px] text-white/40 max-w-[150px] truncate">{payout.notes || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                        <Wallet size={48} className="text-white/20 mb-4" />
                        <h4 className="text-xl font-black uppercase italic mb-2">No Disbursements Recorded</h4>
                        <p className="text-xs text-white/40 max-w-sm">
                            Your payout requests and bank settlements will appear here once submitted. Minimum threshold for payout request is ₹5,000.
                        </p>
                    </div>
                )}
            </div>

            {/* Compliance Note */}
            <div className="p-4 bg-white/5 border border-white/10 flex items-start gap-3">
                <AlertCircle size={16} className="text-studio-yellow shrink-0 mt-0.5" />
                <p className="text-[10px] text-white/50 font-mono leading-relaxed">
                    All payout requests undergo automated compliance auditing. Payouts are finalized within 24-48 business hours into your configured bank account. Keep your transaction UTR numbers for compliance and personal tax records.
                </p>
            </div>
        </div>
    );
}
