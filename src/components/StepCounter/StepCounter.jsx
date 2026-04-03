// GymPro Trainer — Step Counter (Accelerometer-based Pedometer)
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Footprints, Activity } from 'lucide-react';
import './StepCounter.css';

// Step detection algorithm parameters
const THRESHOLD = 1.2;        // m/s² — acceleration spike that counts as a step
const MIN_STEP_INTERVAL = 250; // ms — minimum time between steps (prevents double-count)
const SMOOTHING_WINDOW = 5;    // samples — rolling average to reduce noise

export default function StepCounter({ onClose }) {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [calories, setCalories] = useState(0);
  const [distance, setDistance] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cadence, setCadence] = useState(0);

  const lastStepTime = useRef(0);
  const accelBuffer = useRef([]);
  const recentStepTimes = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Estimate calories: ~0.04 kcal per step for avg person
  // Distance: ~0.762 meters per step (avg stride)
  useEffect(() => {
    setCalories(Math.round(steps * 0.04));
    setDistance(Math.round(steps * 0.762) / 1000); // km
  }, [steps]);

  // Elapsed timer
  useEffect(() => {
    if (isTracking) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTracking]);

  // Cadence (steps per minute) from recent step timestamps
  useEffect(() => {
    const recent = recentStepTimes.current;
    if (recent.length >= 2) {
      const timeSpan = recent[recent.length - 1] - recent[0];
      if (timeSpan > 0) {
        setCadence(Math.round((recent.length - 1) / (timeSpan / 60000)));
      }
    }
  }, [steps]);

  const processAcceleration = useCallback((event) => {
    const { x, y, z } = event.accelerationIncludingGravity || event.acceleration || {};
    if (x == null || y == null || z == null) return;

    // Calculate magnitude (direction-agnostic)
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Add to rolling buffer
    accelBuffer.current.push(magnitude);
    if (accelBuffer.current.length > SMOOTHING_WINDOW) {
      accelBuffer.current.shift();
    }

    // Calculate rolling average
    const avg = accelBuffer.current.reduce((s, v) => s + v, 0) / accelBuffer.current.length;

    // Step detection: spike above threshold relative to gravity (~9.81)
    const deviation = Math.abs(magnitude - avg);
    const now = Date.now();

    if (deviation > THRESHOLD && (now - lastStepTime.current) > MIN_STEP_INTERVAL) {
      lastStepTime.current = now;
      setSteps(s => s + 1);

      // Track recent step times for cadence calculation (keep last 20)
      recentStepTimes.current.push(now);
      if (recentStepTimes.current.length > 20) {
        recentStepTimes.current.shift();
      }

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(15);
    }
  }, []);

  const requestPermission = async () => {
    // iOS 13+ requires explicit permission for DeviceMotion
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        setHasPermission(permission === 'granted');
        return permission === 'granted';
      } catch (err) {
        console.error('Motion permission error:', err);
        setHasPermission(false);
        return false;
      }
    }
    // Android/desktop — no explicit permission needed
    setHasPermission(true);
    return true;
  };

  const startTracking = async () => {
    const granted = hasPermission !== null ? hasPermission : await requestPermission();
    if (!granted) return;

    window.addEventListener('devicemotion', processAcceleration, true);
    setIsTracking(true);
  };

  const stopTracking = () => {
    window.removeEventListener('devicemotion', processAcceleration, true);
    setIsTracking(false);
  };

  const resetCounter = () => {
    stopTracking();
    setSteps(0);
    setElapsed(0);
    setCadence(0);
    startTimeRef.current = null;
    accelBuffer.current = [];
    recentStepTimes.current = [];
    lastStepTime.current = 0;
  };

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', processAcceleration, true);
      clearInterval(timerRef.current);
    };
  }, [processAcceleration]);

  return (
    <motion.div
      className="step-counter-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="step-header">
        <button className="btn-ghost" onClick={() => { stopTracking(); onClose(); }}>
          <X size={22} />
        </button>
        <h3 className="step-title">Step Counter</h3>
        <button className="btn-ghost" onClick={resetCounter}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Permission denied message */}
      {hasPermission === false && (
        <div className="step-permission-error">
          <p>⚠️ Motion sensor access denied.</p>
          <p className="text-dim">Go to your browser settings and allow motion & orientation access for this site.</p>
        </div>
      )}

      {/* Step count display */}
      <div className="step-display">
        <AnimatePresence mode="wait">
          <motion.div
            key={steps}
            className="step-count"
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {steps.toLocaleString()}
          </motion.div>
        </AnimatePresence>
        <div className="step-label">STEPS</div>
      </div>

      {/* Stats grid */}
      <div className="step-stats">
        <div className="step-stat">
          <div className="step-stat-value">{distance.toFixed(2)}</div>
          <div className="step-stat-label">KM</div>
        </div>
        <div className="step-stat">
          <div className="step-stat-value">{calories}</div>
          <div className="step-stat-label">KCAL</div>
        </div>
        <div className="step-stat">
          <div className="step-stat-value">{formatTime(elapsed)}</div>
          <div className="step-stat-label">TIME</div>
        </div>
        <div className="step-stat">
          <div className="step-stat-value">{cadence}</div>
          <div className="step-stat-label">SPM</div>
        </div>
      </div>

      {/* Progress ring hint */}
      <div className="step-goal-hint">
        <div className="step-goal-bar">
          <motion.div
            className="step-goal-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (steps / 10000) * 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-dim">{steps.toLocaleString()} / 10,000 daily goal</span>
      </div>

      {/* Start/Stop button */}
      <motion.button
        className={`step-toggle-btn ${isTracking ? 'tracking' : ''}`}
        onClick={toggleTracking}
        whileTap={{ scale: 0.95 }}
      >
        {isTracking ? (
          <>
            <Pause size={24} /> Stop
            <span className="step-pulse" />
          </>
        ) : (
          <>
            <Play size={24} fill="currentColor" /> {steps > 0 ? 'Resume' : 'Start'}
          </>
        )}
      </motion.button>

      {/* Note */}
      <p className="step-note">
        📱 Place your phone in your pocket or hold it while walking. Works best on mobile devices with motion sensors.
      </p>
    </motion.div>
  );
}
