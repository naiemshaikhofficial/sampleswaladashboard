import { 
  TrendingUp, 
  Users, 
  Package, 
  Wallet,
  ArrowUpRight,
  ShoppingCart
} from 'lucide-react';
import { getArtistStats } from '@/lib/dashboard-actions';

export default async function DashboardPage() {
  const statsData = await getArtistStats();
  
  const stats = [
    { name: 'Total Revenue', value: `₹${statsData?.totalRevenue || 0}`, icon: TrendingUp, color: 'text-studio-neon', borderColor: 'neon-border' },
    { name: 'Your Share', value: '70%', icon: Wallet, color: 'text-studio-pink', borderColor: 'pink-border' },
    { name: 'Active Packs', value: `${statsData?.activePacks || 0}`, icon: Package, color: 'text-studio-blue', borderColor: 'blue-border' },
    { name: 'Total Sales', value: `${statsData?.totalSales || 0}`, icon: ShoppingCart, color: 'text-studio-yellow', borderColor: 'yellow-border' },
  ];

  return (
    <div className="space-y-12">
      {/* Heading */}
      <div className="relative">
        <h2 className="section-heading">
            Artist <span className="text-studio-neon">Center</span>
        </h2>
        <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">
            Track your performance, manage collaborations, and watch your revenue grow. 
            Detailed splits applied per pack as per your agreements.
        </p>
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
        {/* Sales Performance Placeholder */}
        <div className="lg:col-span-2 comic-panel p-8 blue-border min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-lg">
                <TrendingUp size={48} className="text-studio-blue mx-auto mb-4 opacity-20" />
                <h4 className="text-xl font-black uppercase italic mb-2">Sales Visualization</h4>
                <p className="text-xs text-white/40 max-w-xs">
                    Detailed sales charts will appear here as soon as your packs start generating revenue.
                </p>
            </div>
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
