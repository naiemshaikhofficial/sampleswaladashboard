import { 
  TrendingUp, 
  Users, 
  Package, 
  Wallet,
  ArrowUpRight,
  ShoppingCart,
  Award,
  Zap,
  Flame,
  Crown,
  Star,
  Trophy
} from 'lucide-react';
import { getArtistStats } from '@/lib/dashboard-actions';
import Link from 'next/link';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const { startDate, endDate } = await searchParams;
  const statsData = await getArtistStats(startDate, endDate);
  
  // Calculate average share across all active collaborations
  const avgShare = statsData?.collabs && statsData.collabs.length > 0
    ? Math.round(statsData.collabs.reduce((sum: number, c: any) => sum + Number(c.share_percent), 0) / statsData.collabs.length)
    : 0;

  const stats = [
    { name: 'Total Revenue', value: `₹${statsData?.totalRevenue || 0}`, icon: TrendingUp, color: 'text-studio-neon', borderColor: 'neon-border' },
    { name: 'Avg. Share', value: `${avgShare}%`, icon: Wallet, color: 'text-studio-pink', borderColor: 'pink-border' },
    { name: 'Active Packs', value: `${statsData?.activePacks || 0}`, icon: Package, color: 'text-studio-blue', borderColor: 'blue-border' },
    { name: 'Total Sales', value: `${statsData?.totalSales || 0}`, icon: ShoppingCart, color: 'text-studio-yellow', borderColor: 'yellow-border' },
  ];

  return (
    <div className="space-y-12">
      {/* Heading */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h2 className="section-heading">
                Artist <span className="text-studio-neon">Center</span>
            </h2>
            <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">
                Track your performance, manage collaborations, and watch your revenue grow. 
                Detailed splits applied per pack as per your agreements.
            </p>
        </div>
        
        {/* Date Filter Form */}
        <form method="GET" action="/" className="flex items-center bg-black border-2 border-studio-charcoal shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
            <input 
                type="date" 
                name="startDate" 
                defaultValue={startDate} 
                required
                className="px-2 py-2 bg-transparent text-xs text-white/80 font-mono outline-none border-none"
            />
            <span className="text-white/40 text-[10px] uppercase font-black px-1">To</span>
            <input 
                type="date" 
                name="endDate" 
                defaultValue={endDate} 
                required
                className="px-2 py-2 bg-transparent text-xs text-white/80 font-mono outline-none border-none"
            />
            <button type="submit" className="bg-studio-neon text-black px-4 py-2 h-full text-[10px] font-black uppercase hover:bg-white transition-colors border-l-2 border-studio-charcoal">
                Filter
            </button>
            {(startDate || endDate) && (
                <Link href="/" className="bg-black text-white/60 hover:text-studio-pink px-3 py-2 h-full text-[10px] font-black uppercase transition-colors border-l-2 border-studio-charcoal flex items-center justify-center">
                    Clear
                </Link>
            )}
        </form>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
          <h3 className="text-lg font-black italic uppercase text-white/80">Overview</h3>
          <div className="text-[10px] bg-black border-2 border-studio-charcoal px-3 py-1.5 font-bold uppercase tracking-wider text-white/60 flex items-center gap-2 shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
              <div className="w-2 h-2 rounded-full bg-studio-neon animate-pulse" />
              Sales & Revenue data updates every 24 hours
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className={`comic-panel p-6 ${stat.borderColor} group hover:-translate-y-1 transition-transform cursor-pointer`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">{stat.name}</p>
                <h3 className={`text-3xl font-black italic ${stat.color} comic-text`}>{stat.value}</h3>
              </div>
              <div className={`p-2 bg-black border-2 border-black group-hover:bg-white group-hover:text-black transition-colors`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-white/30 uppercase">
                <ArrowUpRight size={12} />
                +0% from last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Secondary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top 5 Sellers View */}
        <div className="lg:col-span-2 comic-panel p-8 blue-border min-h-[400px] flex flex-col">
            <h4 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2 text-studio-blue">
                <Package size={20} /> Top 5 Best Sellers
            </h4>
            
            {statsData?.packPerformance && statsData.packPerformance.filter(p => p.sales > 0).length > 0 ? (
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                    {statsData.packPerformance.filter(p => p.sales > 0).slice(0, 5).map((pack: any, idx: number) => {
                        const validPacks = statsData.packPerformance.filter((p: any) => p.sales > 0);
                        const maxRev = Math.max(...validPacks.map((p: any) => p.revenue), 1);
                        const widthPercent = Math.max(10, (pack.revenue / maxRev) * 100);
                        
                        return (
                            <div key={pack.id} className="flex flex-col gap-2 w-full group cursor-pointer">
                                <div className="flex justify-between items-end text-xs font-bold uppercase text-white/80">
                                    <div className="flex items-center gap-4">
                                        <span className="text-studio-blue font-black text-lg">#{idx + 1}</span>
                                        {pack.cover_url && (
                                            <div className="w-8 h-8 bg-studio-charcoal border border-white/20 overflow-hidden flex-shrink-0">
                                                <img src={pack.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            </div>
                                        )}
                                        <span className="truncate max-w-[150px] sm:max-w-xs group-hover:text-white transition-colors">{pack.name}</span>
                                    </div>
                                    <div className="text-right flex flex-col">
                                        <span className="text-studio-neon text-sm font-black">₹{pack.revenue.toLocaleString('en-IN')}</span>
                                        <span className="text-[10px] text-white/40 tracking-widest">{pack.sales} Units</span>
                                    </div>
                                </div>
                                <div className="w-full h-4 bg-black border border-white/10 relative overflow-hidden rounded-r-sm">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-studio-blue border-r-2 border-white transition-all duration-1000 group-hover:bg-studio-neon"
                                        style={{ width: `${widthPercent}%` }}
                                    >
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 p-6 bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                    <Package size={48} className="text-studio-blue mx-auto mb-4 opacity-20" />
                    <h4 className="text-xl font-black uppercase italic mb-2">No Sales Yet</h4>
                    <p className="text-xs text-white/40 max-w-xs">
                        Top performing packs will appear here once your collaborations start generating revenue.
                    </p>
                </div>
            )}
        </div>

        {/* Side Widgets */}
        <div className="space-y-6">
            {statsData?.topPack ? (
                <div className="comic-panel p-6 yellow-border group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-studio-yellow text-black px-3 py-1 font-black text-[10px] uppercase tracking-widest z-10 border-b-2 border-l-2 border-black">
                        Top Seller
                    </div>
                    <h4 className="text-sm font-black uppercase italic mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-studio-yellow" /> Best Performing
                    </h4>
                    
                    <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-studio-charcoal border-2 border-black flex-shrink-0 relative overflow-hidden">
                            {statsData.topPack.cover_url ? (
                                <img src={statsData.topPack.cover_url} alt={statsData.topPack.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={24} /></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-black uppercase truncate text-studio-neon">{statsData.topPack.name}</h5>
                            <div className="mt-2 space-y-1">
                                <p className="text-[10px] text-white/60 uppercase font-bold flex justify-between">
                                    <span>Sales:</span> <span className="text-white">{statsData.topPack.sales}</span>
                                </p>
                                <p className="text-[10px] text-white/60 uppercase font-bold flex justify-between">
                                    <span>Revenue:</span> <span className="text-studio-yellow">₹{statsData.topPack.revenue.toLocaleString('en-IN')}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="comic-panel p-6 yellow-border opacity-50">
                    <h4 className="text-sm font-black uppercase italic mb-4 flex items-center gap-2">
                        <TrendingUp size={16} /> Best Performing
                    </h4>
                    <p className="text-xs font-mono text-white/40">No sales data available yet to determine the top seller.</p>
                </div>
            )}

            {/* Achievements Section */}
            <div className="comic-panel p-6 neon-border bg-studio-charcoal">
                <h4 className="text-sm font-black uppercase italic mb-4 flex items-center gap-2 text-studio-neon">
                    <Award size={16} /> Artist Milestones
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { 
                            name: 'First Sale', 
                            desc: 'Sell 1 unit',
                            unlocked: (statsData?.totalSales || 0) >= 1, 
                            icon: Zap, 
                            color: 'bg-studio-blue text-black', 
                            lockedColor: 'bg-white/5 text-white/20 border-white/10' 
                        },
                        { 
                            name: 'Hit Maker', 
                            desc: 'Sell 10 units',
                            unlocked: (statsData?.totalSales || 0) >= 10, 
                            icon: Flame, 
                            color: 'bg-studio-pink text-black', 
                            lockedColor: 'bg-white/5 text-white/20 border-white/10' 
                        },
                        { 
                            name: 'Chart Topper', 
                            desc: 'Sell 50 units',
                            unlocked: (statsData?.totalSales || 0) >= 50, 
                            icon: Crown, 
                            color: 'bg-studio-yellow text-black', 
                            lockedColor: 'bg-white/5 text-white/20 border-white/10' 
                        },
                        { 
                            name: 'Bronze Club', 
                            desc: 'Earn ₹10K',
                            unlocked: (statsData?.totalRevenue || 0) >= 10000, 
                            icon: Star, 
                            color: 'bg-amber-600 text-black', 
                            lockedColor: 'bg-white/5 text-white/20 border-white/10' 
                        },
                        { 
                            name: 'Silver Club', 
                            desc: 'Earn ₹50K',
                            unlocked: (statsData?.totalRevenue || 0) >= 50000, 
                            icon: Star, 
                            color: 'bg-slate-300 text-black', 
                            lockedColor: 'bg-white/5 text-white/20 border-white/10' 
                        },
                        { 
                            name: 'Gold Club', 
                            desc: 'Earn ₹1L',
                            unlocked: (statsData?.totalRevenue || 0) >= 100000, 
                            icon: Trophy, 
                            color: 'bg-yellow-400 text-black', 
                            lockedColor: 'bg-white/5 text-white/20 border-white/10' 
                        },
                    ].map((badge) => {
                        const Icon = badge.icon;
                        return (
                            <div 
                                key={badge.name} 
                                className={`flex flex-col items-center justify-center p-2 border-2 text-center group relative transition-all ${
                                    badge.unlocked 
                                        ? 'border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 ' + badge.color 
                                        : 'border-transparent ' + badge.lockedColor
                                }`}
                                title={`${badge.name}: ${badge.desc} (${badge.unlocked ? 'Unlocked' : 'Locked'})`}
                            >
                                <Icon size={20} className={badge.unlocked ? 'animate-pulse' : ''} />
                                <span className="text-[7px] font-black uppercase tracking-tight mt-1 truncate w-full">{badge.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="comic-panel p-6 pink-border">
                <h4 className="text-sm font-black uppercase italic mb-6">Agreement Status</h4>
                <div className="p-4 bg-black/40 border border-white/10 italic text-xs text-white/60">
                    "Revenue splits are automatically calculated per pack using the exact percentages defined in your producer agreements."
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
                <Link href="/my-packs" className="studio-button w-full text-[9px] !py-3">
                    View Collaborations
                </Link>
                <Link href="/revenue" className="studio-button w-full text-[9px] !bg-transparent !text-white/60 hover:!text-white border-2 border-white/10 hover:border-white !py-3">
                    View Revenue Splits
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
