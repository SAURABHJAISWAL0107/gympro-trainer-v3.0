// GymPro Trainer — Weekly Programs / Calendar View
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Play, RefreshCw, Calendar, Dumbbell, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateProgram } from '../../engine/programGenerator';
import './Programs.css';

const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Programs() {
  const navigate = useNavigate();
  const { activeProgram, programDays, profile, saveProgram, startWorkout, addToast } = useStore();
  const [selectedDay, setSelectedDay] = useState(null);
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    buildWeekView();
  }, [programDays]);

  function buildWeekView() {
    const today = new Date();
    const currentDayOfWeek = today.getDay() || 7;
    
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (currentDayOfWeek - i));
      
      const programDay = programDays.find(d => d.dayOfWeek === i);
      
      days.push({
        dayOfWeek: i,
        dayLabel: DAY_NAMES[i],
        date: date.getDate(),
        isToday: i === currentDayOfWeek,
        isRest: !programDay,
        programDay,
      });
    }
    setWeekDays(days);
    
    const todayEntry = days.find(d => d.isToday);
    if (todayEntry?.programDay) {
      setSelectedDay(todayEntry);
    } else if (days.find(d => d.programDay)) {
      setSelectedDay(days.find(d => d.programDay));
    }
  }

  const handleRegenerate = async () => {
    if (!profile) return;
    const { program, programDays: newDays } = generateProgram(profile);
    await saveProgram(program, newDays);
    addToast('Program regenerated! 🔄');
  };

  const handleStartDay = (day) => {
    if (day?.programDay) {
      startWorkout(day.programDay);
      navigate('/active-workout');
    }
  };

  const selectedExercises = selectedDay?.programDay 
    ? JSON.parse(selectedDay.programDay.exercises || '[]') 
    : [];

  return (
    <div className="page" id="programs-page">
      <div className="page-header">
        <h1 className="page-title">Weekly Program</h1>
        {activeProgram && (
          <p className="page-subtitle">
            {activeProgram.name} • Week {activeProgram.weekNumber || 1}
          </p>
        )}
      </div>

      {/* Week Calendar Strip */}
      <motion.div 
        className="week-strip"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {weekDays.map((day) => (
          <button
            key={day.dayOfWeek}
            className={`week-day ${day.isToday ? 'today' : ''} ${selectedDay?.dayOfWeek === day.dayOfWeek ? 'selected' : ''} ${day.isRest ? 'rest' : ''}`}
            onClick={() => !day.isRest && setSelectedDay(day)}
          >
            <span className="week-day-label">{day.dayLabel}</span>
            <span className="week-day-date">{day.date}</span>
            {!day.isRest && <div className="week-day-dot" />}
          </button>
        ))}
      </motion.div>

      {/* Selected Day Detail */}
      {selectedDay?.programDay ? (
        <motion.div
          key={selectedDay.dayOfWeek}
          className="day-detail"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="day-detail-header">
            <div>
              <h2 className="day-detail-name">{selectedDay.programDay.dayName}</h2>
              <p className="day-detail-focus">
                <Dumbbell size={14} /> {selectedDay.programDay.focus} • {selectedExercises.length} exercises
              </p>
            </div>
            <button 
              className="btn-primary day-start-btn"
              onClick={() => handleStartDay(selectedDay)}
            >
              <Play size={18} fill="currentColor" /> Start
            </button>
          </div>

          {/* Exercise Prescription List */}
          <div className="prescription-list">
            {selectedExercises.map((ex, i) => (
              <motion.div
                key={i}
                className="prescription-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="prescription-num">{i + 1}</div>
                <div className="prescription-main">
                  <div className="prescription-name">{ex.name}</div>
                  <div className="prescription-detail">
                    {typeof ex.prescribedWeight === 'object' && Array.isArray(ex.prescribedWeight)
                      ? ex.prescribedWeight.map((s, j) => (
                          <span key={j} className="prescription-set-detail">
                            {s.weight}kg × {s.reps}
                            {j < ex.prescribedWeight.length - 1 ? ' → ' : ''}
                          </span>
                        ))
                      : (
                          <span>
                            {ex.sets}×{ex.reps}
                            {ex.prescribedWeight ? ` @ ${ex.prescribedWeight}kg` : ''}
                          </span>
                        )
                    }
                    {ex.notes && <span className="prescription-notes"> • {ex.notes}</span>}
                  </div>
                </div>
                <div className={`prescription-intensity ${ex.intensity}`}>
                  {ex.intensity === 'heavy' ? '🔴' : ex.intensity === 'moderate' ? '🟡' : ex.intensity === '531' ? '⚡' : '🟢'}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🧘</div>
          <div className="empty-state-title">Rest Day</div>
          <div className="empty-state-text">Recovery is part of the process. Come back stronger tomorrow!</div>
        </div>
      )}

      {/* Program Overview */}
      {activeProgram && (
        <motion.div
          className="section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="section-title">Program Info</h3>
          <div className="card program-info">
            <div className="program-info-row">
              <span className="text-secondary">Program</span>
              <span className="font-bold">{activeProgram.name}</span>
            </div>
            <div className="program-info-row">
              <span className="text-secondary">Type</span>
              <span className="font-bold" style={{ textTransform: 'uppercase' }}>{activeProgram.type}</span>
            </div>
            <div className="program-info-row">
              <span className="text-secondary">Cycle Length</span>
              <span className="font-bold">{activeProgram.cycleLength} weeks</span>
            </div>
            <div className="program-info-row">
              <span className="text-secondary">Days/Week</span>
              <span className="font-bold">{programDays.length}</span>
            </div>
          </div>

          <button className="btn-secondary regenerate-btn" onClick={handleRegenerate}>
            <RefreshCw size={16} /> Regenerate Program
          </button>
        </motion.div>
      )}
    </div>
  );
}
