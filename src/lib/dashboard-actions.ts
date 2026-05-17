'use server';

import { getAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

import { unstable_cache } from 'next/cache';

// Create a cached function to fetch the raw data once per 24 hours
const getCachedUserData = unstable_cache(
    async (userId: string) => {
        const admin = getAdminClient();

        // 1. Fetch Collaborations
        const { data: collabs, error: collabError } = await admin
            .from('artist_collaborations')
            .select('*')
            .eq('artist_id', userId);

        if (collabError || !collabs || collabs.length === 0) {
            return { collabs: [], sales: [], packs: [] };
        }

        const productIds = collabs.map(c => c.product_id);

        // 2. Fetch ALL Sales
        const { data: sales, error: salesError } = await admin
            .from('user_vault')
            .select('item_id, amount, created_at')
            .in('item_id', productIds);

        // 3. Fetch Pack Details
        const { data: packs } = await admin
            .from('sample_packs')
            .select('id, name, cover_url, price_inr')
            .in('id', productIds);

        return {
            collabs,
            sales: salesError ? [] : (sales || []),
            packs: packs || []
        };
    },
    ['artist-raw-data'],
    { 
        revalidate: 86400, // 24 hours 
        tags: ['artist-stats']
    }
);

export async function getArtistStats(startDate?: string, endDate?: string) {
    const { data: { user } } = await getUser();
    if (!user) return null;

    // Fetch the raw data (cached for 24 hours)
    const { collabs, sales, packs } = await getCachedUserData(user.id);

    if (collabs.length === 0) {
        return {
            totalRevenue: 0,
            activePacks: 0,
            totalSales: 0,
            collabs: [],
            monthlyData: [],
            packSalesCount: {},
            packPerformance: [],
            topPack: null
        };
    }

    // Filter sales in-memory based on requested dates
    let filteredSales = sales;
    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.created_at);
            return saleDate >= start && saleDate <= end;
        });
    }

    // Determine if we should group by Day or Month
    let groupByDay = false;
    if (startDate && endDate) {
        const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays <= 31) groupByDay = true;
    }

    // Calculate Revenue Split & Data
    let totalArtistRevenue = 0;
    const revenueMap: Record<string, number> = {};
    const packSalesCount: Record<string, number> = {};
    
    filteredSales.forEach(sale => {
        const collab = collabs.find(c => c.product_id === sale.item_id);
        
        // Track sales count per pack
        if (!packSalesCount[sale.item_id]) {
            packSalesCount[sale.item_id] = 0;
        }
        packSalesCount[sale.item_id]++;

        if (collab) {
            const share = (Number(sale.amount) * Number(collab.share_percent)) / 100;
            totalArtistRevenue += share;

            const date = new Date(sale.created_at);
            let timeLabel = '';
            if (groupByDay) {
                timeLabel = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            } else {
                timeLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
            
            if (!revenueMap[timeLabel]) {
                revenueMap[timeLabel] = 0;
            }
            revenueMap[timeLabel] += share;
        }
    });

    // Calculate Pack Performance
    const packPerformance = packs.map(pack => {
        const collab = collabs.find(c => c.product_id === pack.id);
        const salesCount = packSalesCount[pack.id] || 0;
        
        const revenue = filteredSales
            .filter(s => s.item_id === pack.id)
            .reduce((sum, s) => sum + ((Number(s.amount) * Number(collab?.share_percent || 0)) / 100), 0);
            
        return {
            id: pack.id,
            name: pack.name,
            cover_url: pack.cover_url,
            sales: salesCount,
            revenue: Math.round(revenue)
        };
    }).sort((a, b) => b.revenue - a.revenue);

    const topPack = packPerformance.length > 0 && packPerformance[0].sales > 0 ? packPerformance[0] : null;

    // Convert map to array for chart
    const monthlyData = Object.keys(revenueMap).map(label => ({
        month: label,
        revenue: Math.round(revenueMap[label])
    })).sort((a, b) => {
        return new Date(a.month).getTime() - new Date(b.month).getTime();
    });

    return {
        totalRevenue: Math.round(totalArtistRevenue),
        activePacks: collabs.length,
        totalSales: filteredSales.length,
        collabs: collabs,
        monthlyData,
        packSalesCount,
        packPerformance,
        topPack
    };
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
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('[UPDATE_PAYOUT_SETTINGS_ERROR]', error);
        throw error;
    }

    return { success: true };
}

export async function getPayoutSettings() {
    const { data: { user } } = await getUser();
    if (!user) return null;

    const admin = getAdminClient();
    const { data, error } = await admin
        .from('artist_payout_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('[GET_PAYOUT_SETTINGS_ERROR]', error);
        return null;
    }

    return data;
}
