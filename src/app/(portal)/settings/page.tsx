'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Building2,
    User,
    CreditCard,
    ShieldCheck,
    Save,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Eye,
    EyeOff,
    Upload,
    Loader2
} from 'lucide-react';
import { updatePayoutSettings, getPayoutSettings } from '@/lib/dashboard-actions';
import { uploadKycToDrive } from '@/lib/drive-actions';

export default function PayoutSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [detailsMessage, setDetailsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dbKycUrl, setDbKycUrl] = useState<string | null>(null);
    const [initialData, setInitialData] = useState<any>(null);
    const [showAccount, setShowAccount] = useState(false);
    const [showConfirmAccount, setShowConfirmAccount] = useState(false);

    // Upload progress state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const UPLOAD_STEPS = [
        { at: 5,  label: 'Preparing file...' },
        { at: 15, label: 'Encrypting document...' },
        { at: 30, label: 'Uploading to secure server...' },
        { at: 60, label: 'Processing with Google Drive...' },
        { at: 85, label: 'Saving verification record...' },
        { at: 100, label: 'Upload complete!' },
    ];

    // Simulate smooth progress during upload
    const startProgressSimulation = useCallback(() => {
        setUploadProgress(0);
        setUploadStep(UPLOAD_STEPS[0].label);
        setIsUploading(true);

        let current = 0;
        progressIntervalRef.current = setInterval(() => {
            current += Math.random() * 3 + 0.5; // Increment 0.5-3.5% each tick
            if (current > 88) current = 88; // Cap at 88% until real completion

            // Find current step label
            const step = [...UPLOAD_STEPS].reverse().find(s => current >= s.at);
            if (step && step.at < 100) {
                setUploadStep(step.label);
            }

            setUploadProgress(Math.round(current));
        }, 300);
    }, []);

    const completeProgress = useCallback((success: boolean) => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (success) {
            setUploadProgress(100);
            setUploadStep('Upload complete!');
            // Keep bar visible for 2s then hide
            setTimeout(() => setIsUploading(false), 2500);
        } else {
            setUploadStep('Upload failed');
            setTimeout(() => setIsUploading(false), 2000);
        }
    }, []);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        const CACHE_KEY = 'sw_payout_settings';
        const cached = localStorage.getItem(CACHE_KEY);

        if (cached) {
            // Load from local cache instantly — no DB call
            const data = JSON.parse(cached);
            setInitialData(data);
            if (data.kyc_document_id) {
                setDbKycUrl(`https://drive.google.com/thumbnail?id=${data.kyc_document_id}&sz=w800`);
            }
        } else {
            // First time only — fetch from DB and cache
            const loadSettings = async () => {
                const data = await getPayoutSettings();
                if (data) {
                    setInitialData(data);
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    if (data.kyc_document_id) {
                        setDbKycUrl(`https://drive.google.com/thumbnail?id=${data.kyc_document_id}&sz=w800`);
                    }
                }
            };
            loadSettings();
        }
    }, []);

    return (
        <div className="max-w-4xl space-y-12">
            <div className="relative">
                <h2 className="section-heading">
                    Payout <span className="text-studio-pink">Settings</span>
                </h2>
                <p className="text-white/60 font-mono text-sm max-w-xl -mt-4 mb-6">
                    Manage your bank account details and tax information. We use this data to process your monthly revenue payouts.
                </p>

                {/* Mandatory Warning Banner */}
                <div className="comic-panel p-4 yellow-border bg-black flex items-start gap-4">
                    <AlertCircle className="text-studio-red shrink-0" size={24} />
                    <div>
                        <h4 className="text-sm font-black uppercase italic text-studio-red">Mandatory Action Required</h4>
                        <p className="text-[10px] text-studio-yellow font-black uppercase tracking-widest mt-1">
                            To receive payouts, you must submit your complete Legal Banking Details AND upload your Aadhaar/PAN Card. Payouts will be held until verification is complete.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="md:col-span-2 space-y-8">
                    <div className="comic-panel p-8 pink-border bg-studio-grey">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                            <Building2 className="text-studio-pink" />
                            <h3 className="text-xl font-black uppercase italic">Legal & Banking Details</h3>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = new FormData(e.currentTarget);
                                const payload = Object.fromEntries(form.entries());

                                const legalName = (payload.legal_name as string).trim().toLowerCase();
                                const accountName = (payload.account_holder_name as string).trim().toLowerCase();

                                if (legalName !== accountName) {
                                    setDetailsMessage({ type: 'error', text: "Failed to save: Legal Name and Account Holder Name must be the same for KYC approval." });
                                    return;
                                }

                                if (payload.account_number !== payload.confirm_account_number) {
                                    setDetailsMessage({ type: 'error', text: "Failed to save: Account numbers do not match!" });
                                    return;
                                }

                                setIsSavingDetails(true);
                                setDetailsMessage(null);
                                const result = await updatePayoutSettings(payload);

                                if (!result?.success) {
                                    setDetailsMessage({ type: 'error', text: "Failed to save: " + (result?.error || "Unknown error") });
                                } else {
                                    // Update local cache so next visit skips DB
                                    const updated = { ...initialData, ...payload };
                                    setInitialData(updated);
                                    localStorage.setItem('sw_payout_settings', JSON.stringify(updated));
                                    setDetailsMessage({ type: 'success', text: "Payout details successfully saved!" });
                                }
                                setIsSavingDetails(false);
                            }}
                            className="space-y-6"
                        >
                            {detailsMessage && (
                                <div className={`p-4 border-2 border-black flex items-start gap-3 ${detailsMessage.type === 'success' ? 'bg-studio-neon/20' : 'bg-studio-red/20'}`}>
                                    <AlertCircle className={detailsMessage.type === 'success' ? 'text-studio-neon' : 'text-studio-red'} size={20} />
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${detailsMessage.type === 'success' ? 'text-studio-neon' : 'text-studio-red'}`}>
                                        {detailsMessage.text}
                                    </p>
                                </div>
                            )}

                            {/* Legal Info */}
                            <div className="space-y-4 pb-6 border-b border-white/10">
                                <h4 className="text-xs font-black uppercase text-studio-pink tracking-widest">Company / Legal Information</h4>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Legal Full Name (As per Govt ID)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                        <input
                                            type="text"
                                            name="legal_name"
                                            required
                                            defaultValue={initialData?.legal_name || ''}
                                            placeholder="YOUR FULL LEGAL NAME"
                                            className="w-full bg-black border-2 border-black p-4 pl-12 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Full Billing Address</label>
                                    <textarea
                                        name="billing_address"
                                        required
                                        defaultValue={initialData?.billing_address || ''}
                                        placeholder="STREET, CITY, STATE, PINCODE"
                                        rows={2}
                                        className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Aadhaar Number</label>
                                        <input
                                            type="text"
                                            name="aadhaar_number"
                                            required
                                            defaultValue={initialData?.aadhaar_number || ''}
                                            placeholder="1234 5678 9012"
                                            className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">PAN Number</label>
                                        <input
                                            type="text"
                                            name="pan_number"
                                            required
                                            defaultValue={initialData?.pan_number || ''}
                                            placeholder="ABCDE1234F"
                                            className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">GST Number (Optional)</label>
                                        <input
                                            type="text"
                                            name="gst_number"
                                            defaultValue={initialData?.gst_number || ''}
                                            placeholder="22AAAAA0000A1Z5"
                                            className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Info */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-xs font-black uppercase text-studio-pink tracking-widest">Bank Account Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Account Holder Name</label>
                                        <input
                                            type="text"
                                            name="account_holder_name"
                                            required
                                            defaultValue={initialData?.account_holder_name || ''}
                                            placeholder="AS PER BANK RECORDS"
                                            className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Bank Name</label>
                                        <input
                                            type="text"
                                            name="bank_name"
                                            required
                                            defaultValue={initialData?.bank_name || ''}
                                            placeholder="E.G. HDFC BANK"
                                            className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Account Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                type={showAccount ? "text" : "password"}
                                                name="account_number"
                                                required
                                                defaultValue={initialData?.account_number || ''}
                                                placeholder="•••• •••• •••• ••••"
                                                className="w-full bg-black border-2 border-black p-4 pl-12 pr-12 text-xs font-black focus:border-studio-pink outline-none transition-colors tracking-widest"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowAccount(!showAccount)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                            >
                                                {showAccount ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Confirm Account Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                type={showConfirmAccount ? "text" : "password"}
                                                name="confirm_account_number"
                                                required
                                                defaultValue={initialData?.account_number || ''}
                                                placeholder="•••• •••• •••• ••••"
                                                className="w-full bg-black border-2 border-black p-4 pl-12 pr-12 text-xs font-black focus:border-studio-pink outline-none transition-colors tracking-widest"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowConfirmAccount(!showConfirmAccount)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                            >
                                                {showConfirmAccount ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">IFSC Code</label>
                                    <input
                                        type="text"
                                        name="ifsc_code"
                                        required
                                        defaultValue={initialData?.ifsc_code || ''}
                                        placeholder="E.G. HDFC0001234"
                                        className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingDetails}
                                className="studio-button w-full md:w-auto"
                            >
                                {isSavingDetails ? 'Processing...' : (
                                    <>
                                        <Save size={16} />
                                        Save Payout Details
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* KYC Upload Section — 2 column: form + example */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Left: Upload Form */}
                        <div className="md:col-span-3 comic-panel p-8 blue-border bg-studio-grey">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                                <ShieldCheck className="text-studio-blue" />
                                <h3 className="text-xl font-black uppercase italic">KYC Document Upload</h3>
                            </div>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    setIsSaving(true);
                                    setUploadMessage(null);
                                    startProgressSimulation();

                                    const result = await uploadKycToDrive(formData);

                                    if (!result?.success) {
                                        completeProgress(false);
                                        setUploadMessage({ type: 'error', text: "Upload failed: " + (result?.error || "Unknown error") });
                                    } else {
                                        completeProgress(true);
                                        // Update local cache with new document ID
                                        if (result?.fileId) {
                                            const updated = { ...initialData, kyc_document_id: result.fileId };
                                            setInitialData(updated);
                                            localStorage.setItem('sw_payout_settings', JSON.stringify(updated));
                                            setDbKycUrl(`https://drive.google.com/thumbnail?id=${result.fileId}&sz=w800`);
                                            setPreviewUrl(null);
                                        }
                                        setUploadMessage({ type: 'success', text: "Document successfully uploaded!" });
                                    }
                                    setIsSaving(false);
                                }}
                                className="space-y-6"
                            >
                                {uploadMessage && (
                                    <div className={`p-4 border-2 border-black flex items-start gap-3 ${uploadMessage.type === 'success' ? 'bg-studio-blue/20' : 'bg-studio-red/20'}`}>
                                        <AlertCircle className={uploadMessage.type === 'success' ? 'text-studio-blue' : 'text-studio-red'} size={20} />
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${uploadMessage.type === 'success' ? 'text-studio-blue' : 'text-studio-red'}`}>
                                            {uploadMessage.text}
                                        </p>
                                    </div>
                                )}

                                {/* Upload Progress Bar */}
                                {isUploading && (
                                    <div className="space-y-3 p-5 bg-black border-2 border-studio-blue">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {uploadProgress < 100 ? (
                                                    <Loader2 size={14} className="text-studio-blue animate-spin" />
                                                ) : (
                                                    <CheckCircle2 size={14} className="text-studio-neon" />
                                                )}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                                    {uploadStep}
                                                </span>
                                            </div>
                                            <span className={`text-sm font-black italic ${
                                                uploadProgress >= 100 ? 'text-studio-neon' : 'text-studio-blue'
                                            }`}>
                                                {uploadProgress}%
                                            </span>
                                        </div>

                                        {/* Track */}
                                        <div className="w-full h-5 bg-studio-charcoal border-2 border-black relative overflow-hidden">
                                            {/* Fill */}
                                            <div
                                                className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${
                                                    uploadProgress >= 100
                                                        ? 'bg-studio-neon'
                                                        : 'bg-studio-blue'
                                                }`}
                                                style={{ width: `${uploadProgress}%` }}
                                            >
                                                {/* Halftone overlay */}
                                                <div
                                                    className="absolute inset-0 opacity-25 pointer-events-none"
                                                    style={{
                                                        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                                                        backgroundSize: '5px 5px',
                                                    }}
                                                />
                                            </div>

                                            {/* Animated pulse stripe while uploading */}
                                            {uploadProgress < 100 && (
                                                <div
                                                    className="absolute inset-0 opacity-10 pointer-events-none animate-pulse"
                                                    style={{
                                                        backgroundImage:
                                                            'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 12px)',
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Step dots */}
                                        <div className="flex justify-between px-1">
                                            {['Prepare', 'Encrypt', 'Upload', 'Process', 'Save'].map((label, i) => {
                                                const thresholds = [5, 15, 30, 60, 85];
                                                const active = uploadProgress >= thresholds[i];
                                                return (
                                                    <div key={label} className="flex flex-col items-center gap-1">
                                                        <div className={`w-2 h-2 border border-black transition-colors duration-300 ${
                                                            active ? 'bg-studio-neon' : 'bg-studio-charcoal'
                                                        }`} />
                                                        <span className={`text-[7px] font-black uppercase tracking-wider transition-colors duration-300 ${
                                                            active ? 'text-white/70' : 'text-white/20'
                                                        }`}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase font-black text-white/60 tracking-widest leading-relaxed">
                                        Upload a clear photo or PDF of your Aadhaar Card or PAN Card.
                                    </p>

                                    {/* Photo Guidelines */}
                                    <div className="bg-black border border-white/10 p-4 space-y-3">
                                        <h5 className="text-[10px] font-black uppercase text-studio-blue tracking-widest">Photo Guidelines</h5>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2 text-[9px] uppercase tracking-widest text-white/70">
                                                <CheckCircle2 size={12} className="text-studio-neon shrink-0 mt-0.5" />
                                                <span>Make sure the room is well-lit (No dark shadows).</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-[9px] uppercase tracking-widest text-white/70">
                                                <CheckCircle2 size={12} className="text-studio-neon shrink-0 mt-0.5" />
                                                <span>All 4 corners of the document must be clearly visible.</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-[9px] uppercase tracking-widest text-white/70">
                                                <CheckCircle2 size={12} className="text-studio-neon shrink-0 mt-0.5" />
                                                <span>Text on the document should be sharp and readable.</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-[9px] uppercase tracking-widest text-white/70">
                                                <CheckCircle2 size={12} className="text-studio-neon shrink-0 mt-0.5" />
                                                <span>Avoid glare/reflections from flash or overhead lights.</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Document Type</label>
                                        <select name="docType" className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-blue outline-none transition-colors appearance-none">
                                            <option value="aadhaar">Aadhaar Card</option>
                                            <option value="pan">PAN Card</option>
                                            <option value="passport">Passport</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Select File (.PDF, .JPG, .PNG only)</label>
                                        <input
                                            type="file"
                                            name="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            required={!dbKycUrl}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    setPreviewUrl(url);
                                                }
                                            }}
                                            className="w-full bg-black border-2 border-dashed border-white/20 p-8 text-xs font-black text-white/60 cursor-pointer focus:border-studio-blue outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-studio-blue file:text-black hover:file:bg-white"
                                        />
                                    </div>

                                    {/* Preview Image Container */}
                                    {(previewUrl || dbKycUrl) && (
                                        <div className="space-y-2 mt-4">
                                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                                                <ImageIcon size={12} />
                                                Document Preview
                                            </label>
                                            <div className="w-full max-w-sm aspect-[4/3] border-2 border-black overflow-hidden relative bg-black flex items-center justify-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img 
                                                    src={previewUrl || dbKycUrl || ''} 
                                                    alt="KYC Document Preview" 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="studio-button w-full md:w-auto !bg-studio-blue"
                                >
                                    {isSaving ? (
                                        <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                    ) : (
                                        <><Upload size={16} /> Upload Document</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Right: Example Image */}
                        <div className="md:col-span-2 hidden md:block">
                            <div className="sticky top-24 space-y-6">
                                <div className="comic-panel p-6 neon-border bg-black">
                                    <h3 className="text-sm font-black uppercase italic text-studio-neon mb-4">Good Example</h3>
                                    <div className="border-2 border-white/10 p-2 bg-studio-grey/50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src="/kyc-example.png" 
                                            alt="KYC Example — well-lit, all corners visible" 
                                            className="w-full h-auto"
                                        />
                                    </div>
                                    <p className="text-[9px] text-white/50 uppercase tracking-widest font-black mt-4 leading-relaxed">
                                        Your document photo should look like this — well-lit, flat, all 4 corners visible, no glare.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Info */}
                <div className="space-y-6">
                    <div className="comic-panel p-6 neon-border">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="text-studio-neon" size={24} />
                            <h4 className="text-sm font-black uppercase italic">Secure Vault</h4>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                            Your banking information is encrypted.
                            Only the finance team has access for processing payouts.
                        </p>
                    </div>

                    <div className="comic-panel p-6 yellow-border bg-studio-yellow text-black">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle size={24} />
                            <h4 className="text-sm font-black uppercase italic">Important</h4>
                        </div>
                        <p className="text-[10px] leading-relaxed uppercase font-black tracking-tighter">
                            Payouts are processed on the 1st of every month for balances exceeding ₹5,000.
                            Ensure your details are accurate to avoid payment delays.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
