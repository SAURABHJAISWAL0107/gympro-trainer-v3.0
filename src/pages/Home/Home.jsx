// GymPro Trainer — Dashboard Home Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, Flame, TrendingUp, Clock, ChevronRight, Zap, Plus, Footprints } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getDailyQuote } from '../../engine/programGenerator';
import db from '../../db/database';
import StepCounter from '../../components/StepCounter/StepCounter';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { profile, activeProgram, programDays, startWorkout, startEmptyWorkout } = useStore();
  const [stats, setStats] = useState({ workoutsThisWeek: 0, totalVolume: 0, streak: 0, prs: [] });
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [recentPRs, setRecentPRs] = useState([]);
  const [showStepCounter, setShowStepCounter] = useState(false);
  const quote = getDailyQuote();

  useEffect(() => {
    loadDashboardData();
  }, [programDays]);

  async function loadDashboardData() {
    // Find today's workout from program
    const dayOfWeek = new Date().getDay() || 7; // 1=Mon, 7=Sun
    if (programDays.length > 0) {
      const today = programDays.find(d => d.dayOfWeek === dayOfWeek) || programDays[0];
      setTodayWorkout(today);
    }

    // Weekly stats
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekLogs = await db.table('workoutLogs')
      .where('date')
      .aboveOrEqual(weekStart.toISOString().split('T')[0])
      .toArray();

    const allSetsThisWeek = await db.table('setLogs')
      .where('workoutLogId')
      .anyOf(weekLogs.map(l => l.id).filter(Boolean))
      .toArray();

    const totalVolume = allSetsThisWeek.reduce((sum, s) => sum + (s.weight * s.reps), 0);

    // Streak calculation
    let streak = 0;
    const allLogs = await db.table('workoutLogs').orderBy('date').reverse().toArray();
    if (allLogs.length > 0) {
      let checkDate = new Date();
      for (const log of allLogs) {
        const logDate = log.date;
        const diff = Math.floor((checkDate - new Date(logDate)) / 86400000);
        if (diff <= 2) {
          streak++;
          checkDate = new Date(logDate);
        } else break;
      }
    }

    // Recent PRs
    const prs = await db.table('personalRecords').orderBy('date').reverse().limit(5).toArray();
    setRecentPRs(prs);

    setStats({
      workoutsThisWeek: weekLogs.length,
      totalVolume: Math.round(totalVolume),
      streak,
      prs,
    });
  }

  const handleStartWorkout = (day) => {
    if (day) {
      startWorkout(day);
    } else {
      startEmptyWorkout();
    }
    navigate('/active-workout');
  };

  const trainingDays = profile?.trainingDays || 4;
  const completionPct = Math.min(100, Math.round((stats.workoutsThisWeek / trainingDays) * 100));

  return (
    <div className="page" id="home-page">
      {/* Header */}
      <motion.div 
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="home-greeting">
            Hey, <span className="gradient-text">{profile?.name || 'Lifter'}</span> 👊
          </h1>
          <p className="home-date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="streak-badge">
          <Flame size={18} />
          <span>{stats.streak}</span>
        </div>
      </motion.div>

      {/* Quote */}
      <motion.div 
        className="quote-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="quote-text">"{quote.text}"</p>
        <p className="quote-author">— {quote.author}</p>
      </motion.div>

      {/* Today's Workout CTA */}
      <motion.div
        className="today-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="today-header">
          <div>
            <h3 className="today-label">Today's Workout</h3>
            <h2 className="today-name">{todayWorkout?.dayName || 'Rest Day'}</h2>
            {todayWorkout && (
              <p className="today-focus">{todayWorkout.focus} • {JSON.parse(todayWorkout.exercises || '[]').length} exercises</p>
            )}
          </div>
          <div className="today-ring">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--bg-input)" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPct / 100)}`}
                transform="rotate(-90 28 28)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <span className="ring-text">{completionPct}%</span>
          </div>
        </div>
        <div className="today-actions">
          <button
            className="btn-primary start-btn"
            onClick={() => handleStartWorkout(todayWorkout)}
            disabled={!todayWorkout}
            id="btn-start-workout"
          >
            <Play size={20} fill="currentColor" /> Start Workout
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleStartWorkout(null)}
            id="btn-quick-workout"
          >
            <Plus size={18} /> Quick
          </button>
        </div>
      </motion.div>

      {/* Weekly Stats */}
      <motion.div
        className="stats-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)' }}>
            <Zap size={18} />
          </div>
          <div className="stat-value">{stats.workoutsThisWeek}/{trainingDays}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-secondary-dim)', color: 'var(--accent-secondary)' }}>
            <TrendingUp size={18} />
          </div>
          <div className="stat-value">{stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : stats.totalVolume}</div>
          <div className="stat-label">Volume (kg)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-warm-dim)', color: 'var(--accent-warm)' }}>
            <Trophy size={18} />
          </div>
          <div className="stat-value">{recentPRs.length}</div>
          <div className="stat-label">PRs</div>
        </div>
      </motion.div>

      {/* Step Counter Quick Access */}
      <motion.button
        className="step-counter-card card"
        onClick={() => setShowStepCounter(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        whileTap={{ scale: 0.98 }}
        id="btn-step-counter"
      >
        <div className="scc-icon">
          <Footprints size={20} />
        </div>
        <div className="scc-info">
          <span className="scc-title">Step Counter</span>
          <span className="scc-desc">Track your warmup walks & cardio</span>
        </div>
        <ChevronRight size={16} className="text-dim" />
      </motion.button>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <motion.div
          className="section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-header" onClick={() => navigate('/progress')}>
            <h3 className="section-title">Recent PRs 🏆</h3>
            <ChevronRight size={16} className="text-dim" />
          </div>
          <div className="pr-list">
            {recentPRs.slice(0, 3).map((pr, i) => (
              <div key={i} className="pr-item card">
                <div className="pr-info">
                  <span className="pr-name">{pr.exerciseName}</span>
                  <span className="pr-detail">{pr.weight}kg × {pr.reps} rep{pr.reps > 1 ? 's' : ''}</span>
                </div>
                <div className="pr-1rm">
                  <span className="pr-est">Est. 1RM</span>
                  <span className="pr-value">{pr.estimated1RM}kg</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Program Overview */}
      {activeProgram && (
        <motion.div
          className="section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header" onClick={() => navigate('/programs')}>
            <h3 className="section-title">Current Program</h3>
            <ChevronRight size={16} className="text-dim" />
          </div>
          <div className="program-card card">
            <div className="program-name">{activeProgram.name}</div>
            <div className="program-meta">
              <span><Clock size={14} /> Week {activeProgram.weekNumber || 1}/{activeProgram.cycleLength || 4}</span>
              <span>{programDays.length} days/week</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step Counter Overlay */}
      <AnimatePresence>
        {showStepCounter && (
          <StepCounter onClose={() => setShowStepCounter(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
