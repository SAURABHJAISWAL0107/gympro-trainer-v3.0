// GymPro Trainer — Workout Landing Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Play, Clock, Dumbbell, History, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import db from '../../db/database';
import './WorkoutLanding.css';

export default function WorkoutLanding() {
  const navigate = useNavigate();
  const { programDays, startWorkout, startEmptyWorkout } = useStore();
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  useEffect(() => {
    loadRecent();
  }, []);

  async function loadRecent() {
    const logs = await db.table('workoutLogs').orderBy('date').reverse().limit(10).toArray();
    setRecentWorkouts(logs);
  }

  const handleStartEmpty = () => {
    startEmptyWorkout();
    navigate('/active-workout');
  };

  const handleStartProgramDay = (day) => {
    startWorkout(day);
    navigate('/active-workout');
  };

  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="page" id="workout-landing-page">
      <div className="page-header">
        <h1 className="page-title">Workout</h1>
        <p className="page-subtitle">Start logging your session</p>
      </div>

      {/* Quick Start */}
      <motion.button
        className="quick-start-card"
        onClick={handleStartEmpty}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        id="btn-quick-start"
      >
        <div className="quick-start-icon">
          <Plus size={28} />
        </div>
        <div>
          <div className="quick-start-title">Empty Workout</div>
          <div className="quick-start-desc">Start from scratch, add exercises as you go</div>
        </div>
      </motion.button>

      {/* Program Workouts */}
      {programDays.length > 0 && (
        <div className="section">
          <h3 className="section-title">Program Workouts</h3>
          <div className="program-workout-list">
            {programDays.map((day, i) => {
              const exercises = JSON.parse(day.exercises || '[]');
              return (
                <motion.button
                  key={day.id || i}
                  className="program-workout-item card"
                  onClick={() => handleStartProgramDay(day)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="pw-icon">
                    <Dumbbell size={18} />
                  </div>
                  <div className="pw-info">
                    <div className="pw-name">{day.dayName}</div>
                    <div className="pw-detail">{day.focus} • {exercises.length} exercises</div>
                  </div>
                  <Play size={18} className="pw-play" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <div className="section">
          <h3 className="section-title">
            <History size={14} /> Recent History
          </h3>
          <div className="recent-list">
            {recentWorkouts.map((log, i) => (
              <div key={log.id || i} className="recent-item card">
                <div className="recent-date">
                  {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="recent-meta">
                  <span><Clock size={12} /> {formatDuration(log.duration)}</span>
                  <span>RPE {log.sessionRPE}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
