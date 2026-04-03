// GymPro Trainer — Active Workout Logger
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Check, X, Trash2, Timer, RotateCcw, Copy,
  MoreVertical, Play, Pause, ChevronDown, ChevronUp, Search, Info, Hash
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import db from '../../db/database';
import RepCounter from '../../components/RepCounter/RepCounter';
import ExerciseVideo from '../../components/ExerciseVideo/ExerciseVideo';
import './ActiveWorkout.css';

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const {
    activeWorkout, activeWorkoutExercises, workoutStartTime,
    updateSet, completeSet, addSet, removeSet, removeExercise,
    addExerciseToWorkout, finishWorkout, cancelWorkout, addToast,
  } = useStore();

  const [elapsed, setElapsed] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(120);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRPE, setSessionRPE] = useState(7);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [timerMode, setTimerMode] = useState('rest'); // rest | amrap | emom
  const [showRepCounter, setShowRepCounter] = useState(false);
  const [repCounterTarget, setRepCounterTarget] = useState(null); // { exerciseId, setId }
  const [showVideoFor, setShowVideoFor] = useState(null); // exercise object
  const [previousData, setPreviousData] = useState({}); // { exerciseName: { weight, reps } }

  // Redirect if no active workout
  useEffect(() => {
    if (!activeWorkout) navigate('/home');
  }, [activeWorkout, navigate]);

  // Workout timer
  useEffect(() => {
    if (!workoutStartTime) return;
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [workoutStartTime]);

  // Rest / AMRAP / EMOM timer
  useEffect(() => {
    if (!timerRunning) return;
    if (timerMode === 'amrap') {
      // AMRAP counts UP
      const iv = setInterval(() => setTimerSeconds(s => s + 1), 1000);
      return () => clearInterval(iv);
    }
    // rest & emom count DOWN
    if (timerSeconds <= 0) {
      if (timerMode === 'emom') {
        // EMOM: restart the interval
        setTimerSeconds(timerDuration);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
        addToast('Next round! ⏱️');
        return;
      }
      setTimerRunning(false);
      setShowTimer(false);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      addToast('Rest complete! 💪');
      return;
    }
    const iv = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    return () => clearInterval(iv);
  }, [timerRunning, timerSeconds, timerMode]);

  // Load exercises for picker
  useEffect(() => {
    db.table('exercises').toArray().then(setExercises);
  }, []);

  // Load previous session data for each exercise
  useEffect(() => {
    async function loadPrevious() {
      const prev = {};
      for (const ex of activeWorkoutExercises) {
        const lastSets = await db.table('setLogs')
          .where('exerciseName').equals(ex.name)
          .reverse()
          .limit(5)
          .toArray();
        if (lastSets.length > 0) {
          const best = lastSets.reduce((b, s) => s.weight > b.weight ? s : b, lastSets[0]);
          prev[ex.name] = { weight: best.weight, reps: best.reps };
        }
      }
      setPreviousData(prev);
    }
    if (activeWorkoutExercises.length > 0) loadPrevious();
  }, [activeWorkoutExercises.length]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startRestTimer = (duration) => {
    setTimerDuration(duration || 120);
    setTimerSeconds(duration || 120);
    setTimerRunning(true);
    setShowTimer(true);
  };

  const handleCompleteSet = (exId, setId) => {
    completeSet(exId, setId);
    // Auto-start rest timer
    const ex = activeWorkoutExercises.find(e => e.id === exId);
    const set = ex?.sets.find(s => s.id === setId);
    if (set && !set.completed) {
      startRestTimer(timerDuration);
    }
  };

  const handleFinish = async () => {
    const logId = await finishWorkout(sessionNotes, sessionRPE);
    addToast('Workout saved! 🎉');
    navigate('/home');
  };

  const handleCancel = () => {
    if (window.confirm('Discard this workout?')) {
      cancelWorkout();
      navigate('/home');
    }
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedExercises = filteredExercises.reduce((acc, ex) => {
    const group = ex.muscleGroup;
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {});

  const completedSets = activeWorkoutExercises.reduce((sum, ex) => 
    sum + ex.sets.filter(s => s.completed).length, 0
  );
  const totalSets = activeWorkoutExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = activeWorkoutExercises.reduce((sum, ex) => 
    sum + ex.sets.filter(s => s.completed).reduce((v, s) => v + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0), 0
  );

  if (!activeWorkout) {
    return null;
  }

  return (
    <div className="active-workout" id="active-workout-page">
      {/* Header */}
      <div className="aw-header">
        <button className="btn-ghost" onClick={handleCancel}>
          <X size={20} />
        </button>
        <div className="aw-header-center">
          <h2 className="aw-title">{activeWorkout.dayName}</h2>
          <span className="aw-timer">{formatTime(elapsed)}</span>
        </div>
        <button className="btn-ghost aw-finish-btn" onClick={() => setShowFinish(true)}>
          <Check size={20} /> Finish
        </button>
      </div>

      {/* Stats bar */}
      <div className="aw-stats-bar">
        <span>{completedSets}/{totalSets} sets</span>
        <span>•</span>
        <span>{Math.round(totalVolume)} kg volume</span>
        <span>•</span>
        <span>{formatTime(elapsed)}</span>
      </div>

      {/* Exercise list */}
      <div className="aw-exercises">
        {activeWorkoutExercises.map((exercise, exIdx) => (
          <motion.div
            key={exercise.id}
            className="aw-exercise-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: exIdx * 0.05 }}
          >
            <div className="aw-exercise-header">
              <h3 className="aw-exercise-name">{exercise.name}</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-ghost" onClick={async () => {
                  const ex = exercises.find(e => e.name === exercise.name);
                  if (ex) setShowVideoFor(ex);
                }} title="Exercise info">
                  <Info size={16} />
                </button>
                <button className="btn-ghost" onClick={() => removeExercise(exercise.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Set header row */}
            <div className="set-header-row">
              <span className="set-col set-num">SET</span>
              <span className="set-col set-prev">PREVIOUS</span>
              <span className="set-col set-weight">KG</span>
              <span className="set-col set-reps">REPS</span>
              <span className="set-col set-rpe">RPE</span>
              <span className="set-col set-check">✓</span>
            </div>

            {/* Set rows */}
            {exercise.sets.map((set, setIdx) => (
              <motion.div
                key={set.id}
                className={`set-row ${set.completed ? 'completed' : ''} ${set.isWarmup ? 'warmup' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: setIdx * 0.03 }}
              >
                <span className="set-col set-num">
                  {set.isWarmup ? 'W' : set.setNumber}
                </span>
                <span className="set-col set-prev text-dim">
                  {previousData[exercise.name] ? `${previousData[exercise.name].weight}×${previousData[exercise.name].reps}` : (exercise.prescribedWeight ? `${exercise.prescribedWeight}×${exercise.reps || 5}` : '—')}
                </span>
                <input
                  type="number"
                  className="num-input set-col set-weight"
                  placeholder="0"
                  value={set.weight}
                  onChange={e => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                />
                <input
                  type="number"
                  className="num-input set-col set-reps"
                  placeholder="0"
                  value={set.reps}
                  onChange={e => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                />
                <input
                  type="number"
                  className="num-input set-col set-rpe rpe-input"
                  placeholder="—"
                  min="1"
                  max="10"
                  value={set.rpe}
                  onChange={e => updateSet(exercise.id, set.id, 'rpe', e.target.value)}
                />
                <button
                  className={`set-check-btn ${set.completed ? 'checked' : ''}`}
                  onClick={() => handleCompleteSet(exercise.id, set.id)}
                >
                  <Check size={16} />
                </button>
              </motion.div>
            ))}

            {/* Add set / Rep counter buttons */}
            <div className="aw-exercise-actions">
              <button className="add-set-btn" onClick={() => addSet(exercise.id)}>
                <Plus size={14} /> Add Set
              </button>
              <button className="add-set-btn rep-counter-btn" onClick={() => {
                setRepCounterTarget({ exerciseId: exercise.id, exerciseName: exercise.name });
                setShowRepCounter(true);
              }}>
                <Hash size={14} /> Rep Counter
              </button>
            </div>
          </motion.div>
        ))}

        {/* Add exercise button */}
        <button
          className="add-exercise-btn"
          onClick={() => setShowExercisePicker(true)}
          id="btn-add-exercise"
        >
          <Plus size={20} /> Add Exercise
        </button>
      </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {showTimer && (
          <motion.div
            className="rest-timer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rest-timer-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {/* Timer Mode Tabs */}
              <div className="timer-mode-tabs">
                {['rest', 'amrap', 'emom'].map(mode => (
                  <button
                    key={mode}
                    className={`timer-mode-tab ${timerMode === mode ? 'active' : ''}`}
                    onClick={() => {
                      setTimerMode(mode);
                      setTimerRunning(false);
                      setTimerSeconds(mode === 'amrap' ? 0 : timerDuration);
                    }}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
              <h3 className="rest-timer-label">
                {timerMode === 'rest' ? 'Rest Timer' : timerMode === 'amrap' ? 'AMRAP Timer' : 'EMOM Timer'}
              </h3>
              <div className="rest-timer-display">
                {formatTime(timerSeconds)}
              </div>
              <div className="rest-timer-controls">
                <button className="btn-secondary" onClick={() => setTimerSeconds(s => s + 30)}>
                  +30s
                </button>
                <button
                  className="rest-timer-main-btn"
                  onClick={() => setTimerRunning(!timerRunning)}
                >
                  {timerRunning ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
                </button>
                <button className="btn-secondary" onClick={() => { setTimerRunning(false); setShowTimer(false); }}>
                  Skip
                </button>
              </div>
              <div className="rest-presets">
                {[60, 90, 120, 180, 300].map(d => (
                  <button
                    key={d}
                    className={`rest-preset ${timerDuration === d ? 'active' : ''}`}
                    onClick={() => { setTimerDuration(d); setTimerSeconds(d); setTimerRunning(true); }}
                  >
                    {d < 60 ? `${d}s` : `${d / 60}m`}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating rest timer button */}
      {!showTimer && (
        <button className="floating-timer-btn" onClick={() => setShowTimer(true)}>
          <Timer size={20} />
          {timerRunning && <span className="timer-badge">{formatTime(timerSeconds)}</span>}
        </button>
      )}

      {/* Exercise Picker Bottom Sheet */}
      <AnimatePresence>
        {showExercisePicker && (
          <>
            <motion.div
              className="bottom-sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExercisePicker(false)}
            />
            <motion.div
              className="bottom-sheet exercise-picker"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            >
              <div className="bottom-sheet-handle" />
              <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>
                Add Exercise
              </h3>
              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="exercise-list">
                {Object.entries(groupedExercises).map(([group, exs]) => (
                  <div key={group}>
                    <div className="exercise-group-label">{group}</div>
                    {exs.map((ex) => (
                      <button
                        key={ex.id}
                        className="exercise-list-item"
                        onClick={() => {
                          addExerciseToWorkout(ex);
                          setShowExercisePicker(false);
                          setSearchQuery('');
                        }}
                      >
                        <div>
                          <div className="exercise-item-name">{ex.name}</div>
                          <div className="exercise-item-meta">{ex.equipment} • {ex.movementPattern}</div>
                        </div>
                        <Plus size={18} className="text-dim" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Finish Workout Sheet */}
      <AnimatePresence>
        {showFinish && (
          <>
            <motion.div
              className="bottom-sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinish(false)}
            />
            <motion.div
              className="bottom-sheet finish-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            >
              <div className="bottom-sheet-handle" />
              <h3 className="finish-title">Finish Workout 🎉</h3>
              
              <div className="finish-stats">
                <div className="finish-stat">
                  <span className="finish-stat-val">{formatTime(elapsed)}</span>
                  <span className="finish-stat-label">Duration</span>
                </div>
                <div className="finish-stat">
                  <span className="finish-stat-val">{completedSets}</span>
                  <span className="finish-stat-label">Sets</span>
                </div>
                <div className="finish-stat">
                  <span className="finish-stat-val">{Math.round(totalVolume)}</span>
                  <span className="finish-stat-label">Volume (kg)</span>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <label>Session RPE</label>
                <div className="rpe-selector">
                  {[6, 7, 8, 9, 10].map(r => (
                    <button
                      key={r}
                      className={`rpe-btn ${sessionRPE === r ? 'active' : ''}`}
                      onClick={() => setSessionRPE(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-input"
                  placeholder="How did the session feel?"
                  rows={3}
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <button className="btn-primary" onClick={handleFinish}>
                Save Workout ✓
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rep Counter Overlay */}
      <AnimatePresence>
        {showRepCounter && (
          <RepCounter
            onComplete={(reps) => {
              if (repCounterTarget) {
                addToast(`${reps} reps counted! 🔢`);
              }
              setShowRepCounter(false);
            }}
            onClose={() => setShowRepCounter(false)}
          />
        )}
      </AnimatePresence>

      {/* Exercise Video Demo */}
      {showVideoFor && (
        <ExerciseVideo
          exercise={showVideoFor}
          onClose={() => setShowVideoFor(null)}
        />
      )}
    </div>
  );
}
