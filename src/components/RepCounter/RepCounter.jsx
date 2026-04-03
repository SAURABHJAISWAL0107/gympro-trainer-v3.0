// GymPro Trainer — Tap Rep Counter Component
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Check } from 'lucide-react';
import './RepCounter.css';

export default function RepCounter({ onComplete, onClose }) {
  const [count, setCount] = useState(0);
  const [taps, setTaps] = useState([]);
  const [lastTapTime, setLastTapTime] = useState(null);
  const [autoDetectTimeout, setAutoDetectTimeout] = useState(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    setCount(c => c + 1);
    setTaps(t => [...t, now]);
    setLastTapTime(now);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(30);

    // Auto-detect set completion after 3s of no taps
    if (autoDetectTimeout) clearTimeout(autoDetectTimeout);
    const timeout = setTimeout(() => {
      // Flash the "Set Complete?" prompt
      document.getElementById('rep-auto-detect')?.classList.add('show');
    }, 3000);
    setAutoDetectTimeout(timeout);
  }, [autoDetectTimeout]);

  const handleReset = () => {
    setCount(0);
    setTaps([]);
    setLastTapTime(null);
    if (autoDetectTimeout) clearTimeout(autoDetectTimeout);
    document.getElementById('rep-auto-detect')?.classList.remove('show');
  };

  const handleConfirm = () => {
    if (onComplete && count > 0) {
      onComplete(count);
    }
    handleReset();
    if (onClose) onClose();
  };

  // Calculate tempo from tap intervals
  const tempo = taps.length >= 2
    ? Math.round(60000 / ((taps[taps.length - 1] - taps[taps.length - 2])))
    : null;

  return (
    <motion.div
      className="rep-counter-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="rep-counter-header">
        <button className="btn-ghost" onClick={onClose}>
          <X size={22} />
        </button>
        <h3 className="rep-counter-title">Rep Counter</h3>
        <button className="btn-ghost" onClick={handleReset}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Count Display */}
      <div className="rep-count-display">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            className="rep-count-number"
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {count}
          </motion.div>
        </AnimatePresence>
        <div className="rep-count-label">REPS</div>
        {tempo && <div className="rep-tempo">{tempo} RPM</div>}
      </div>

      {/* Big Tap Button */}
      <motion.button
        className="rep-tap-btn"
        onClick={handleTap}
        whileTap={{ scale: 0.92 }}
        id="btn-rep-tap"
      >
        <motion.div
          className="rep-tap-ripple"
          key={count}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
        <span className="rep-tap-text">TAP</span>
      </motion.button>

      {/* Auto-detect prompt */}
      <div className="rep-auto-detect" id="rep-auto-detect">
        <span>Set complete?</span>
        <button className="btn-primary rep-confirm-btn" onClick={handleConfirm}>
          <Check size={18} /> Done — {count} reps
        </button>
      </div>

      {/* Manual confirm */}
      {count > 0 && (
        <button className="rep-done-btn" onClick={handleConfirm}>
          ✓ Log {count} reps
        </button>
      )}
    </motion.div>
  );
}
