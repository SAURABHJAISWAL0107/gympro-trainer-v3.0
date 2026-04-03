// GymPro Trainer — Progress Charts & PR Tracker
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, TrendingUp, Target, Filter } from 'lucide-react';
import db from '../../db/database';
import { calculate1RM } from '../../engine/programGenerator';
import './Progress.css';

const MAIN_LIFTS = ['Barbell Back Squat', 'Barbell Bench Press', 'Conventional Deadlift', 'Overhead Press (OHP)'];
const LIFT_COLORS = { 
  'Barbell Back Squat': '#39FF14', 
  'Barbell Bench Press': '#00D4FF', 
  'Conventional Deadlift': '#FF6B35', 
  'Overhead Press (OHP)': '#A855F7' 
};

const TABS = [
  { id: 'lifts', label: 'Lifts', icon: TrendingUp },
  { id: 'prs', label: 'PRs', icon: Trophy },
  { id: 'volume', label: 'Volume', icon: Target },
];

export default function Progress() {
  const [activeTab, setActiveTab] = useState('lifts');
  const [liftData, setLiftData] = useState({});
  const [volumeData, setVolumeData] = useState([]);
  const [prs, setPRs] = useState([]);
  const [selectedLift, setSelectedLift] = useState('Barbell Back Squat');
  const [timeRange, setTimeRange] = useState('3m');

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  async function loadProgressData() {
    const now = new Date();
    const ranges = { '1m': 30, '3m': 90, '6m': 180, 'all': 365 };
    const daysBack = ranges[timeRange] || 90;
    const cutoff = new Date(now.getTime() - daysBack * 86400000).toISOString().split('T')[0];

    // Load all set logs
    const allSets = await db.table('setLogs').toArray();
    const filteredSets = allSets.filter(s => s.timestamp >= cutoff && s.completed);

    // Build lift progression data
    const liftProgress = {};
    for (const lift of MAIN_LIFTS) {
      const liftSets = filteredSets.filter(s => s.exerciseName === lift && !s.isWarmup);
      
      // Group by date, find best set each day
      const dateMap = {};
      liftSets.forEach(s => {
        const date = s.timestamp.split('T')[0];
        const est1RM = calculate1RM(s.weight, s.reps);
        if (!dateMap[date] || est1RM > dateMap[date].est1RM) {
          dateMap[date] = { date, weight: s.weight, reps: s.reps, est1RM };
        }
      });

      liftProgress[lift] = Object.values(dateMap)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({
          ...d,
          dateLabel: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        }));
    }
    setLiftData(liftProgress);

    // Volume per week
    const allWorkouts = await db.table('workoutLogs').toArray();
    const weeklyVolume = {};
    
    for (const workout of allWorkouts) {
      if (workout.date < cutoff) continue;
      const weekStart = getWeekStart(workout.date);
      if (!weeklyVolume[weekStart]) weeklyVolume[weekStart] = { week: weekStart, volume: 0, sets: 0 };
      
      const workoutSets = filteredSets.filter(s => s.workoutLogId === workout.id);
      const vol = workoutSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
      weeklyVolume[weekStart].volume += vol;
      weeklyVolume[weekStart].sets += workoutSets.length;
    }

    setVolumeData(
      Object.values(weeklyVolume)
        .sort((a, b) => a.week.localeCompare(b.week))
        .map(w => ({
          ...w,
          weekLabel: new Date(w.week).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          volumeK: Math.round(w.volume / 1000 * 10) / 10,
        }))
    );

    // PRs
    const allPRs = await db.table('personalRecords').orderBy('date').reverse().toArray();
    setPRs(allPRs);
  }

  function getWeekStart(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return d.toISOString().split('T')[0];
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="tooltip-value" style={{ color: p.color }}>
            {p.value}{p.dataKey === 'est1RM' ? 'kg (est. 1RM)' : p.dataKey === 'volumeK' ? 'k kg' : 'kg'}
          </div>
        ))}
      </div>
    );
  };

  // Calculate powerlifting total
  const totalPR = MAIN_LIFTS.slice(0, 3).reduce((sum, lift) => {
    const liftPRs = prs.filter(p => p.exerciseName === lift);
    const best = liftPRs.reduce((max, p) => Math.max(max, p.estimated1RM || 0), 0);
    return sum + best;
  }, 0);

  return (
    <div className="page" id="progress-page">
      <div className="page-header">
        <h1 className="page-title">Progress</h1>
        <p className="page-subtitle">Track your strength journey</p>
      </div>

      {/* Powerlifting Total */}
      <motion.div
        className="total-card glass-card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="total-label">Powerlifting Total (Est.)</div>
        <div className="total-value gradient-text">{totalPR} kg</div>
        <div className="total-breakdown">
          {MAIN_LIFTS.slice(0, 3).map(lift => {
            const best = prs.filter(p => p.exerciseName === lift).reduce((max, p) => Math.max(max, p.estimated1RM || 0), 0);
            return (
              <span key={lift} style={{ color: LIFT_COLORS[lift] }}>
                {lift.includes('Squat') ? 'S' : lift.includes('Bench') ? 'B' : 'D'}: {best}kg
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Tab selector */}
      <div className="progress-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`progress-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Time range filter */}
      <div className="time-range">
        {['1m', '3m', '6m', 'all'].map(r => (
          <button
            key={r}
            className={`range-btn ${timeRange === r ? 'active' : ''}`}
            onClick={() => setTimeRange(r)}
          >
            {r === 'all' ? 'All' : r.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Lifts Tab */}
      {activeTab === 'lifts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="lift-selector">
            {MAIN_LIFTS.map(lift => (
              <button
                key={lift}
                className={`lift-btn ${selectedLift === lift ? 'active' : ''}`}
                style={selectedLift === lift ? { borderColor: LIFT_COLORS[lift], color: LIFT_COLORS[lift] } : {}}
                onClick={() => setSelectedLift(lift)}
              >
                {lift.includes('Squat') ? 'Squat' : lift.includes('Bench') ? 'Bench' : lift.includes('Dead') ? 'Deadlift' : 'OHP'}
              </button>
            ))}
          </div>

          <div className="chart-container">
            {liftData[selectedLift]?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={liftData[selectedLift]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="dateLabel" tick={{ fill: '#4A5568', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="est1RM"
                    stroke={LIFT_COLORS[selectedLift]}
                    strokeWidth={3}
                    dot={{ fill: LIFT_COLORS[selectedLift], r: 4 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-text">No data yet for this lift. Start logging!</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* PRs Tab */}
      {activeTab === 'prs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="pr-full-list">
            {MAIN_LIFTS.map(lift => {
              const liftPRs = prs.filter(p => p.exerciseName === lift);
              const best = liftPRs.reduce((max, p) => Math.max(max, p.estimated1RM || 0), 0);
              const bestActual = liftPRs.reduce((max, p) => {
                if (p.reps === 1 && p.weight > max) return p.weight;
                return max;
              }, 0);

              return (
                <div key={lift} className="pr-card card">
                  <div className="pr-card-header">
                    <div className="pr-card-color" style={{ background: LIFT_COLORS[lift] }} />
                    <h3 className="pr-card-name">
                      {lift.includes('Squat') ? 'Squat' : lift.includes('Bench') ? 'Bench Press' : lift.includes('Dead') ? 'Deadlift' : 'Overhead Press'}
                    </h3>
                  </div>
                  <div className="pr-card-values">
                    <div>
                      <div className="pr-card-label">Est. 1RM</div>
                      <div className="pr-card-value" style={{ color: LIFT_COLORS[lift] }}>{best || '—'} kg</div>
                    </div>
                    <div>
                      <div className="pr-card-label">Best Single</div>
                      <div className="pr-card-value">{bestActual || '—'} kg</div>
                    </div>
                  </div>
                  {liftPRs.length > 0 && (
                    <div className="pr-card-history">
                      {liftPRs.slice(0, 3).map((pr, i) => (
                        <div key={i} className="pr-history-item">
                          <span>{pr.weight}kg × {pr.reps}</span>
                          <span className="text-dim">{new Date(pr.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Volume Tab */}
      {activeTab === 'volume' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="chart-container">
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="weekLabel" tick={{ fill: '#4A5568', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volumeK" fill="var(--accent-secondary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-text">No volume data yet. Complete some workouts!</div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
