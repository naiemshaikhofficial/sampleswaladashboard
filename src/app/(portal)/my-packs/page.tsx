import React from 'react';
import { Music, Eye, Download, TrendingUp, Info } from 'lucide-react';
import { getArtistStats } from '@/lib/dashboard-actions';
import { getAdminClient } from '@/lib/supabase/admin';

export default async function MyPacksPage() {
    const statsData = await getArtistStats();
    const admin = getAdminClient();

    // Fetch pack details for the collaborations
    const productIds = statsData?.collabs.map(c => c.product_id) || [];
    
    const { data: packs } = productIds.length > 0 
        ? await admin.from('sample_packs').select('id, name, slug, cover_url, price_inr').in('id', productIds)
        : { data: [] };

    return (
        <div className="space-y-12">
            <div className="relative">
                <h2 className="section-heading">
                    My <span className="text-studio-blue">Collaborations</span>
                </h2>
                <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">
                    List of all sample packs and presets where you are credited as a collaborator. 
                    Check individual performance and your specific share percentage.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {packs && packs.length > 0 ? (
                    packs.map((pack) => {
                        const collab = statsData?.collabs.find(c => c.product_id === pack.id);
                        return (
                            <div key={pack.id} className="comic-panel p-6 blue-border flex flex-col md:flex-row items-center gap-8 group">
                                {/* Cover */}
                                <div className="w-full md:w-32 aspect-square bg-studio-charcoal border-4 border-black relative overflow-hidden flex-shrink-0">
                                    {pack.cover_url ? (
                                        <img src={pack.cover_url} alt={pack.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            <Music size={40} />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic text-studio-blue leading-tight">{pack.name}</h3>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Role: {collab?.role || 'Contributor'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-black/40 border border-white/5">
                                            <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-1">Price</p>
                                            <p className="text-xs font-black">₹{pack.price_inr}</p>
                                        </div>
                                        <div className="p-3 bg-black/40 border border-white/5">
                                            <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-1">Your Share</p>
                                            <p className="text-xs font-black text-studio-neon">{collab?.share_percent}%</p>
                                        </div>
                                        <div className="p-3 bg-black/40 border border-white/5">
                                            <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-1">Total Sales</p>
                                            <p className="text-xs font-black">0</p>
                                        </div>
                                        <div className="p-3 bg-black/40 border border-white/5">
                                            <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-1">Status</p>
                                            <p className="text-xs font-black text-studio-neon uppercase">Active</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <button className="studio-button text-[9px] w-full">
                                        <TrendingUp size={14} /> Analytics
                                    </button>
                                    <button className="studio-button text-[9px] w-full !bg-black !text-white hover:!bg-white hover:!text-black">
                                        <Info size={14} /> Agreement
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="comic-panel p-12 text-center border-dashed border-white/10 opacity-50">
                        <Music size={48} className="mx-auto mb-4 text-white/20" />
                        <h3 className="text-xl font-black uppercase italic mb-2">No Collaborations Found</h3>
                        <p className="text-sm text-white/40 max-w-xs mx-auto">
                            Once you are added to a sample pack as a collaborator, it will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
