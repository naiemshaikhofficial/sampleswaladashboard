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
            .select('user_id, item_id, amount, created_at')
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
    if (!user) return { success: false, error: "Unauthorized. Please log in again." };

    const admin = getAdminClient();

    // Whitelist ONLY safe fields that the artist is permitted to edit.
    // Discard any sensitive system fields like verification_status, kyc_document_id, or user_id.
    const safeData = {
        user_id: user.id,
        legal_name: formData.legal_name,
        billing_address: formData.billing_address,
        pan_number: formData.pan_number,
        aadhaar_number: formData.aadhaar_number,
        gst_number: formData.gst_number,
        account_holder_name: formData.account_holder_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        bank_name: formData.bank_name,
        payout_method: formData.payout_method || 'bank_transfer',
        updated_at: new Date().toISOString()
    };

    const { error } = await admin
        .from('artist_payout_settings')
        .upsert(safeData, { onConflict: 'user_id' });

    if (error) {
        console.error('[UPDATE_PAYOUT_SETTINGS_ERROR]', error);
        return { success: false, error: "Failed to save payout details. Please try again." };
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

// ==================== PAYOUT HISTORY ====================
export async function getPayoutHistory() {
    const { data: { user } } = await getUser();
    if (!user) return [];

    const admin = getAdminClient();
    const { data, error } = await admin
        .from('artist_payouts')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[GET_PAYOUT_HISTORY_ERROR]', error);
        return [];
    }
    return data || [];
}

// ==================== ANALYTICS DEEP DIVE ====================
export async function getAnalyticsData() {
    const { data: { user } } = await getUser();
    if (!user) return null;

    const { collabs, sales, packs } = await getCachedUserData(user.id);
    if (collabs.length === 0) return null;

    const admin = getAdminClient();
    const productIds = collabs.map((c: any) => c.product_id);

    // Fetch buyer details for geography
    const buyerUserIds = [...new Set(sales.map((s: any) => s.user_id))];
    let buyerAccounts: any[] = [];
    if (buyerUserIds.length > 0) {
        const { data } = await admin
            .from('user_accounts')
            .select('user_id, city, state')
            .in('user_id', buyerUserIds);
        buyerAccounts = data || [];
    }

    // Geography breakdown
    const geoMap: Record<string, number> = {};
    sales.forEach((sale: any) => {
        const buyer = buyerAccounts.find((b: any) => b.user_id === sale.user_id);
        const location = buyer?.state || buyer?.city || 'Unknown';
        geoMap[location] = (geoMap[location] || 0) + 1;
    });
    const geography = Object.entries(geoMap)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Hourly breakdown (peak hours)
    const hourMap: Record<number, number> = {};
    sales.forEach((sale: any) => {
        const hour = new Date(sale.created_at).getHours();
        hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        label: `${i.toString().padStart(2, '0')}:00`,
        count: hourMap[i] || 0
    }));

    // Daily breakdown (peak days)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayMap: Record<number, number> = {};
    sales.forEach((sale: any) => {
        const day = new Date(sale.created_at).getDay();
        dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const dailyData = dayNames.map((name, i) => ({
        day: name,
        short: name.slice(0, 3),
        count: dayMap[i] || 0
    }));

    // Per-pack monthly trends
    const packTrends: Record<string, Record<string, number>> = {};
    sales.forEach((sale: any) => {
        const pack = packs.find((p: any) => p.id === sale.item_id);
        if (!pack) return;
        const month = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!packTrends[pack.name]) packTrends[pack.name] = {};
        packTrends[pack.name][month] = (packTrends[pack.name][month] || 0) + 1;
    });

    return {
        totalSales: sales.length,
        geography,
        hourlyData,
        dailyData,
        packTrends,
        packs: packs.map((p: any) => ({ id: p.id, name: p.name, cover_url: p.cover_url }))
    };
}

// ==================== SUPPORT TICKETS ====================
export async function getSupportTickets() {
    const { data: { user } } = await getUser();
    if (!user) return [];

    const admin = getAdminClient();
    const { data, error } = await admin
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[GET_SUPPORT_TICKETS_ERROR]', error);
        return [];
    }
    return data || [];
}

