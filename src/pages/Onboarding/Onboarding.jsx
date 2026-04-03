// GymPro Trainer — Onboarding Flow
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Dumbbell, Target, Zap, Crown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateProgram } from '../../engine/programGenerator';
import './Onboarding.css';

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'basics', title: 'About You' },
  { id: 'experience', title: 'Experience' },
  { id: 'goals', title: 'Goals' },
  { id: 'schedule', title: 'Schedule' },
  { id: 'maxes', title: 'Your Lifts' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile, saveProgram } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'male',
    experienceLevel: 'beginner',
    primaryGoal: 'strength',
    equipment: 'fullGym',
    trainingDays: 4,
    squat1RM: '',
    bench1RM: '',
    deadlift1RM: '',
    ohp1RM: '',
    unit: 'kg',
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleFinish = async () => {
    const profile = {
      ...form,
      age: parseInt(form.age) || 25,
      squat1RM: parseFloat(form.squat1RM) || 100,
      bench1RM: parseFloat(form.bench1RM) || 60,
      deadlift1RM: parseFloat(form.deadlift1RM) || 120,
      ohp1RM: parseFloat(form.ohp1RM) || 40,
    };

    await saveProfile(profile);

    // Generate initial program
    const { program, programDays } = generateProgram(profile);
    await saveProgram(program, programDays);

    navigate('/home');
  };

  const canProceed = () => {
    if (step === 1) return form.name.trim().length > 0;
    return true;
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const next = () => {
    if (step < steps.length - 1 && canProceed()) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="onboarding-welcome">
            <div className="welcome-icon-ring">
              <div className="welcome-icon">
                <Dumbbell size={48} strokeWidth={2} />
              </div>
            </div>
            <h1 className="welcome-title">
              <span className="gradient-text">GymPro</span> Trainer
            </h1>
            <p className="welcome-subtitle">
              Your AI-powered powerlifting coach. Build strength with personalized programs, track every rep, and crush your PRs.
            </p>
            <div className="welcome-features">
              <div className="welcome-feature">
                <Target size={20} />
                <span>Adaptive Programs</span>
              </div>
              <div className="welcome-feature">
                <Zap size={20} />
                <span>Real-time Logging</span>
              </div>
              <div className="welcome-feature">
                <Crown size={20} />
                <span>PR Tracking</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="onboarding-step">
            <h2 className="step-title">Let's get to know you</h2>
            <p className="step-desc">Tell us a bit about yourself</p>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                autoFocus
                id="input-name"
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                className="form-input"
                placeholder="25"
                value={form.age}
                onChange={e => update('age', e.target.value)}
                id="input-age"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <div className="option-row">
                {['male', 'female', 'other'].map(g => (
                  <button
                    key={g}
                    className={`option-btn ${form.gender === g ? 'active' : ''}`}
                    onClick={() => update('gender', g)}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-step">
            <h2 className="step-title">Training Experience</h2>
            <p className="step-desc">How long have you been lifting?</p>
            <div className="level-cards">
              {[
                { id: 'beginner', label: 'Beginner', desc: 'Less than 1 year', icon: '🌱' },
                { id: 'intermediate', label: 'Intermediate', desc: '1-3 years', icon: '💪' },
                { id: 'advanced', label: 'Advanced', desc: '3+ years', icon: '🔥' },
              ].map(level => (
                <button
                  key={level.id}
                  className={`level-card ${form.experienceLevel === level.id ? 'active' : ''}`}
                  onClick={() => update('experienceLevel', level.id)}
                >
                  <span className="level-icon">{level.icon}</span>
                  <div>
                    <div className="level-label">{level.label}</div>
                    <div className="level-desc">{level.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-step">
            <h2 className="step-title">What's your goal?</h2>
            <p className="step-desc">We'll tailor your program accordingly</p>
            <div className="level-cards">
              {[
                { id: 'strength', label: 'Strength', desc: 'Max out your SBD total', icon: '🏋️' },
                { id: 'hypertrophy', label: 'Hypertrophy', desc: 'Build muscle size', icon: '💪' },
                { id: 'both', label: 'Powerbuilding', desc: 'Strength + Size', icon: '⚡' },
              ].map(goal => (
                <button
                  key={goal.id}
                  className={`level-card ${form.primaryGoal === goal.id ? 'active' : ''}`}
                  onClick={() => update('primaryGoal', goal.id)}
                >
                  <span className="level-icon">{goal.icon}</span>
                  <div>
                    <div className="level-label">{goal.label}</div>
                    <div className="level-desc">{goal.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: 24 }}>
              <label>Equipment Available</label>
              <div className="option-row">
                {[
                  { id: 'fullGym', label: 'Full Gym' },
                  { id: 'freeWeights', label: 'Free Weights' },
                  { id: 'homeGym', label: 'Home Gym' },
                ].map(eq => (
                  <button
                    key={eq.id}
                    className={`option-btn ${form.equipment === eq.id ? 'active' : ''}`}
                    onClick={() => update('equipment', eq.id)}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="onboarding-step">
            <h2 className="step-title">Training Schedule</h2>
            <p className="step-desc">How many days can you train per week?</p>
            <div className="days-selector">
              {[3, 4, 5, 6].map(d => (
                <button
                  key={d}
                  className={`day-btn ${form.trainingDays === d ? 'active' : ''}`}
                  onClick={() => update('trainingDays', d)}
                >
                  <span className="day-num">{d}</span>
                  <span className="day-label">days</span>
                </button>
              ))}
            </div>
            <p className="step-hint">
              {form.trainingDays === 3 && '🟢 Perfect for beginners. Full body sessions.'}
              {form.trainingDays === 4 && '🟢 Ideal for most lifters. Upper/Lower split.'}
              {form.trainingDays === 5 && '🟡 High volume. Good for intermediates.'}
              {form.trainingDays === 6 && '🔴 Advanced PPL. Make sure recovery is on point.'}
            </p>
          </div>
        );

      case 5:
        return (
          <div className="onboarding-step">
            <h2 className="step-title">Current Lifts</h2>
            <p className="step-desc">Enter your estimated 1RM (or leave blank for defaults)</p>
            <div className="lifts-grid">
              {[
                { key: 'squat1RM', label: 'Squat', placeholder: '100', icon: '🦵' },
                { key: 'bench1RM', label: 'Bench', placeholder: '60', icon: '🏋️' },
                { key: 'deadlift1RM', label: 'Deadlift', placeholder: '120', icon: '💀' },
                { key: 'ohp1RM', label: 'OHP', placeholder: '40', icon: '🙌' },
              ].map(lift => (
                <div key={lift.key} className="lift-input-card">
                  <span className="lift-icon">{lift.icon}</span>
                  <label>{lift.label}</label>
                  <div className="lift-input-row">
                    <input
                      type="number"
                      className="form-input lift-input"
                      placeholder={lift.placeholder}
                      value={form[lift.key]}
                      onChange={e => update(lift.key, e.target.value)}
                    />
                    <span className="lift-unit">kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding" id="onboarding-page">
      {/* Progress dots */}
      <div className="onboarding-progress">
        {steps.map((s, i) => (
          <div key={s.id} className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
        ))}
      </div>

      {/* Step content */}
      <div className="onboarding-content">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="onboarding-slide"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="onboarding-nav">
        {step > 0 ? (
          <button className="btn-ghost" onClick={prev}>
            <ChevronLeft size={20} /> Back
          </button>
        ) : <div />}
        
        {step < steps.length - 1 ? (
          <button
            className="btn-primary onboarding-next"
            onClick={next}
            disabled={!canProceed()}
            id="btn-next"
          >
            {step === 0 ? 'Get Started' : 'Next'} <ChevronRight size={20} />
          </button>
        ) : (
          <button
            className="btn-primary onboarding-next"
            onClick={handleFinish}
            id="btn-finish"
          >
            Generate My Program 🚀
          </button>
        )}
      </div>
    </div>
  );
}
