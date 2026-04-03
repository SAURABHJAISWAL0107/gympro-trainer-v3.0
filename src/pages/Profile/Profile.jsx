// GymPro Trainer — Profile & Settings Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Settings, Download, RefreshCw, Moon, Weight, Info, Crown, ChevronRight, Utensils } from 'lucide-react';
import { useStore } from '../../store/useStore';
import db from '../../db/database';
import { loadSampleData } from '../../data/sampleData';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, addToast } = useStore();
  const [showAbout, setShowAbout] = useState(false);

  const handleExport = async () => {
    const data = {
      profile: await db.table('userProfile').toArray(),
      workouts: await db.table('workoutLogs').toArray(),
      sets: await db.table('setLogs').toArray(),
      prs: await db.table('personalRecords').toArray(),
      nutrition: await db.table('nutritionLogs').toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gympro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported! 📁');
  };

  const handleLoadSample = async () => {
    await loadSampleData();
    addToast('Sample data loaded! 📊');
    window.location.reload();
  };

  const handleReset = async () => {
    if (window.confirm('⚠️ This will delete ALL your data. Are you sure?')) {
      await db.delete();
      window.location.reload();
    }
  };

  const settings = [
    { icon: Utensils, label: 'Nutrition Tracker', action: () => navigate('/nutrition'), chevron: true },
    { icon: Download, label: 'Export Data', desc: 'Download your logs as JSON', action: handleExport },
    { icon: RefreshCw, label: 'Load Sample Data', desc: 'Pre-load 4 weeks of test data', action: handleLoadSample },
    { icon: Info, label: 'About GymPro', action: () => setShowAbout(!showAbout) },
  ];

  return (
    <div className="page" id="profile-page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      {/* Profile Card */}
      <motion.div
        className="profile-card glass-card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-avatar">
          <User size={32} />
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{profile?.name || 'Lifter'}</h2>
          <div className="profile-badges">
            <span className="chip active">{profile?.experienceLevel || 'Beginner'}</span>
            <span className="chip">{profile?.primaryGoal || 'Strength'}</span>
            <span className="chip">{profile?.trainingDays || 4} days/wk</span>
          </div>
        </div>
      </motion.div>

      {/* Current 1RMs */}
      <motion.div
        className="section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="section-title">Your Training Maxes</h3>
        <div className="rm-grid">
          {[
            { label: 'Squat', value: profile?.squat1RM || 100, color: '#39FF14' },
            { label: 'Bench', value: profile?.bench1RM || 60, color: '#00D4FF' },
            { label: 'Deadlift', value: profile?.deadlift1RM || 120, color: '#FF6B35' },
            { label: 'OHP', value: profile?.ohp1RM || 40, color: '#A855F7' },
          ].map((rm, i) => (
            <div key={i} className="rm-card card">
              <div className="rm-color" style={{ background: rm.color }} />
              <div className="rm-label">{rm.label}</div>
              <div className="rm-value" style={{ color: rm.color }}>{rm.value} kg</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Premium Banner */}
      <motion.div
        className="premium-banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Crown size={24} className="premium-icon" />
        <div>
          <div className="premium-title">GymPro Premium</div>
          <div className="premium-desc">Advanced AI coaching, custom periodization, cloud sync</div>
        </div>
        <div className="premium-price">₹149/mo</div>
      </motion.div>

      {/* Settings List */}
      <motion.div
        className="section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="section-title">Settings</h3>
        <div className="settings-list">
          {settings.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} className="settings-item" onClick={item.action}>
                <div className="settings-item-icon">
                  <Icon size={18} />
                </div>
                <div className="settings-item-info">
                  <span className="settings-item-label">{item.label}</span>
                  {item.desc && <span className="settings-item-desc">{item.desc}</span>}
                </div>
                {item.chevron && <ChevronRight size={16} className="text-dim" />}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <button className="btn-ghost danger-btn" onClick={handleReset}>
          Reset All Data
        </button>
      </motion.div>

      {/* About */}
      {showAbout && (
        <motion.div
          className="about-card card"
          initial={{ opacity: 0, scaleY: 0.8 }}
          animate={{ opacity: 1, scaleY: 1 }}
        >
          <h3 className="gradient-text" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
            GymPro Trainer v1.0
          </h3>
          <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
            Built for serious lifters in Mumbai and beyond. Track your powerlifting journey with adaptive programs, 
            real-time logging, and comprehensive progress analytics. No fluff, just gains.
          </p>
          <p className="text-dim" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-3)' }}>
            Made with 💪 for the iron game
          </p>
        </motion.div>
      )}
    </div>
  );
}
