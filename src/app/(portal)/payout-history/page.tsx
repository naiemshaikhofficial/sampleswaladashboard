import { getPayoutHistory } from '@/lib/dashboard-actions';
import { Wallet, Clock, CheckCircle2, AlertCircle, Loader2, ArrowDownRight, Receipt } from 'lucide-react';

export default async function PayoutHistoryPage() {
    const payouts = await getPayoutHistory();

    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
        paid: { color: 'text-studio-neon', icon: CheckCircle2, label: 'Paid' },
        processing: { color: 'text-studio-yellow', icon: Loader2, label: 'Processing' },
        pending: { color: 'text-studio-blue', icon: Clock, label: 'Pending' },
        failed: { color: 'text-studio-red', icon: AlertCircle, label: 'Failed' },
    };

    const totalPaid = payouts
        .filter((p: any) => p.status === 'paid')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    return (
        <div className="space-y-12">
            <div className="relative">
                <h2 className="section-heading">
                    Payout <span className="text-studio-yellow">History</span>
                </h2>
                <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">
                    Complete record of all payouts processed to your bank account. Keep this for your tax records.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="comic-panel p-6 neon-border">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Total Paid Out</p>
                    <h3 className="text-3xl font-black italic text-studio-neon comic-text">₹{totalPaid.toLocaleString('en-IN')}</h3>
                </div>
                <div className="comic-panel p-6 yellow-border">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Total Transactions</p>
                    <h3 className="text-3xl font-black italic text-studio-yellow comic-text">{payouts.length}</h3>
                </div>
                <div className="comic-panel p-6 blue-border">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Pending Payouts</p>
                    <h3 className="text-3xl font-black italic text-studio-blue comic-text">
                        {payouts.filter((p: any) => p.status === 'pending' || p.status === 'processing').length}
                    </h3>
                </div>
            </div>

            {/* Payout Table */}
            <div className="comic-panel p-8 yellow-border">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                    <Receipt className="text-studio-yellow" />
                    <h3 className="text-xl font-black uppercase italic">Transaction Log</h3>
                </div>

                {payouts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-white/10">
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Date</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Month</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Amount</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">UTR / Txn ID</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Status</th>
                                    <th className="text-left text-[9px] font-black uppercase text-white/40 tracking-widest p-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((payout: any) => {
                                    const config = statusConfig[payout.status] || statusConfig.pending;
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
                                                    {payout.utr_number || '—'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                                                    <StatusIcon size={12} />
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
                        <h4 className="text-xl font-black uppercase italic mb-2">No Payouts Yet</h4>
                        <p className="text-xs text-white/40 max-w-sm">
                            Your payout records will appear here once your first payout is processed. Payouts are disbursed on the 1st of every month.
                        </p>
                    </div>
                )}
            </div>

            {/* Info Note */}
            <div className="p-4 bg-white/5 border border-white/10 flex items-start gap-3">
                <AlertCircle size={16} className="text-studio-yellow shrink-0 mt-0.5" />
                <p className="text-[10px] text-white/50 font-mono leading-relaxed">
                    Payouts are processed on the 1st of every month for the previous month's cleared revenue. Minimum payout threshold is ₹5,000. Keep your UTR numbers for your tax records.
                </p>
            </div>
        </div>
    );
}
