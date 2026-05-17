import { getAgreements } from '@/lib/dashboard-actions';
import { FileText, Calendar, Shield, CheckCircle2 } from 'lucide-react';

export default async function AgreementsPage() {
    const agreements = await getAgreements();

    return (
        <div className="space-y-12">
            <div>
                <h2 className="section-heading">My <span className="text-studio-orange">Agreements</span></h2>
                <p className="text-white/60 font-mono text-sm max-w-xl -mt-4">
                    Read-only view of your collaboration contracts. Contact legal@sampleswala.com for any questions.
                </p>
            </div>

            {agreements.length > 0 ? (
                <div className="space-y-8">
                    {agreements.map((agreement: any) => (
                        <div key={agreement.id} className="comic-panel p-8 bg-studio-grey" style={{ boxShadow: '8px 8px 0px #FF5C00' }}>
                            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="text-lg font-black uppercase italic flex items-center gap-2">
                                        <FileText size={18} className="text-studio-orange" />
                                        {agreement.title}
                                    </h3>
                                    {agreement.pack_name && (
                                        <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mt-1">Pack: {agreement.pack_name}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-black ${
                                        agreement.status === 'active' ? 'bg-studio-neon text-black' :
                                        agreement.status === 'expired' ? 'bg-studio-red/20 text-studio-red' :
                                        'bg-white/10 text-white/40'
                                    }`}>
                                        {agreement.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-3 bg-black border border-white/10">
                                    <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-1">Effective Date</p>
                                    <p className="text-xs font-black flex items-center gap-1"><Calendar size={12} /> {new Date(agreement.effective_date).toLocaleDateString('en-IN')}</p>
                                </div>
                                {agreement.artist_collaborations?.share_percent && (
                                    <div className="p-3 bg-black border border-white/10">
                                        <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-1">Revenue Share</p>
                                        <p className="text-xs font-black text-studio-neon">{agreement.artist_collaborations.share_percent}%</p>
                                    </div>
                                )}
                                {agreement.artist_collaborations?.role && (
                                    <div className="p-3 bg-black border border-white/10">
                                        <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-1">Role</p>
                                        <p className="text-xs font-black">{agreement.artist_collaborations.role}</p>
                                    </div>
                                )}
                            </div>

                            {/* Agreement Terms */}
                            <div className="p-6 bg-black border border-white/10 max-h-[400px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                                    <Shield size={14} className="text-studio-orange" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-studio-orange">Contract Terms</span>
                                </div>
                                <div className="prose prose-invert prose-xs max-w-none text-white/70 text-[11px] leading-relaxed" dangerouslySetInnerHTML={{ __html: agreement.terms_html }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="comic-panel p-16 text-center border-dashed border-white/10">
                    <FileText size={64} className="mx-auto mb-6 text-white/10" />
                    <h3 className="text-2xl font-black uppercase italic mb-4">No Agreements</h3>
                    <p className="text-sm text-white/40 max-w-md mx-auto">
                        Your collaboration agreements will appear here once they are uploaded by the SamplesWala team.
                        Contact <a href="mailto:legal@sampleswala.com" className="text-studio-orange underline">legal@sampleswala.com</a> for inquiries.
                    </p>
                </div>
            )}
        </div>
    );
}
