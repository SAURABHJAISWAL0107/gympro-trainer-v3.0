// GymPro Trainer — Main App
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/layout/BottomNav';
import Onboarding from './pages/Onboarding/Onboarding';
import Home from './pages/Home/Home';
import Programs from './pages/Programs/Programs';
import WorkoutLanding from './pages/Workout/WorkoutLanding';
import ActiveWorkout from './pages/Workout/ActiveWorkout';
import Progress from './pages/Progress/Progress';
import Profile from './pages/Profile/Profile';
import Nutrition from './pages/Nutrition/Nutrition';
import { useStore } from './store/useStore';
import { seedExercises } from './db/database';
import { loadSampleData } from './data/sampleData';
import './styles/global.css';

function ToastContainer() {
  const { toasts } = useStore();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function AppContent() {
  const { onboardingComplete, loadProfile, loadActiveProgram } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await seedExercises();
      const profile = await loadProfile();
      if (profile?.onboardingComplete) {
        await loadActiveProgram();
        // Sample data can be loaded optionally via Profile settings
        // await loadSampleData();
      }
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: '16px',
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(57,255,20,0.15), rgba(0,212,255,0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 32 }}>🏋️</span>
        </div>
        <div className="gradient-text" style={{ fontSize: 24, fontWeight: 900 }}>GymPro Trainer</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>Loading your gains...</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ height: '100%', position: 'relative' }}>
        <Routes>
          {!onboardingComplete ? (
            <>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/workout" element={<WorkoutLanding />} />
              <Route path="/active-workout" element={<ActiveWorkout />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </>
          )}
        </Routes>
        {onboardingComplete && <BottomNav />}
      </div>
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
