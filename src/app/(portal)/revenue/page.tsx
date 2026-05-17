import { getArtistStats } from '@/lib/dashboard-actions';
import { TrendingUp, DollarSign, Calendar, Info, Download } from 'lucide-react';
import Link from 'next/link';

export default async function RevenuePage() {
    const statsData = await getArtistStats();
    
    // Find current month revenue for "Upcoming Payout" estimate
    const currentDate = new Date();
    const currentMonthYear = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const currentMonthData = statsData?.monthlyData?.find(d => d.month === currentMonthYear);
    const estimatedPayout = currentMonthData ? currentMonthData.revenue : 0;

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="relative">
                <h2 className="section-heading flex items-center gap-4">
                    Revenue & <span className="text-studio-neon">Payouts</span>
                </h2>
                <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">
                    Track your financial performance over time. Payouts are processed on the 1st of every month for the previous month's cleared earnings.
                </p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="comic-panel p-8 neon-border flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-black uppercase text-white/50 tracking-widest mb-2">Lifetime Earnings (Your Share)</p>
                            <h3 className="text-5xl font-black italic text-studio-neon comic-text">
                                ₹{statsData?.totalRevenue?.toLocaleString('en-IN') || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-black border-2 border-black group-hover:bg-white group-hover:text-black transition-colors">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <p className="text-[10px] text-white/40 font-mono mt-6 flex items-center gap-2 uppercase">
                        <Info size={12} /> Total amount earned from all pack sales.
                    </p>
                </div>

                <div className="comic-panel p-8 pink-border flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-black uppercase text-white/50 tracking-widest mb-2">Estimated Next Payout</p>
                            <h3 className="text-5xl font-black italic text-white comic-text">
                                ₹{estimatedPayout.toLocaleString('en-IN')}
                            </h3>
                        </div>
                        <div className="p-3 bg-black border-2 border-black group-hover:bg-white group-hover:text-black transition-colors">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-[10px] text-studio-pink font-mono uppercase flex items-center gap-2 font-bold">
                            <Calendar size={12} /> Earned in {currentMonthYear}
                        </p>
                        <Link href="/settings" className="text-[10px] uppercase font-black tracking-widest hover:text-studio-pink underline decoration-2 underline-offset-4 transition-colors">
                            Update Bank Info
                        </Link>
                    </div>
                </div>
            </div>

            {/* Detailed Monthly Breakdown */}
            <div className="comic-panel p-8 blue-border">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-2xl font-black uppercase italic flex items-center gap-3">
                        <Calendar size={24} className="text-studio-blue" />
                        Monthly Breakdown
                    </h4>
                    <button className="studio-button !py-2 !px-4 !text-[10px] flex items-center gap-2">
                        <Download size={14} /> Export CSV
                    </button>
                </div>

                {statsData?.monthlyData && statsData.monthlyData.length > 0 ? (
                    <div className="space-y-6">
                        {statsData.monthlyData.map((data, idx) => {
                            const maxRev = Math.max(...statsData.monthlyData.map(d => d.revenue), 1);
                            const widthPercent = Math.max(5, (data.revenue / maxRev) * 100);

                            return (
                                <div key={idx} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end text-sm font-black uppercase">
                                        <span className="text-white/80">{data.month}</span>
                                        <span className="text-studio-neon text-lg">₹{data.revenue.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="w-full h-12 bg-black border-2 border-white/10 relative overflow-hidden group">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-studio-blue border-r-4 border-white transition-all duration-1000 flex items-center justify-end px-4 group-hover:bg-studio-neon"
                                            style={{ width: `${widthPercent}%` }}
                                        >
                                            {/* Halftone Pattern */}
                                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '6px 6px' }} />
                                            {widthPercent > 15 && (
                                                <span className="relative z-10 text-black font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {Math.round((data.revenue / (statsData.totalRevenue || 1)) * 100)}% of Total
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                        <TrendingUp size={48} className="text-white/20 mb-4" />
                        <h5 className="text-xl font-black uppercase text-white/50">No Data Available</h5>
                        <p className="text-xs text-white/30 max-w-sm mt-2">
                            Revenue charts and monthly breakdowns will appear here once your packs start selling.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Note */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                <h5 className="text-sm font-black uppercase text-white/80 mb-2 flex items-center gap-2">
                    <Info size={16} className="text-studio-yellow" />
                    Important Notes regarding Payouts
                </h5>
                <ul className="text-xs text-white/50 space-y-2 font-mono list-disc pl-5">
                    <li>Revenue is calculated based on the custom splits defined in your Producer Agreement.</li>
                    <li>Payments are disbursed within the first 7 days of every month for the previous month's total.</li>
                    <li>Ensure your Bank Account / UPI details in <Link href="/settings" className="text-white underline">Payout Settings</Link> are up to date.</li>
                    <li>TDS (Tax Deducted at Source) may be applicable as per Indian government regulations.</li>
                </ul>
            </div>
        </div>
    );
}
