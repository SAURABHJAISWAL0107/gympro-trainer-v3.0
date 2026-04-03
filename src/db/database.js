// GymPro Trainer — Dexie IndexedDB Database
import Dexie from 'dexie';

export const db = new Dexie('GymProTrainer');

db.version(1).stores({
  userProfile: '++id, name, age, gender, experienceLevel, primaryGoal, equipment, trainingDays, squat1RM, bench1RM, deadlift1RM, ohp1RM, unit, onboardingComplete, createdAt',
  exercises: '++id, name, category, muscleGroup, secondaryMuscles, equipment, movementPattern, videoUrl, isCustom',
  programs: '++id, name, type, weekNumber, cycleLength, startDate, active, createdAt',
  programDays: '++id, programId, dayOfWeek, dayName, focus, exercises',
  workoutLogs: '++id, programDayId, date, startTime, endTime, duration, completed, notes, sessionRPE',
  setLogs: '++id, workoutLogId, exerciseId, exerciseName, setNumber, weight, reps, rpe, completed, timestamp, isWarmup, isPR',
  personalRecords: '++id, exerciseId, exerciseName, weight, reps, estimated1RM, date',
  nutritionLogs: '++id, date, calories, protein, carbs, fat, notes',
});

// Seed exercise library on first load
export async function seedExercises() {
  const count = await db.table('exercises').count();
  if (count > 0) return;

  const exercises = [
    // COMPOUND — SQUAT PATTERN
    { name: 'Barbell Back Squat', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Glutes, Hamstrings, Core', equipment: 'Barbell', movementPattern: 'Squat', videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8', isCustom: false },
    { name: 'Front Squat', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Core, Upper Back', equipment: 'Barbell', movementPattern: 'Squat', videoUrl: 'https://www.youtube.com/watch?v=m4ytaCJZpl0', isCustom: false },
    { name: 'Pause Squat', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Glutes, Core', equipment: 'Barbell', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Box Squat', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Glutes, Hamstrings', equipment: 'Barbell', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Goblet Squat', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Glutes, Core', equipment: 'Dumbbell', movementPattern: 'Squat', videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4', isCustom: false },
    { name: 'Bulgarian Split Squat', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Glutes', equipment: 'Dumbbell', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Leg Press', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Glutes', equipment: 'Machine', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Hack Squat', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Glutes', equipment: 'Machine', movementPattern: 'Squat', videoUrl: '', isCustom: false },

    // COMPOUND — BENCH / PUSH
    { name: 'Barbell Bench Press', category: 'Compound', muscleGroup: 'Chest', secondaryMuscles: 'Triceps, Front Delts', equipment: 'Barbell', movementPattern: 'Push', videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg', isCustom: false },
    { name: 'Close Grip Bench Press', category: 'Compound', muscleGroup: 'Triceps', secondaryMuscles: 'Chest', equipment: 'Barbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Incline Bench Press', category: 'Compound', muscleGroup: 'Upper Chest', secondaryMuscles: 'Triceps, Front Delts', equipment: 'Barbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Pause Bench Press', category: 'Compound', muscleGroup: 'Chest', secondaryMuscles: 'Triceps', equipment: 'Barbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Dumbbell Bench Press', category: 'Compound', muscleGroup: 'Chest', secondaryMuscles: 'Triceps', equipment: 'Dumbbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Incline Dumbbell Press', category: 'Compound', muscleGroup: 'Upper Chest', secondaryMuscles: 'Triceps, Front Delts', equipment: 'Dumbbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Overhead Press (OHP)', category: 'Compound', muscleGroup: 'Shoulders', secondaryMuscles: 'Triceps, Core', equipment: 'Barbell', movementPattern: 'Push', videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', isCustom: false },
    { name: 'Seated Dumbbell Press', category: 'Compound', muscleGroup: 'Shoulders', secondaryMuscles: 'Triceps', equipment: 'Dumbbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Push Press', category: 'Compound', muscleGroup: 'Shoulders', secondaryMuscles: 'Triceps, Core, Legs', equipment: 'Barbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Dips', category: 'Compound', muscleGroup: 'Chest', secondaryMuscles: 'Triceps, Front Delts', equipment: 'Bodyweight', movementPattern: 'Push', videoUrl: '', isCustom: false },

    // COMPOUND — DEADLIFT / HINGE
    { name: 'Conventional Deadlift', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Hamstrings, Glutes, Core', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q', isCustom: false },
    { name: 'Sumo Deadlift', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Glutes, Quads', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Romanian Deadlift (RDL)', category: 'Compound', muscleGroup: 'Hamstrings', secondaryMuscles: 'Glutes, Lower Back', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Deficit Deadlift', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Hamstrings, Glutes', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Trap Bar Deadlift', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Quads, Glutes', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Dumbbell RDL', category: 'Compound', muscleGroup: 'Hamstrings', secondaryMuscles: 'Glutes', equipment: 'Dumbbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Good Mornings', category: 'Compound', muscleGroup: 'Hamstrings', secondaryMuscles: 'Lower Back, Glutes', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Hip Thrust', category: 'Compound', muscleGroup: 'Glutes', secondaryMuscles: 'Hamstrings', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },

    // COMPOUND — PULL
    { name: 'Barbell Row', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Biceps, Rear Delts', equipment: 'Barbell', movementPattern: 'Pull', videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', isCustom: false },
    { name: 'Pendlay Row', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Biceps', equipment: 'Barbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Pull-ups', category: 'Compound', muscleGroup: 'Lats', secondaryMuscles: 'Biceps, Core', equipment: 'Bodyweight', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Chin-ups', category: 'Compound', muscleGroup: 'Lats', secondaryMuscles: 'Biceps', equipment: 'Bodyweight', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Dumbbell Row', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Biceps', equipment: 'Dumbbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Cable Row', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Biceps', equipment: 'Cable', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'T-Bar Row', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Biceps, Rear Delts', equipment: 'Barbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Lat Pulldown', category: 'Compound', muscleGroup: 'Lats', secondaryMuscles: 'Biceps', equipment: 'Cable', movementPattern: 'Pull', videoUrl: '', isCustom: false },

    // ISOLATION — ARMS
    { name: 'Barbell Curl', category: 'Isolation', muscleGroup: 'Biceps', secondaryMuscles: '', equipment: 'Barbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Dumbbell Curl', category: 'Isolation', muscleGroup: 'Biceps', secondaryMuscles: '', equipment: 'Dumbbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Hammer Curl', category: 'Isolation', muscleGroup: 'Biceps', secondaryMuscles: 'Forearms', equipment: 'Dumbbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Preacher Curl', category: 'Isolation', muscleGroup: 'Biceps', secondaryMuscles: '', equipment: 'Barbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Cable Curl', category: 'Isolation', muscleGroup: 'Biceps', secondaryMuscles: '', equipment: 'Cable', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Tricep Pushdown', category: 'Isolation', muscleGroup: 'Triceps', secondaryMuscles: '', equipment: 'Cable', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Overhead Tricep Extension', category: 'Isolation', muscleGroup: 'Triceps', secondaryMuscles: '', equipment: 'Cable', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Skull Crushers', category: 'Isolation', muscleGroup: 'Triceps', secondaryMuscles: '', equipment: 'Barbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Wrist Curls', category: 'Isolation', muscleGroup: 'Forearms', secondaryMuscles: '', equipment: 'Dumbbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },

    // ISOLATION — SHOULDERS
    { name: 'Lateral Raise', category: 'Isolation', muscleGroup: 'Shoulders', secondaryMuscles: '', equipment: 'Dumbbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Face Pull', category: 'Isolation', muscleGroup: 'Rear Delts', secondaryMuscles: 'Rotator Cuff', equipment: 'Cable', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Rear Delt Fly', category: 'Isolation', muscleGroup: 'Rear Delts', secondaryMuscles: '', equipment: 'Dumbbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Front Raise', category: 'Isolation', muscleGroup: 'Front Delts', secondaryMuscles: '', equipment: 'Dumbbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Cable Lateral Raise', category: 'Isolation', muscleGroup: 'Shoulders', secondaryMuscles: '', equipment: 'Cable', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Upright Row', category: 'Isolation', muscleGroup: 'Shoulders', secondaryMuscles: 'Traps', equipment: 'Barbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },

    // ISOLATION — CHEST
    { name: 'Cable Fly', category: 'Isolation', muscleGroup: 'Chest', secondaryMuscles: '', equipment: 'Cable', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Dumbbell Fly', category: 'Isolation', muscleGroup: 'Chest', secondaryMuscles: '', equipment: 'Dumbbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Pec Deck', category: 'Isolation', muscleGroup: 'Chest', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Push', videoUrl: '', isCustom: false },

    // ISOLATION — LEGS
    { name: 'Leg Extension', category: 'Isolation', muscleGroup: 'Quads', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Leg Curl', category: 'Isolation', muscleGroup: 'Hamstrings', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Calf Raise', category: 'Isolation', muscleGroup: 'Calves', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Seated Calf Raise', category: 'Isolation', muscleGroup: 'Calves', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Adductor Machine', category: 'Isolation', muscleGroup: 'Adductors', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Abductor Machine', category: 'Isolation', muscleGroup: 'Abductors', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Glute Kickback', category: 'Isolation', muscleGroup: 'Glutes', secondaryMuscles: '', equipment: 'Cable', movementPattern: 'Hinge', videoUrl: '', isCustom: false },

    // CORE
    { name: 'Plank', category: 'Core', muscleGroup: 'Core', secondaryMuscles: '', equipment: 'Bodyweight', movementPattern: 'Core', videoUrl: '', isCustom: false },
    { name: 'Ab Wheel Rollout', category: 'Core', muscleGroup: 'Core', secondaryMuscles: '', equipment: 'Bodyweight', movementPattern: 'Core', videoUrl: '', isCustom: false },
    { name: 'Hanging Leg Raise', category: 'Core', muscleGroup: 'Core', secondaryMuscles: 'Hip Flexors', equipment: 'Bodyweight', movementPattern: 'Core', videoUrl: '', isCustom: false },
    { name: 'Cable Crunch', category: 'Core', muscleGroup: 'Core', secondaryMuscles: '', equipment: 'Cable', movementPattern: 'Core', videoUrl: '', isCustom: false },
    { name: 'Russian Twist', category: 'Core', muscleGroup: 'Core', secondaryMuscles: 'Obliques', equipment: 'Bodyweight', movementPattern: 'Core', videoUrl: '', isCustom: false },
    { name: 'Dead Bug', category: 'Core', muscleGroup: 'Core', secondaryMuscles: '', equipment: 'Bodyweight', movementPattern: 'Core', videoUrl: '', isCustom: false },

    // BACK — ISOLATION
    { name: 'Shrugs', category: 'Isolation', muscleGroup: 'Traps', secondaryMuscles: '', equipment: 'Barbell', movementPattern: 'Pull', videoUrl: '', isCustom: false },
    { name: 'Hyperextension', category: 'Isolation', muscleGroup: 'Lower Back', secondaryMuscles: 'Glutes', equipment: 'Bodyweight', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Straight Arm Pulldown', category: 'Isolation', muscleGroup: 'Lats', secondaryMuscles: '', equipment: 'Cable', movementPattern: 'Pull', videoUrl: '', isCustom: false },

    // CARDIO
    { name: 'Treadmill Walk', category: 'Cardio', muscleGroup: 'Cardio', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Cardio', videoUrl: '', isCustom: false },
    { name: 'Incline Treadmill Walk', category: 'Cardio', muscleGroup: 'Cardio', secondaryMuscles: 'Glutes, Calves', equipment: 'Machine', movementPattern: 'Cardio', videoUrl: '', isCustom: false },
    { name: 'Stationary Bike', category: 'Cardio', muscleGroup: 'Cardio', secondaryMuscles: '', equipment: 'Machine', movementPattern: 'Cardio', videoUrl: '', isCustom: false },
    { name: 'Rowing Machine', category: 'Cardio', muscleGroup: 'Cardio', secondaryMuscles: 'Back, Legs', equipment: 'Machine', movementPattern: 'Cardio', videoUrl: '', isCustom: false },

    // OLYMPIC / POWER
    { name: 'Power Clean', category: 'Compound', muscleGroup: 'Full Body', secondaryMuscles: '', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Snatch Grip Deadlift', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Traps, Hamstrings', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Block Pull', category: 'Compound', muscleGroup: 'Back', secondaryMuscles: 'Glutes', equipment: 'Barbell', movementPattern: 'Hinge', videoUrl: '', isCustom: false },
    { name: 'Floor Press', category: 'Compound', muscleGroup: 'Chest', secondaryMuscles: 'Triceps', equipment: 'Barbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Board Press', category: 'Compound', muscleGroup: 'Chest', secondaryMuscles: 'Triceps', equipment: 'Barbell', movementPattern: 'Push', videoUrl: '', isCustom: false },
    { name: 'Pin Squat', category: 'Compound', muscleGroup: 'Quads', secondaryMuscles: 'Glutes', equipment: 'Barbell', movementPattern: 'Squat', videoUrl: '', isCustom: false },
    { name: 'Farmers Walk', category: 'Compound', muscleGroup: 'Full Body', secondaryMuscles: 'Grip, Core', equipment: 'Dumbbell', movementPattern: 'Carry', videoUrl: '', isCustom: false },
  ];

  await db.table('exercises').bulkAdd(exercises);
}

export default db;
