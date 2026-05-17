'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle2, AlertCircle, Loader2, Tag } from 'lucide-react';
import { submitSupportTicket, getSupportTickets } from '@/lib/dashboard-actions';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    open: { color: 'text-studio-blue', label: 'Open' },
    in_progress: { color: 'text-studio-yellow', label: 'In Progress' },
    resolved: { color: 'text-studio-neon', label: 'Resolved' },
    closed: { color: 'text-white/40', label: 'Closed' },
};

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getSupportTickets().then(data => { setTickets(data); setLoaded(true); });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setIsSubmitting(true);
        setMessage(null);

        const result = await submitSupportTicket({
            subject: form.get('subject') as string,
            message: form.get('message') as string,
            category: form.get('category') as string,
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Ticket submitted! Our team will respond within 24-48 hours.' });
            (e.target as HTMLFormElement).reset();
            const updated = await getSupportTickets();
            setTickets(updated);
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to submit.' });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-12">
            <div>
                <h2 className="section-heading">Support <span className="text-studio-blue">Center</span></h2>
                <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">Have an issue? Submit a ticket and our team will get back to you.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Submit Form */}
                <div className="lg:col-span-2 comic-panel p-8 blue-border bg-studio-grey">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <Send className="text-studio-blue" size={20} />
                        <h3 className="text-lg font-black uppercase italic">New Ticket</h3>
                    </div>

                    {message && (
                        <div className={`p-4 border-2 border-black flex items-start gap-3 mb-4 ${message.type === 'success' ? 'bg-studio-neon/20' : 'bg-studio-red/20'}`}>
                            <AlertCircle className={message.type === 'success' ? 'text-studio-neon' : 'text-studio-red'} size={16} />
                            <p className={`text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'text-studio-neon' : 'text-studio-red'}`}>{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Category</label>
                            <select name="category" required className="w-full bg-black border-2 border-black p-3 text-xs font-black focus:border-studio-blue outline-none appearance-none">
                                <option value="general">General</option>
                                <option value="payout">Payout Issue</option>
                                <option value="technical">Technical Problem</option>
                                <option value="agreement">Agreement Question</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Subject</label>
                            <input type="text" name="subject" required placeholder="Brief description of your issue" className="w-full bg-black border-2 border-black p-3 text-xs font-black focus:border-studio-blue outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Message</label>
                            <textarea name="message" required rows={5} placeholder="Describe your issue in detail..." className="w-full bg-black border-2 border-black p-3 text-xs font-black focus:border-studio-blue outline-none resize-none" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="studio-button w-full !bg-studio-blue">
                            {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit Ticket</>}
                        </button>
                    </form>
                </div>

                {/* Ticket History */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-lg font-black uppercase italic flex items-center gap-2">
                        <MessageSquare size={18} /> Your Tickets ({tickets.length})
                    </h3>

                    {!loaded ? (
                        <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-white/20" /></div>
                    ) : tickets.length > 0 ? (
                        tickets.map((ticket: any) => {
                            const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                            return (
                                <div key={ticket.id} className="comic-panel p-6 bg-studio-grey border-l-4 border-l-studio-blue">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black uppercase truncate">{ticket.subject}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[8px] font-black uppercase tracking-widest bg-black px-2 py-0.5 border border-white/10 text-white/50">{ticket.category}</span>
                                                <span className="text-[8px] text-white/30">{new Date(ticket.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${config.color} shrink-0`}>{config.label}</span>
                                    </div>
                                    <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{ticket.message}</p>
                                    {ticket.admin_reply && (
                                        <div className="mt-4 p-3 bg-black border border-studio-neon/30">
                                            <p className="text-[9px] font-black uppercase text-studio-neon tracking-widest mb-1">Team Reply</p>
                                            <p className="text-[11px] text-white/70 leading-relaxed">{ticket.admin_reply}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="comic-panel p-12 text-center border-dashed border-white/10 opacity-50">
                            <MessageSquare size={40} className="mx-auto mb-4 text-white/20" />
                            <p className="text-xs text-white/40">No tickets submitted yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
