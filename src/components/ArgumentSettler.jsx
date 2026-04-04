import React, { useState } from 'react';
import { Scale, Loader2, Gavel } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArgumentSettler() {
  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [verdict, setVerdict] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGavel, setShowGavel] = useState(false);
  const [error, setError] = useState('');

  const settleArgument = async () => {
    if (!person1.trim() || !person2.trim()) return;
    
    setLoading(true);
    setError('');
    setVerdict('');
    
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
      setError('Gemini API key is not set. Please set it in Settings.');
      setLoading(false);
      return;
    }

    setShowGavel(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `You are the dramatic, sassy, but ultimately fair AI Roommate Judge. 
      Two roommates are having a disagreement.
      Person 1 side: "${person1}"
      Person 2 side: "${person2}"
      
      Give a dramatic, funny, and definitive verdict on who is right and who is wrong. Explain your reasoning playfully like a real judge.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Artificial delay to let gavel animation play
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setVerdict(response.text());
    } catch (err) {
      console.error(err);
      setError('Failed to reach a verdict. Make sure your API key is valid.');
    } finally {
      setShowGavel(false);
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="title" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
        <Scale size={20} color="var(--accent-primary)"/> AI Argument Settler
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Can't agree on something? Let the RoomieAI Judge decide who is right. The Judge's word is final.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600 }}>Person 1</h3>
          <textarea 
            className="input-field" 
            placeholder="Type your side of the story..." 
            value={person1}
            onChange={e => setPerson1(e.target.value)}
            style={{ height: '140px', resize: 'vertical', backgroundColor: 'var(--bg-color)' }}
          />
        </div>
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600 }}>Person 2</h3>
          <textarea 
            className="input-field" 
            placeholder="Type your side of the story..." 
            value={person2}
            onChange={e => setPerson2(e.target.value)}
            style={{ height: '140px', resize: 'vertical', backgroundColor: 'var(--bg-color)' }}
          />
        </div>
      </div>

      <button className="btn" onClick={settleArgument} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '1rem', fontSize: '1rem' }} disabled={loading || !person1.trim() || !person2.trim()}>
        {loading && !showGavel ? <Loader2 className="spinner" size={18} /> : <Gavel size={18} />}
        {loading ? 'The Judge is deliberating...' : 'Get Verdict'}
      </button>

      {error && <div style={{ color: 'var(--danger)', marginTop: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>{error}</div>}

      <AnimatePresence>
        {showGavel && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}
          >
            <Gavel size={64} color="var(--accent-primary)" className="gavel-anim" />
          </motion.div>
        )}

        {verdict && !showGavel && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '2.5rem', padding: '2rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'var(--bg-secondary)', padding: '0 12px', color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              The Verdict
            </div>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-main)', fontSize: '0.95rem' }}>{verdict}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
