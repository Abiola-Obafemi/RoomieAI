import React, { useState } from 'react';
import { ChefHat, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function MealSuggester() {
  const [ingredients, setIngredients] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateMeals = async () => {
    if (!ingredients.trim()) return;
    
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
      
      const prompt = `Act as an expert chef. The user has these ingredients: ${ingredients}. 
      Suggest EXACTLY 3 meals they can make with only those ingredients (and basic pantry staples like salt, oil, etc).
      Format the output as a valid JSON array of objects, with each object having exactly these keys: "name" (string), "description" (string, short 1 sentence description of how to make it).
      Do not include markdown blocks, just the raw JSON array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up potential markdown formatting
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedMeals = JSON.parse(text);
      setMeals(parsedMeals);
    } catch (err) {
      console.error(err);
      setError('Failed to generate meals. Ensure your API key is correct and you entered valid ingredients.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ChefHat size={20} color="var(--accent-primary)" /> Meal Suggester
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Type in whatever food items you currently have at home, and RoomieAI will instantly suggest 3 meals you can make.
      </p>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        <input 
          className="input-field" 
          placeholder="e.g. Eggs, rice, soy sauce, broccoli..." 
          value={ingredients}
          onChange={e => setIngredients(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generateMeals()}
          style={{ marginBottom: 0 }}
        />
        <button className="btn" onClick={generateMeals} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} disabled={loading}>
          {loading ? <Loader2 className="spinner" size={18} /> : <ChefHat size={18} />}
          {loading ? 'Cooking...' : 'Suggest Meals'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
        {meals.map((meal, index) => (
          <div key={index} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 600 }}>{meal.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{meal.description}</p>
          </div>
        ))}
      </div>
      
      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
