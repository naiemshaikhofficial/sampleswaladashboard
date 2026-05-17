'use server';

import { getUser } from '@/lib/supabase/server';

export async function uploadKycToDrive(formData: FormData) {
    const { data: { user } } = await getUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string;

    if (!file || !docType) {
        throw new Error("File and document type are required");
    }

    const WEBHOOK_URL = process.env.GOOGLE_WEBHOOK_URL;
    if (!WEBHOOK_URL) {
        console.error("Missing Google Webhook URL");
        throw new Error("Server configuration error. Contact admin.");
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
            throw new Error("Webhook returned an invalid response (HTML). Please check if your Google Apps Script is set to 'Anyone' access. Raw: " + rawText.substring(0, 100));
        }

        if (!result.success) {
            throw new Error(result.error || "Unknown webhook error");
        }

        return { success: true, fileId: result.fileId };

    } catch (error: any) {
        console.error("Webhook Upload Error:", error);
        throw new Error("Google Drive Error: " + error.message);
    }
}
