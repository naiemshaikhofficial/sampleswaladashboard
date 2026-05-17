import { getAnalyticsData } from '@/lib/dashboard-actions';
import { BarChart3, MapPin, Clock, CalendarDays, TrendingUp, Package } from 'lucide-react';

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();
    const maxHourly = data ? Math.max(...data.hourlyData.map(h => h.count), 1) : 1;
    const maxDaily = data ? Math.max(...data.dailyData.map(d => d.count), 1) : 1;
    const maxGeo = data?.geography?.length ? data.geography[0].count : 1;

    if (!data) {
        return (
            <div className="space-y-12">
                <div><h2 className="section-heading">Analytics <span className="text-studio-purple">Deep Dive</span></h2></div>
                <div className="comic-panel p-16 text-center border-dashed border-white/10">
                    <BarChart3 size={64} className="mx-auto mb-6 text-white/10" />
                    <h3 className="text-2xl font-black uppercase italic mb-4">No Analytics Data</h3>
                    <p className="text-sm text-white/40 max-w-md mx-auto">Analytics will populate once your packs start generating sales.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div>
                <h2 className="section-heading">Analytics <span className="text-studio-purple">Deep Dive</span></h2>
                <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">Understand your audience — where they are, when they buy, and which packs perform best.</p>
            </div>

            {/* Geography */}
            <div className="comic-panel p-8 pink-border">
                <h4 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2"><MapPin size={20} className="text-studio-pink" /> Buyer Geography</h4>
                {data.geography.length > 0 ? (
                    <div className="space-y-4">
                        {data.geography.map((geo, idx) => (
                            <div key={geo.location} className="flex items-center gap-4 group">
                                <span className="text-studio-pink font-black text-sm w-6">#{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end text-xs font-bold uppercase mb-1">
                                        <span className="text-white/80">{geo.location}</span>
                                        <span className="text-studio-neon text-sm font-black">{geo.count} sales</span>
                                    </div>
                                    <div className="w-full h-3 bg-black border border-white/10 overflow-hidden">
                                        <div className="h-full bg-studio-pink group-hover:bg-studio-neon transition-colors" style={{ width: `${Math.max(8, (geo.count / maxGeo) * 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-white/40 italic">Not enough data yet.</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Peak Hours */}
                <div className="comic-panel p-8 blue-border">
                    <h4 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2"><Clock size={18} className="text-studio-blue" /> Peak Hours</h4>
                    <div className="flex items-end gap-1 h-40">
                        {data.hourlyData.map(h => (
                            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group" title={`${h.label}: ${h.count} sales`}>
                                <div className="w-full" style={{ height: `${Math.max(4, (h.count / maxHourly) * 100)}%` }}>
                                    <div className={`w-full h-full border border-black ${h.count === maxHourly && h.count > 0 ? 'bg-studio-neon' : 'bg-studio-blue group-hover:bg-studio-neon'} transition-colors`} />
                                </div>
                                {h.hour % 6 === 0 && <span className="text-[7px] text-white/30 font-black">{h.label.split(':')[0]}</span>}
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-white/30 mt-3 text-center uppercase tracking-widest">Hours (IST) →</p>
                </div>

                {/* Peak Days */}
                <div className="comic-panel p-8 neon-border">
                    <h4 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2"><CalendarDays size={18} className="text-studio-neon" /> Peak Days</h4>
                    <div className="space-y-3">
                        {data.dailyData.map(d => (
                            <div key={d.day} className="flex items-center gap-3 group">
                                <span className="text-[10px] font-black uppercase text-white/50 w-8">{d.short}</span>
                                <div className="flex-1 h-6 bg-black border border-white/10 overflow-hidden">
                                    <div className={`h-full ${d.count === maxDaily && d.count > 0 ? 'bg-studio-neon' : 'bg-studio-blue group-hover:bg-studio-neon'} transition-colors`} style={{ width: `${Math.max(5, (d.count / maxDaily) * 100)}%` }} />
                                </div>
                                <span className="text-xs font-black text-white/60 w-8 text-right">{d.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Per-Pack Trends */}
            <div className="comic-panel p-8 yellow-border">
                <h4 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-studio-yellow" /> Per-Pack Monthly Sales</h4>
                {Object.keys(data.packTrends).length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(data.packTrends).map(([packName, months]) => (
                            <div key={packName}>
                                <h5 className="text-sm font-black uppercase text-studio-yellow mb-3 flex items-center gap-2"><Package size={14} /> {packName}</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {Object.entries(months as Record<string, number>).map(([month, count]) => (
                                        <div key={month} className="p-3 bg-black border border-white/10 text-center hover:border-studio-yellow transition-colors">
                                            <p className="text-[9px] text-white/40 uppercase font-black">{month}</p>
                                            <p className="text-lg font-black text-studio-neon mt-1">{count}</p>
                                            <p className="text-[8px] text-white/30 uppercase">sales</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-white/40 italic">No pack trends yet.</p>}
            </div>
        </div>
    );
}
