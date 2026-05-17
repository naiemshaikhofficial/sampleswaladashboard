import { 
  TrendingUp, 
  Users, 
  Package, 
  Wallet,
  ArrowUpRight,
  ShoppingCart
} from 'lucide-react';
import { getArtistStats } from '@/lib/dashboard-actions';
import Link from 'next/link';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string };
}) {
  const { startDate, endDate } = searchParams;
  const statsData = await getArtistStats(startDate, endDate);
  
  const stats = [
    { name: 'Total Revenue', value: `₹${statsData?.totalRevenue || 0}`, icon: TrendingUp, color: 'text-studio-neon', borderColor: 'neon-border' },
    { name: 'Your Share', value: '70%', icon: Wallet, color: 'text-studio-pink', borderColor: 'pink-border' },
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
        {/* Sales Performance Calendar View */}
        <div className="lg:col-span-2 comic-panel p-8 blue-border min-h-[400px] flex flex-col">
            <h4 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2 text-studio-blue">
                <TrendingUp size={20} /> Calendar wise Revenue
            </h4>
            
            {statsData?.monthlyData && statsData.monthlyData.length > 0 ? (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                    {statsData.monthlyData.map((data: any, idx: number) => {
                        // find the max revenue to scale the bars (prevent divide by 0)
                        const maxRev = Math.max(...statsData.monthlyData.map((d: any) => d.revenue), 1);
                        const widthPercent = Math.max(10, (data.revenue / maxRev) * 100);
                        
                        return (
                            <div key={idx} className="flex flex-col gap-1 w-full">
                                <div className="flex justify-between items-center text-xs font-bold uppercase text-white/80">
                                    <span>{data.month}</span>
                                    <span className="text-studio-neon">₹{data.revenue.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="w-full h-8 bg-black border border-white/10 relative overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-studio-blue border-r-4 border-white transition-all duration-1000"
                                        style={{ width: `${widthPercent}%` }}
                                    >
                                        {/* Halftone pattern overlay */}
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-center">
                    <TrendingUp size={48} className="text-studio-blue mx-auto mb-4 opacity-20" />
                    <h4 className="text-xl font-black uppercase italic mb-2">No Sales Yet</h4>
                    <p className="text-xs text-white/40 max-w-xs">
                        Calendar-wise sales charts will appear here as soon as your packs start generating revenue.
                    </p>
                </div>
            )}
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className="space-y-6">
            <div className="comic-panel p-6 yellow-border">
                <h4 className="text-sm font-black uppercase italic mb-6 flex items-center gap-2">
                    <TrendingUp size={16} /> Quick Actions
                </h4>
                <div className="space-y-3">
                    <button className="studio-button w-full text-[9px]">
                        Upload New Pack
                    </button>
                    <button className="studio-button w-full text-[9px] !bg-black !text-white hover:!bg-white hover:!text-black">
                        View Agreements
                    </button>
                    <button className="studio-button w-full text-[9px] !bg-black !text-white hover:!bg-white hover:!text-black">
                        Download Report
                    </button>
                </div>
            </div>

            <div className="comic-panel p-6 pink-border">
                <h4 className="text-sm font-black uppercase italic mb-6">Agreement Status</h4>
                <div className="p-4 bg-black/40 border border-white/10 italic text-xs text-white/60">
                    "Your standard revenue share is set to 70%. Custom splits are applied to individual collaborations."
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