export async function submitSupportTicket(formData: { subject: string; message: string; category: string }) {
    const { data: { user } } = await getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const admin = getAdminClient();
    const { error } = await admin
        .from('support_tickets')
        .insert({
            user_id: user.id,
            subject: formData.subject,
            message: formData.message,
            category: formData.category,
        });

    if (error) {
        console.error('[SUBMIT_TICKET_ERROR]', error);
        return { success: false, error: 'Failed to submit ticket.' };
    }
    return { success: true };
}

// ==================== AGREEMENTS ====================
export async function getAgreements() {
    const { data: { user } } = await getUser();
    if (!user) return [];

    const admin = getAdminClient();
    const { data, error } = await admin
        .from('artist_agreements')
        .select('*, artist_collaborations(product_id, share_percent, role)')
        .eq('artist_id', user.id)
        .order('effective_date', { ascending: false });

    if (error) {
        console.error('[GET_AGREEMENTS_ERROR]', error);
    }

    let agreementsList = data || [];

    // If no agreements exist in the database, return a highly secure, beautifully formatted default fallback agreement
    if (agreementsList.length === 0 && user) {
        // Query active collaborations to pull real configured percentages
        const { data: collabs } = await admin
            .from('artist_collaborations')
            .select('share_percent')
            .eq('artist_id', user.id);

        const configuredShares = collabs && collabs.length > 0
            ? [...new Set(collabs.map((c: any) => `${Number(c.share_percent)}%`))].join(', ')
            : null;

        const artistName = user.email === 'sohanbeatz@gmail.com' || user.email?.includes('sohan') 
            ? 'Somyajeet Sethy (Sohan Beatz)' 
            : user.email?.split('@')[0].toUpperCase() || 'Artist Partner';

        const fallbackAgreement = {
            id: 'default-agreement-id',
            artist_id: user.id,
            title: 'Master Content Distribution & Revenue Sharing Agreement',
            status: 'active',
            effective_date: new Date().toISOString().split('T')[0],
            pack_name: 'All Distributed Products',
            artist_collaborations: {
                share_percent: configuredShares || 'Custom (40% - 70%)',
                role: 'Music Producer / Content Creator'
            },
            terms_html: `
                <div class="space-y-6 font-mono text-xs text-white/80">
                    <p class="font-bold text-studio-orange text-sm mb-4">OFFICIAL COLLABORATION & MONETIZATION CONTRACT</p>
                    
                    <p><strong>Dear ${artistName},</strong></p>
                    
                    <p>This document serves as an official and legally binding collaboration, ownership, distribution, payment, and revenue-sharing agreement between <strong>Samples Wala</strong> (represented by Founder Naiemoddin Nijamoddin Shaikh) and <strong>${artistName}</strong> (also commercially operating as/or affiliated with Sohan Beatz).</p>
                    
                    <p>This agreement governs all digital goods, including but not limited to sample packs, drum kits, stems, one-shots, loops, MIDI files, synth presets, melodies, and sound design templates uploaded, submitted, marketed, or sold through any Samples Wala platform or domain.</p>
                    
                    <hr class="border-white/10 my-4" />
                    
                    <h5 class="text-white font-bold text-xs uppercase tracking-wider mb-2">1. Ownership, Intellectual Property & Platform Distribution Rights</h5>
                    <ul class="list-disc pl-5 space-y-1">
                        <li><strong>Commercial License:</strong> You grant Samples Wala an exclusive, worldwide, royalty-free, perpetual license to host, distribute, publish, advertise, bundle, discount, sub-license, and commercially exploit the submitted materials.</li>
                        <li><strong>Platform Asset Designation:</strong> Any material uploaded, finalized, or made active on the platform is treated as an official platform asset.</li>
                    </ul>

                    <h5 class="text-white font-bold text-xs uppercase tracking-wider mt-4 mb-2">2. Revenue Splits & Dynamic Payout Allocation</h5>
                    <p>For all products distributed through Samples Wala, the revenue splits shall be determined dynamically per product based on the exact configuration set by the platform administrator (Naiemoddin Nijamoddin Shaikh), adhering to the mutually agreed rates:</p>
                    <div class="bg-black/60 p-4 border border-white/10 my-3 space-y-2">
                        <p><strong>A. Platform Operational Share:</strong></p>
                        <ul class="list-disc pl-5">
                            <li><span class="text-studio-neon font-black">30%</span> of total gross revenue is retained by Samples Wala for payment gateway fees, server infrastructure, advertising, and marketing.</li>
                        </ul>
                        <p class="mt-2"><strong>B. Creator / Co-Producer Payout Share:</strong></p>
                        <ul class="list-disc pl-5">
                            <li>The remaining share (typically between <span class="text-studio-neon font-black">35% to 70%</span>) is calculated and paid to the Creator as configured in the collaboration dashboard.</li>
                            ${configuredShares ? `<li><strong>Your Currently Configured Payout Share(s):</strong> <span class="text-studio-orange font-black">${configuredShares}</span> of product sales.</li>` : ''}
                            <li class="text-white/40 italic">Note: The administrator reserves the absolute right to set or adjust the creator share percentage (e.g. 40%, 60%, 70%) for each pack independently, as agreed upon by the user prior to distribution.</li>
                        </ul>
                    </div>

                    <h5 class="text-white font-bold text-xs uppercase tracking-wider mt-4 mb-2">3. Platform Security & Payout Controls</h5>
                    <ul class="list-disc pl-5 space-y-1">
                        <li><strong>Deductions:</strong> Payment processors, GST/taxes, refunds, fraudulent chargebacks, currency conversion fees, and affiliate commissions will be subtracted from gross sales before calculating creator shares.</li>
                        <li><strong>Anti-Fraud Hold:</strong> Samples Wala reserves the absolute right to freeze, cancel, or suspend payouts if self-purchasing, loop manipulation, credit farming, or fraudulent activity is suspected.</li>
                        <li><strong>Payout Minimum:</strong> A minimum cleared balance of ₹5,000 is required to trigger a monthly payout. Payouts are scheduled to process by the 1st week of each month.</li>
                    </ul>

                    <h5 class="text-white font-bold text-xs uppercase tracking-wider mt-4 mb-2">4. Ironclad Intellectual Property Warranty & Liability Protection</h5>
                    <ul class="list-disc pl-5 space-y-2">
                        <li class="text-studio-yellow"><strong>Warranty of Originality:</strong> You warrant that 100% of the files, loops, samples, and audio stems submitted are completely original, cleared, copyright-free, and legally owned by you. They must not contain unauthorized samples, unlicensed VST outputs, or stolen melodies.</li>
                        <li class="text-studio-yellow"><strong>Absolute Indemnification:</strong> In the event of any third-party copyright claims, DMCA notices, trademark infringement lawsuits, or litigation arising from your uploaded packs, you agree to fully indemnify, defend, and hold harmless Samples Wala, its founder Naiemoddin Nijamoddin Shaikh, and its affiliates from all legal costs, lawyer fees, penalties, and damages.</li>
                        <li><strong>Right of Removal & Asset Recovery:</strong> Samples Wala reserves the right to immediately take down any product flagged for copyright violations, block your access, and retain/clawback any accumulated payouts to satisfy intellectual property damage claims.</li>
                    </ul>

                    <h5 class="text-white font-bold text-xs uppercase tracking-wider mt-4 mb-2">5. Governing Law, Limitation of Liability & Dispute Resolution</h5>
                    <ul class="list-disc pl-5 space-y-1">
                        <li><strong>Limitation of Liability:</strong> Samples Wala's total liability under any circumstances shall never exceed the total payouts actually disbursed to you during the 30-day period immediately preceding the dispute event.</li>
                        <li><strong>Governing Law:</strong> This contract is governed by and construed under the laws of India. Any legal dispute, arbitration, or court action must be filed exclusively in the courts of Pune/Mumbai, Maharashtra, India.</li>
                        <li><strong>Independent Contractor:</strong> This agreement does not establish any partnership, joint venture, employment, or agency relationship. You act solely as an independent content provider.</li>
                    </ul>

                    <hr class="border-white/10 my-4" />
                    <p class="text-center font-bold text-studio-neon">*** CONTRACT GENERATED SECURELY VIA SAMPLES WALA ARTIST PLATFORM ***</p>
                </div>
            `
        };
        return [fallbackAgreement];
    }

    // Enrich with pack names
    if (agreementsList.length > 0) {
        const collabProductIds = agreementsList
            .filter((a: any) => a.artist_collaborations?.product_id)
            .map((a: any) => a.artist_collaborations.product_id);

        if (collabProductIds.length > 0) {
            const { data: packs } = await admin
                .from('sample_packs')
                .select('id, name')
                .in('id', collabProductIds);

            return agreementsList.map((agreement: any) => ({
                ...agreement,
                pack_name: packs?.find((p: any) => p.id === agreement.artist_collaborations?.product_id)?.name || null
            }));
        }
    }

    return agreementsList;
}

