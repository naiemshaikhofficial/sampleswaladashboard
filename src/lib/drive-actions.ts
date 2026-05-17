'use server';

import { getUser } from '@/lib/supabase/server';

export async function uploadKycToDrive(formData: FormData) {
    const { data: { user } } = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized. Please log in again." };
    }

    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string;

    if (!file || !docType) {
        return { success: false, error: "File and document type are required." };
    }

    const WEBHOOK_URL = process.env.GOOGLE_WEBHOOK_URL;
    if (!WEBHOOK_URL) {
        console.error("Missing Google Webhook URL");
        return { success: false, error: "Server configuration error. Contact admin." };
    }

    try {
        // Convert File to Base64 String
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        
        // File name format: userEmail_docType_timestamp
        const fileName = `${user.email}_${docType}_${Date.now()}_${file.name}`;

        const payload = new URLSearchParams();
        payload.append('fileName', fileName);
        payload.append('mimeType', file.type);
        payload.append('data', base64Data);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: payload,
            // URLSearchParams sets the correct Content-Type: application/x-www-form-urlencoded
        });

        const rawText = await response.text();
        let result;
        try {
            result = JSON.parse(rawText);
        } catch (parseError) {
            console.error("Non-JSON Response from Webhook:", rawText.substring(0, 200));
            return { success: false, error: "Webhook returned an invalid response. Please contact support." };
        }

        if (!result.success) {
            return { success: false, error: result.error || "Unknown webhook error." };
        }

        // Save fileId to Supabase
        const { getAdminClient } = await import('@/lib/supabase/admin');
        const admin = getAdminClient();
        await admin.from('artist_payout_settings').upsert({
            user_id: user.id,
            kyc_document_id: result.fileId,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        return { success: true, fileId: result.fileId };

    } catch (error: any) {
        console.error("Webhook Upload Error:", error);
        return { success: false, error: "Google Drive Error: " + error.message };
    }
}
