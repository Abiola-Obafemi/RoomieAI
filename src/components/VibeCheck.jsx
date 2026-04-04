import React, { useState } from 'react';
import { Zap, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion } from 'framer-motion';

export default function VibeCheck() {
  const [challenge, setChallenge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateChallenge = async () => {
    setLoading(true);
    setError('');
    
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
      setError('Gemini API key is not set. Please set it in Settings.');
      setLoading(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const now = new Date();
      const timeContext = `${now.toLocaleTimeString()} on a ${now.toLocaleDateString('en-US', { weekday: 'long' })}`;
      
      const prompt = `You are a fun AI entity managing a household. The current time is ${timeContext}.
      Based on this time and day, generate ONE short, random, fun challenge for the entire household.
      Examples: "Tonight everyone has to eat dinner without phones", "First person to make their bed gets to pick the movie", "Dance party for 2 minutes right now!".
      Keep it brief, fun, and exactly one challenge. Do not use quotes.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setChallenge(response.text().trim());
    } catch (err) {
      console.error(err);
      setError('Failed to generate challenge. Make sure your API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <Zap size={36} color="var(--accent-primary)" strokeWidth={1.5} style={{ margin: '0 auto 1.5rem auto' }} />
      <h2 className="title" style={{ justifyContent: 'center', fontSize: '1.5rem' }}>Vibe Check</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '450px', margin: '0 auto 2.5rem auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
        Is the house feeling a bit dull? Click the button to get a random, fun challenge for everyone based on the current time and day.
      </p>

      <button className="btn" onClick={generateChallenge} style={{ fontSize: '1rem', padding: '0.85rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }} disabled={loading}>
        {loading ? <Loader2 className="spinner" size={18} /> : <Sparkles size={18} />}
        {loading ? 'Reading the room...' : 'Check the Vibe'}
      </button>

      {error && <div style={{ color: 'var(--danger)', marginTop: '2rem', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem', maxWidth: '500px', margin: '2rem auto 0 auto' }}>{error}</div>}

      {challenge && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', maxWidth: '600px', margin: '3rem auto 0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
        >
          <div style={{ fontSize: '1.15rem', fontWeight: '500', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic' }}>
            "{challenge}"
          </div>
        </motion.div>
      )}
      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
