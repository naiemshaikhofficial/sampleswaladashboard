'use server';

import { getAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

import { unstable_cache } from 'next/cache';

export async function getArtistStats() {
    const { data: { user } } = await getUser();
    if (!user) return null;

    const fetchStats = unstable_cache(
        async (userId: string) => {
            const admin = getAdminClient();

            // 1. Fetch Collaborations for this artist
            const { data: collabs, error: collabError } = await admin
                .from('artist_collaborations')
                .select('*')
                .eq('artist_id', userId);

            if (collabError || !collabs) {
                console.error('[GET_ARTIST_STATS_COLLAB_ERROR]', collabError);
                return {
                    totalRevenue: 0,
                    activePacks: 0,
                    totalSales: 0,
                    collabs: []
                };
            }

            const productIds = collabs.map(c => c.product_id);

            if (productIds.length === 0) {
                return {
                    totalRevenue: 0,
                    activePacks: 0,
                    totalSales: 0,
                    collabs: []
                };
            }

            // 2. Fetch Sales from user_vault for these products
            const { data: sales, error: salesError } = await admin
                .from('user_vault')
                .select('item_id, amount, created_at')
                .in('item_id', productIds);

            if (salesError) {
                console.error('[GET_ARTIST_STATS_SALES_ERROR]', salesError);
                return {
                    totalRevenue: 0,
                    activePacks: productIds.length,
                    totalSales: 0,
                    collabs: collabs,
                    monthlyData: []
                };
            }

            // 3. Calculate Revenue Split & Calendar Wise Data
            let totalArtistRevenue = 0;
            const monthlyRevenueMap: Record<string, number> = {};
            
            sales?.forEach(sale => {
                const collab = collabs.find(c => c.product_id === sale.item_id);
                if (collab) {
                    const share = (Number(sale.amount) * Number(collab.share_percent)) / 100;
                    totalArtistRevenue += share;

                    // Group by Month (e.g., "Jan 2026")
                    const date = new Date(sale.created_at);
                    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    
                    if (!monthlyRevenueMap[monthYear]) {
                        monthlyRevenueMap[monthYear] = 0;
                    }
                    monthlyRevenueMap[monthYear] += share;
                }
            });

            // Convert map to array for chart/UI consumption
            const monthlyData = Object.keys(monthlyRevenueMap).map(month => ({
                month,
                revenue: Math.round(monthlyRevenueMap[month])
            })).sort((a, b) => {
                // simple sort by date
                return new Date(a.month).getTime() - new Date(b.month).getTime();
            });

            return {
                totalRevenue: Math.round(totalArtistRevenue),
                activePacks: productIds.length,
                totalSales: sales?.length || 0,
                collabs: collabs,
                monthlyData
            };
        },
        ['artist-stats'],
        { 
            revalidate: 86400, // 24 hours
            tags: [`stats-${user.id}`] 
        }
    );

    return fetchStats(user.id);
}

export async function updatePayoutSettings(formData: any) {
    const { data: { user } } = await getUser();
    if (!user) throw new Error("Unauthorized");

    const admin = getAdminClient();

    const { error } = await admin
        .from('artist_payout_settings')
        .upsert({
            user_id: user.id,
            ...formData,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('[UPDATE_PAYOUT_SETTINGS_ERROR]', error);
        throw error;
    }

    return { success: true };
}
