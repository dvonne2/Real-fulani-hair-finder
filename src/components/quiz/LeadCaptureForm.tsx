import React, { useState } from 'react';

export const LeadCaptureForm: React.FC<{
  onSubmit: (values: { name: string; email?: string; phone: string; state: string }) => Promise<void> | void;
}> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!phone.trim()) { setError('Please enter your WhatsApp phone number'); return; }
    if (!state.trim()) { setError('Please enter your state'); return; }
    try {
      setSubmitting(true);
      await onSubmit({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim(), state: state.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white border-2 border-amber-300 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Almost There</h2>
        <p className="text-sm text-gray-700 text-center mb-6">Enter your details to view your personalized results.</p>
        {error && (<div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>)}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1" htmlFor="lead-name">Full Name</label>
            <input id="lead-name" type="text" value={name} onChange={(e)=>setName(e.target.value)} className="w-full border-2 border-amber-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. Amina Bello" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1" htmlFor="lead-state">State</label>
            <input id="lead-state" type="text" value={state} onChange={(e)=>setState(e.target.value)} className="w-full border-2 border-amber-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. Lagos" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1" htmlFor="lead-email">Email (optional)</label>
            <input id="lead-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border-2 border-amber-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1" htmlFor="lead-phone">WhatsApp Phone</label>
            <input id="lead-phone" type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full border-2 border-amber-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. 0810 159 4734" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-extrabold py-3 rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-60">
            {submitting ? 'Saving…' : 'View My Results'}
          </button>
          <p className="text-[11px] text-gray-500 text-center">By continuing, you agree to our Privacy Policy.</p>
        </form>
      </div>
    </div>
  );
};
