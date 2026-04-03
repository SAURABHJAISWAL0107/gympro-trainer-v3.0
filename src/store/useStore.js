// GymPro Trainer — Zustand Store
import { create } from 'zustand';
import db from '../db/database';

export const useStore = create((set, get) => ({
  // User Profile
  profile: null,
  onboardingComplete: false,
  
  setProfile: (profile) => set({ profile, onboardingComplete: profile?.onboardingComplete }),

  saveProfile: async (profileData) => {
    const existing = await db.table('userProfile').toArray();
    const data = { ...profileData, onboardingComplete: true, createdAt: new Date().toISOString() };
    if (existing.length > 0) {
      await db.table('userProfile').update(existing[0].id, data);
    } else {
      await db.table('userProfile').add(data);
    }
    set({ profile: data, onboardingComplete: true });
  },

  loadProfile: async () => {
    const profiles = await db.table('userProfile').toArray();
    if (profiles.length > 0) {
      set({ profile: profiles[0], onboardingComplete: profiles[0].onboardingComplete });
      return profiles[0];
    }
    return null;
  },

  // Active Workout
  activeWorkout: null,
  activeWorkoutExercises: [],
  workoutStartTime: null,
  restTimerActive: false,
  restTimerSeconds: 0,
  restTimerDuration: 120,

  startWorkout: (programDay) => {
    const exercises = programDay ? JSON.parse(programDay.exercises).map((ex, i) => ({
      ...ex,
      id: `ex-${i}`,
      sets: Array.from({ length: ex.sets || 3 }, (_, j) => ({
        id: `set-${i}-${j}`,
        setNumber: j + 1,
        weight: ex.prescribedWeight && typeof ex.prescribedWeight === 'number' ? ex.prescribedWeight : '',
        reps: '',
        rpe: '',
        completed: false,
        isWarmup: false,
      })),
    })) : [];
    
    set({
      activeWorkout: programDay || { dayName: 'Quick Workout', focus: 'Custom' },
      activeWorkoutExercises: exercises,
      workoutStartTime: Date.now(),
    });
  },

  startEmptyWorkout: () => {
    set({
      activeWorkout: { dayName: 'Quick Workout', focus: 'Custom' },
      activeWorkoutExercises: [],
      workoutStartTime: Date.now(),
    });
  },

  addExerciseToWorkout: (exercise) => {
    const { activeWorkoutExercises } = get();
    const idx = activeWorkoutExercises.length;
    const newExercise = {
      name: exercise.name,
      id: `ex-${idx}-${Date.now()}`,
      sets: [{ id: `set-${idx}-0`, setNumber: 1, weight: '', reps: '', rpe: '', completed: false, isWarmup: false }],
    };
    set({ activeWorkoutExercises: [...activeWorkoutExercises, newExercise] });
  },

  updateSet: (exerciseId, setId, field, value) => {
    const { activeWorkoutExercises } = get();
    const updated = activeWorkoutExercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s),
      };
    });
    set({ activeWorkoutExercises: updated });
  },

  completeSet: (exerciseId, setId) => {
    const { activeWorkoutExercises } = get();
    const updated = activeWorkoutExercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s),
      };
    });
    set({ activeWorkoutExercises: updated });
  },

  addSet: (exerciseId) => {
    const { activeWorkoutExercises } = get();
    const updated = activeWorkoutExercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet = {
        id: `set-${Date.now()}`,
        setNumber: ex.sets.length + 1,
        weight: lastSet?.weight || '',
        reps: lastSet?.reps || '',
        rpe: '',
        completed: false,
        isWarmup: false,
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    });
    set({ activeWorkoutExercises: updated });
  },

  removeSet: (exerciseId, setId) => {
    const { activeWorkoutExercises } = get();
    const updated = activeWorkoutExercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
    });
    set({ activeWorkoutExercises: updated });
  },

  removeExercise: (exerciseId) => {
    const { activeWorkoutExercises } = get();
    set({ activeWorkoutExercises: activeWorkoutExercises.filter(ex => ex.id !== exerciseId) });
  },

  finishWorkout: async (notes, sessionRPE) => {
    const { activeWorkout, activeWorkoutExercises, workoutStartTime } = get();
    const endTime = Date.now();
    
    const workoutLog = {
      programDayId: activeWorkout?.id || null,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(workoutStartTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: Math.floor((endTime - workoutStartTime) / 1000),
      completed: true,
      notes: notes || '',
      sessionRPE: sessionRPE || 7,
    };

    const logId = await db.table('workoutLogs').add(workoutLog);
    
    // Save individual sets
    const setPromises = [];
    for (const ex of activeWorkoutExercises) {
      for (const s of ex.sets) {
        if (s.completed && s.weight && s.reps) {
          const setLog = {
            workoutLogId: logId,
            exerciseName: ex.name,
            setNumber: s.setNumber,
            weight: parseFloat(s.weight),
            reps: parseInt(s.reps),
            rpe: s.rpe ? parseFloat(s.rpe) : null,
            completed: true,
            timestamp: new Date().toISOString(),
            isWarmup: s.isWarmup || false,
            isPR: false,
          };
          setPromises.push(db.table('setLogs').add(setLog));

          // Check for PR
          const existingPRs = await db.table('personalRecords')
            .where('exerciseName').equals(ex.name)
            .toArray();
          
          const est1RM = s.reps === 1 ? parseFloat(s.weight) : Math.round(parseFloat(s.weight) * (1 + parseInt(s.reps) / 30));
          const currentBest = existingPRs.reduce((max, pr) => Math.max(max, pr.estimated1RM || 0), 0);
          
          if (est1RM > currentBest) {
            await db.table('personalRecords').add({
              exerciseName: ex.name,
              weight: parseFloat(s.weight),
              reps: parseInt(s.reps),
              estimated1RM: est1RM,
              date: new Date().toISOString().split('T')[0],
            });
            setLog.isPR = true;
          }
        }
      }
    }

    await Promise.all(setPromises);

    set({
      activeWorkout: null,
      activeWorkoutExercises: [],
      workoutStartTime: null,
    });

    return logId;
  },

  cancelWorkout: () => {
    set({
      activeWorkout: null,
      activeWorkoutExercises: [],
      workoutStartTime: null,
    });
  },

  // Programs
  activeProgram: null,
  programDays: [],

  setActiveProgram: (program, days) => set({ activeProgram: program, programDays: days }),

  loadActiveProgram: async () => {
    const programs = await db.table('programs').where('active').equals(1).toArray();
    if (programs.length > 0) {
      const program = programs[0];
      const days = await db.table('programDays').where('programId').equals(program.id).toArray();
      set({ activeProgram: program, programDays: days });
      return { program, days };
    }
    return null;
  },

  saveProgram: async (programData, daysData) => {
    // Deactivate existing programs
    const existing = await db.table('programs').where('active').equals(1).toArray();
    for (const p of existing) {
      await db.table('programs').update(p.id, { active: 0 });
    }

    const programId = await db.table('programs').add(programData);
    
    for (const day of daysData) {
      await db.table('programDays').add({ ...day, programId });
    }

    const savedDays = await db.table('programDays').where('programId').equals(programId).toArray();
    set({ activeProgram: { ...programData, id: programId }, programDays: savedDays });
  },

  // Toast notifications
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 3000);
  },
}));
