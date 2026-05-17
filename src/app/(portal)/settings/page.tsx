'use client';

import React, { useState } from 'react';
import {
    Building2,
    User,
    CreditCard,
    ShieldCheck,
    Save,
    AlertCircle
} from 'lucide-react';
import { updatePayoutSettings } from '@/lib/dashboard-actions';
import { uploadKycToDrive } from '@/lib/drive-actions';

export default function PayoutSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingDetails, setIsSavingDetails] = useState(false);

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

                                try {
                                    setIsSavingDetails(true);
                                    await updatePayoutSettings(payload);
                                    alert("Payout details successfully saved!");
                                } catch (err: any) {
                                    alert("Failed to save: " + err.message);
                                } finally {
                                    setIsSavingDetails(false);
                                }
                            }}
                            className="space-y-6"
                        >
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
                                            placeholder="ABCDE1234F"
                                            className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">GST Number (Optional)</label>
                                        <input
                                            type="text"
                                            name="gst_number"
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
                                                type="password"
                                                name="account_number"
                                                required
                                                placeholder="•••• •••• •••• ••••"
                                                className="w-full bg-black border-2 border-black p-4 pl-12 text-xs font-black focus:border-studio-pink outline-none transition-colors tracking-widest"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">IFSC Code</label>
                                        <input
                                            type="text"
                                            name="ifsc_code"
                                            required
                                            placeholder="E.G. HDFC0001234"
                                            className="w-full bg-black border-2 border-black p-4 text-xs font-black focus:border-studio-pink outline-none transition-colors"
                                        />
                                    </div>
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

                    {/* KYC Upload Section */}
                    <div className="comic-panel p-8 blue-border bg-studio-grey">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                            <ShieldCheck className="text-studio-blue" />
                            <h3 className="text-xl font-black uppercase italic">KYC Document Upload</h3>
                        </div>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                try {
                                    setIsSaving(true);
                                    await uploadKycToDrive(formData);
                                    alert("Document successfully uploaded!");
                                } catch (err: any) {
                                    alert("Upload failed: " + err.message);
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <p className="text-[10px] uppercase font-black text-white/60 tracking-widest leading-relaxed">
                                    Upload a clear photo or PDF of your Aadhaar Card or PAN Card.
                                </p>

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
                                        required
                                        className="w-full bg-black border-2 border-dashed border-white/20 p-8 text-xs font-black text-white/60 cursor-pointer focus:border-studio-blue outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-studio-blue file:text-black hover:file:bg-white"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="studio-button w-full md:w-auto !bg-studio-blue"
                            >
                                {isSaving ? 'Uploading...' : 'Upload Document'}
                            </button>
                        </form>
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
