// GymPro Trainer — Basic Nutrition Logger
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, Sparkles, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import db from '../../db/database';
import { useStore } from '../../store/useStore';
import { analyzeNutrition } from '../../engine/aiService';
import './Nutrition.css';

export default function Nutrition() {
  const navigate = useNavigate();
  const { addToast } = useStore();
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ calories: '', protein: '', carbs: '', fat: '' });
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [foodText, setFoodText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shouldRedirectToProfile, setShouldRedirectToProfile] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  useEffect(() => {
    let timeoutId;
    if (shouldRedirectToProfile) {
      timeoutId = setTimeout(() => navigate('/profile'), 1500);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [shouldRedirectToProfile, navigate]);

  async function loadLogs() {
    const all = await db.table('nutritionLogs').orderBy('date').reverse().limit(14).toArray();
    setLogs(all);
  }

  const todayLog = logs.find(l => l.date === today);

  const handleSave = async () => {
    const data = {
      date: today,
      calories: parseInt(form.calories) || 0,
      protein: parseInt(form.protein) || 0,
      carbs: parseInt(form.carbs) || 0,
      fat: parseInt(form.fat) || 0,
      notes: '',
    };

    if (todayLog) {
      await db.table('nutritionLogs').update(todayLog.id, data);
    } else {
      await db.table('nutritionLogs').add(data);
    }
    
    addToast('Nutrition logged! 🍗');
    setShowAdd(false);
    setForm({ calories: '', protein: '', carbs: '', fat: '' });
    setFoodText('');
    loadLogs();
  };

  const handleAIAnalyze = async () => {
    if (!foodText.trim()) return;
    setIsAnalyzing(true);
    try {
      const macros = await analyzeNutrition(foodText);
      setForm({
        calories: String(macros.calories || 0),
        protein: String(macros.protein || 0),
        carbs: String(macros.carbs || 0),
        fat: String(macros.fat || 0),
      });
      addToast('AI Calculation Complete! ✨');
    } catch (error) {
      if (error.message === 'API_KEY_MISSING') {
        addToast('⚠️ Set Gemini API key in Profile settings first!');
        setShouldRedirectToProfile(true);
      } else {
        addToast('❌ AI calculation failed. Try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Targets (simple estimate)
  const targets = { calories: 2600, protein: 170, carbs: 300, fat: 80 };

  const macroBar = (value, target, color) => {
    const pct = Math.min(100, Math.round((value / target) * 100));
    return (
      <div className="macro-bar-track">
        <motion.div
          className="macro-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    );
  };

  return (
    <div className="page" id="nutrition-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="page-title">Nutrition</h1>
          <p className="page-subtitle">Track calories & macros</p>
        </div>
      </div>

      {/* Today's Overview */}
      <motion.div
        className="nutrition-today card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>Today</h3>
        
        <div className="macro-overview">
          {[
            { label: 'Calories', value: todayLog?.calories || 0, target: targets.calories, unit: 'kcal', color: 'var(--accent-primary)' },
            { label: 'Protein', value: todayLog?.protein || 0, target: targets.protein, unit: 'g', color: 'var(--accent-secondary)' },
            { label: 'Carbs', value: todayLog?.carbs || 0, target: targets.carbs, unit: 'g', color: 'var(--accent-warm)' },
            { label: 'Fat', value: todayLog?.fat || 0, target: targets.fat, unit: 'g', color: 'var(--accent-purple)' },
          ].map((macro, i) => (
            <div key={i} className="macro-item">
              <div className="macro-header">
                <span className="macro-label">{macro.label}</span>
                <span className="macro-values">
                  <span style={{ color: macro.color, fontWeight: 800 }}>{macro.value}</span>
                  <span className="text-dim"> / {macro.target}{macro.unit}</span>
                </span>
              </div>
              {macroBar(macro.value, macro.target, macro.color)}
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={() => {
          if (todayLog) setForm({ calories: String(todayLog.calories), protein: String(todayLog.protein), carbs: String(todayLog.carbs), fat: String(todayLog.fat) });
          setShowAdd(true);
        }} style={{ marginTop: 'var(--space-4)' }}>
          <Plus size={18} /> {todayLog ? 'Update' : 'Log'} Today's Nutrition
        </button>
      </motion.div>

      {/* Weekly Average */}
      {logs.length > 1 && (
        <motion.div
          className="section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="section-title">7-Day Average</h3>
          <div className="avg-grid">
            {(() => {
              const last7 = logs.slice(0, 7);
              const avg = {
                calories: Math.round(last7.reduce((s, l) => s + l.calories, 0) / last7.length),
                protein: Math.round(last7.reduce((s, l) => s + l.protein, 0) / last7.length),
                carbs: Math.round(last7.reduce((s, l) => s + l.carbs, 0) / last7.length),
                fat: Math.round(last7.reduce((s, l) => s + l.fat, 0) / last7.length),
              };
              return [
                { label: 'Calories', value: `${avg.calories} kcal`, color: 'var(--accent-primary)' },
                { label: 'Protein', value: `${avg.protein}g`, color: 'var(--accent-secondary)' },
                { label: 'Carbs', value: `${avg.carbs}g`, color: 'var(--accent-warm)' },
                { label: 'Fat', value: `${avg.fat}g`, color: 'var(--accent-purple)' },
              ].map((item, i) => (
                <div key={i} className="avg-card card">
                  <div className="avg-label">{item.label}</div>
                  <div className="avg-value" style={{ color: item.color }}>{item.value}</div>
                </div>
              ));
            })()}
          </div>
        </motion.div>
      )}

      {/* Log History */}
      {logs.length > 0 && (
        <div className="section">
          <h3 className="section-title">Recent Logs</h3>
          <div className="nutrition-history">
            {logs.map((log, i) => (
              <div key={i} className="nutrition-history-item card">
                <div className="nh-date">
                  {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="nh-macros">
                  <span style={{ color: 'var(--accent-primary)' }}>{log.calories} cal</span>
                  <span style={{ color: 'var(--accent-secondary)' }}>{log.protein}P</span>
                  <span style={{ color: 'var(--accent-warm)' }}>{log.carbs}C</span>
                  <span style={{ color: 'var(--accent-purple)' }}>{log.fat}F</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Sheet */}
      {showAdd && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowAdd(false)} />
          <motion.div
            className="bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            <div className="bottom-sheet-handle" />
            <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>
              Log Nutrition
            </h3>

            {/* AI Input Section */}
            <div className="nutrition-ai-box" style={{ background: 'var(--bg-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <label htmlFor="ai-food-input" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                <Sparkles size={16} /> AI Food Logger
              </label>
              <textarea 
                id="ai-food-input"
                className="form-input" 
                placeholder="What did you eat? e.g., '2 eggs, 1 slice of toast'"
                rows="2"
                value={foodText}
                onChange={e => setFoodText(e.target.value)}
                style={{ resize: 'none', marginBottom: 'var(--space-3)' }}
              />
              <button 
                className="btn-secondary" 
                onClick={handleAIAnalyze}
                disabled={isAnalyzing || !foodText.trim()}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}
              >
                {isAnalyzing ? <Loader size={18} className="spin" /> : <Sparkles size={18} />} 
                {isAnalyzing ? 'Analyzing...' : 'Analyze & Fill'}
              </button>
            </div>
            
            <div className="nutrition-form">
              {[
                { key: 'calories', label: 'Calories', placeholder: '2400', unit: 'kcal' },
                { key: 'protein', label: 'Protein', placeholder: '170', unit: 'g' },
                { key: 'carbs', label: 'Carbs', placeholder: '280', unit: 'g' },
                { key: 'fat', label: 'Fat', placeholder: '75', unit: 'g' },
              ].map(field => (
                <div key={field.key} className="nutrition-field">
                  <label htmlFor={`input-${field.key}`}>{field.label}</label>
                  <div className="nutrition-input-row">
                    <input
                      id={`input-${field.key}`}
                      type="number"
                      className="form-input"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    />
                    <span className="nutrition-unit">{field.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={handleSave} style={{ marginTop: 'var(--space-4)' }}>
              Save
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}
