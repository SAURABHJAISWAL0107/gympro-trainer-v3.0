// GymPro Trainer — Program Generator Engine
// Generates adaptive weekly training programs based on user profile

const PROGRAMS = {
  // === BEGINNER: Linear Progression (LP) ===
  beginner: {
    3: { // 3 days/week
      name: 'Starting Strength LP',
      type: 'linear',
      cycleLength: 4,
      days: [
        {
          dayOfWeek: 1, dayName: 'Day A — Full Body',
          focus: 'Full Body',
          exercises: [
            { name: 'Barbell Back Squat', sets: 5, reps: 5, intensity: 'work', notes: '+2.5kg each session' },
            { name: 'Barbell Bench Press', sets: 5, reps: 5, intensity: 'work', notes: '+2.5kg each session' },
            { name: 'Barbell Row', sets: 5, reps: 5, intensity: 'work', notes: '+2.5kg each session' },
            { name: 'Face Pull', sets: 3, reps: 15, intensity: 'light', notes: 'Shoulder health' },
          ]
        },
        {
          dayOfWeek: 3, dayName: 'Day B — Full Body',
          focus: 'Full Body',
          exercises: [
            { name: 'Barbell Back Squat', sets: 5, reps: 5, intensity: 'work', notes: '+2.5kg each session' },
            { name: 'Overhead Press (OHP)', sets: 5, reps: 5, intensity: 'work', notes: '+2.5kg each session' },
            { name: 'Conventional Deadlift', sets: 3, reps: 5, intensity: 'work', notes: '+5kg each session' },
            { name: 'Dumbbell Curl', sets: 3, reps: 10, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 5, dayName: 'Day A — Full Body',
          focus: 'Full Body',
          exercises: [
            { name: 'Barbell Back Squat', sets: 5, reps: 5, intensity: 'work', notes: '+2.5kg each session' },
            { name: 'Barbell Bench Press', sets: 5, reps: 5, intensity: 'work', notes: '+2.5kg each session' },
            { name: 'Barbell Row', sets: 5, reps: 5, intensity: 'work', notes: '+2.5kg each session' },
            { name: 'Tricep Pushdown', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
      ]
    },
    4: {
      name: 'Beginner Upper/Lower',
      type: 'linear',
      cycleLength: 4,
      days: [
        {
          dayOfWeek: 1, dayName: 'Upper A — Strength',
          focus: 'Upper Body',
          exercises: [
            { name: 'Barbell Bench Press', sets: 4, reps: 5, intensity: 'work', notes: '+2.5kg/week' },
            { name: 'Barbell Row', sets: 4, reps: 5, intensity: 'work', notes: '+2.5kg/week' },
            { name: 'Overhead Press (OHP)', sets: 3, reps: 8, intensity: 'moderate', notes: '' },
            { name: 'Lat Pulldown', sets: 3, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Face Pull', sets: 3, reps: 15, intensity: 'light', notes: '' },
            { name: 'Dumbbell Curl', sets: 2, reps: 12, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 2, dayName: 'Lower A — Strength',
          focus: 'Lower Body',
          exercises: [
            { name: 'Barbell Back Squat', sets: 4, reps: 5, intensity: 'work', notes: '+5kg/week' },
            { name: 'Romanian Deadlift (RDL)', sets: 3, reps: 8, intensity: 'moderate', notes: '' },
            { name: 'Leg Press', sets: 3, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Leg Curl', sets: 3, reps: 12, intensity: 'moderate', notes: '' },
            { name: 'Calf Raise', sets: 4, reps: 15, intensity: 'light', notes: '' },
            { name: 'Plank', sets: 3, reps: 1, intensity: 'light', notes: '45s holds' },
          ]
        },
        {
          dayOfWeek: 4, dayName: 'Upper B — Volume',
          focus: 'Upper Body',
          exercises: [
            { name: 'Incline Bench Press', sets: 3, reps: 8, intensity: 'moderate', notes: '' },
            { name: 'Dumbbell Row', sets: 3, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Seated Dumbbell Press', sets: 3, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Cable Fly', sets: 3, reps: 12, intensity: 'light', notes: '' },
            { name: 'Lateral Raise', sets: 3, reps: 15, intensity: 'light', notes: '' },
            { name: 'Tricep Pushdown', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 5, dayName: 'Lower B — Volume',
          focus: 'Lower Body',
          exercises: [
            { name: 'Conventional Deadlift', sets: 3, reps: 5, intensity: 'work', notes: '+5kg/week' },
            { name: 'Front Squat', sets: 3, reps: 8, intensity: 'moderate', notes: '' },
            { name: 'Bulgarian Split Squat', sets: 3, reps: 10, intensity: 'moderate', notes: 'each leg' },
            { name: 'Leg Extension', sets: 3, reps: 12, intensity: 'moderate', notes: '' },
            { name: 'Leg Curl', sets: 3, reps: 12, intensity: 'moderate', notes: '' },
            { name: 'Hanging Leg Raise', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
      ]
    },
    5: null, // fallback to 4-day
    6: null,
  },

  // === INTERMEDIATE: 5/3/1 Based ===
  intermediate: {
    3: {
      name: '5/3/1 Full Body',
      type: '531',
      cycleLength: 4,
      days: [
        {
          dayOfWeek: 1, dayName: 'Squat Focus',
          focus: 'Squat',
          exercises: [
            { name: 'Barbell Back Squat', sets: 3, reps: '5/3/1', intensity: '531', notes: '5/3/1 progression' },
            { name: 'Barbell Back Squat', sets: 5, reps: 5, intensity: 'fsl', notes: 'FSL 5x5 @ first set weight' },
            { name: 'Barbell Bench Press', sets: 3, reps: 10, intensity: 'light', notes: '60% 1RM' },
            { name: 'Barbell Row', sets: 4, reps: 8, intensity: 'moderate', notes: '' },
            { name: 'Ab Wheel Rollout', sets: 3, reps: 10, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 3, dayName: 'Bench Focus',
          focus: 'Bench',
          exercises: [
            { name: 'Barbell Bench Press', sets: 3, reps: '5/3/1', intensity: '531', notes: '5/3/1 progression' },
            { name: 'Barbell Bench Press', sets: 5, reps: 5, intensity: 'fsl', notes: 'FSL 5x5' },
            { name: 'Barbell Back Squat', sets: 3, reps: 10, intensity: 'light', notes: '60% 1RM' },
            { name: 'Lat Pulldown', sets: 4, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Face Pull', sets: 3, reps: 15, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 5, dayName: 'Deadlift Focus',
          focus: 'Deadlift',
          exercises: [
            { name: 'Conventional Deadlift', sets: 3, reps: '5/3/1', intensity: '531', notes: '5/3/1 progression' },
            { name: 'Conventional Deadlift', sets: 5, reps: 5, intensity: 'fsl', notes: 'FSL 5x5' },
            { name: 'Overhead Press (OHP)', sets: 3, reps: 10, intensity: 'light', notes: '60% 1RM' },
            { name: 'Dumbbell Row', sets: 4, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Hanging Leg Raise', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
      ]
    },
    4: {
      name: '5/3/1 BBB',
      type: '531',
      cycleLength: 4,
      days: [
        {
          dayOfWeek: 1, dayName: 'Squat Day',
          focus: 'Squat',
          exercises: [
            { name: 'Barbell Back Squat', sets: 3, reps: '5/3/1', intensity: '531', notes: '5/3/1 main sets' },
            { name: 'Barbell Back Squat', sets: 5, reps: 10, intensity: 'bbb', notes: 'BBB 5x10 @ 50-60%' },
            { name: 'Leg Curl', sets: 4, reps: 12, intensity: 'moderate', notes: '' },
            { name: 'Calf Raise', sets: 4, reps: 15, intensity: 'light', notes: '' },
            { name: 'Hanging Leg Raise', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 2, dayName: 'Bench Day',
          focus: 'Bench',
          exercises: [
            { name: 'Barbell Bench Press', sets: 3, reps: '5/3/1', intensity: '531', notes: '5/3/1 main sets' },
            { name: 'Barbell Bench Press', sets: 5, reps: 10, intensity: 'bbb', notes: 'BBB 5x10 @ 50-60%' },
            { name: 'Dumbbell Row', sets: 4, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Face Pull', sets: 3, reps: 15, intensity: 'light', notes: '' },
            { name: 'Dumbbell Curl', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 4, dayName: 'Deadlift Day',
          focus: 'Deadlift',
          exercises: [
            { name: 'Conventional Deadlift', sets: 3, reps: '5/3/1', intensity: '531', notes: '5/3/1 main sets' },
            { name: 'Conventional Deadlift', sets: 5, reps: 10, intensity: 'bbb', notes: 'BBB 5x10 @ 50-60%' },
            { name: 'Good Mornings', sets: 3, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Ab Wheel Rollout', sets: 3, reps: 10, intensity: 'light', notes: '' },
            { name: 'Hyperextension', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 5, dayName: 'OHP Day',
          focus: 'Shoulders',
          exercises: [
            { name: 'Overhead Press (OHP)', sets: 3, reps: '5/3/1', intensity: '531', notes: '5/3/1 main sets' },
            { name: 'Overhead Press (OHP)', sets: 5, reps: 10, intensity: 'bbb', notes: 'BBB 5x10 @ 50-60%' },
            { name: 'Chin-ups', sets: 4, reps: 8, intensity: 'moderate', notes: '' },
            { name: 'Lateral Raise', sets: 3, reps: 15, intensity: 'light', notes: '' },
            { name: 'Tricep Pushdown', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
      ]
    },
    5: null,
    6: null,
  },

  // === ADVANCED: DUP (Daily Undulating Periodization) ===
  advanced: {
    3: null,
    4: {
      name: 'Advanced Powerlifting DUP',
      type: 'dup',
      cycleLength: 4,
      days: [
        {
          dayOfWeek: 1, dayName: 'Heavy Squat / Light Bench',
          focus: 'Squat',
          exercises: [
            { name: 'Barbell Back Squat', sets: 5, reps: 3, intensity: 'heavy', notes: 'RPE 8-9, ~85-90% 1RM' },
            { name: 'Pause Squat', sets: 3, reps: 3, intensity: 'moderate', notes: '3s pause, 75% 1RM' },
            { name: 'Barbell Bench Press', sets: 4, reps: 8, intensity: 'light', notes: 'RPE 6-7, ~70% 1RM' },
            { name: 'Barbell Row', sets: 4, reps: 6, intensity: 'moderate', notes: '' },
            { name: 'Face Pull', sets: 3, reps: 15, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 2, dayName: 'Heavy Bench / Light Dead',
          focus: 'Bench',
          exercises: [
            { name: 'Barbell Bench Press', sets: 5, reps: 3, intensity: 'heavy', notes: 'RPE 8-9' },
            { name: 'Close Grip Bench Press', sets: 3, reps: 5, intensity: 'moderate', notes: '' },
            { name: 'Conventional Deadlift', sets: 3, reps: 5, intensity: 'light', notes: 'RPE 6-7, ~70% 1RM' },
            { name: 'Lat Pulldown', sets: 4, reps: 10, intensity: 'moderate', notes: '' },
            { name: 'Dumbbell Curl', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 4, dayName: 'Heavy Dead / Moderate Squat',
          focus: 'Deadlift',
          exercises: [
            { name: 'Conventional Deadlift', sets: 4, reps: 2, intensity: 'heavy', notes: 'RPE 8-9, ~88-92% 1RM' },
            { name: 'Deficit Deadlift', sets: 3, reps: 4, intensity: 'moderate', notes: '' },
            { name: 'Front Squat', sets: 3, reps: 6, intensity: 'moderate', notes: '' },
            { name: 'Romanian Deadlift (RDL)', sets: 3, reps: 8, intensity: 'moderate', notes: '' },
            { name: 'Hanging Leg Raise', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
        {
          dayOfWeek: 5, dayName: 'Volume Upper',
          focus: 'Upper Hypertrophy',
          exercises: [
            { name: 'Incline Bench Press', sets: 4, reps: 8, intensity: 'moderate', notes: '' },
            { name: 'Overhead Press (OHP)', sets: 4, reps: 6, intensity: 'moderate', notes: '' },
            { name: 'Chin-ups', sets: 4, reps: 8, intensity: 'moderate', notes: 'Weighted if easy' },
            { name: 'Cable Row', sets: 3, reps: 12, intensity: 'moderate', notes: '' },
            { name: 'Lateral Raise', sets: 3, reps: 15, intensity: 'light', notes: '' },
            { name: 'Tricep Pushdown', sets: 3, reps: 12, intensity: 'light', notes: '' },
          ]
        },
      ]
    },
    5: null,
    6: null,
  },
};

// 5/3/1 percentage schemes by week
const FIVE_THREE_ONE = {
  week1: { label: '5s Week', sets: [{ reps: 5, pct: 0.65 }, { reps: 5, pct: 0.75 }, { reps: '5+', pct: 0.85 }] },
  week2: { label: '3s Week', sets: [{ reps: 3, pct: 0.70 }, { reps: 3, pct: 0.80 }, { reps: '3+', pct: 0.90 }] },
  week3: { label: '5/3/1 Week', sets: [{ reps: 5, pct: 0.75 }, { reps: 3, pct: 0.85 }, { reps: '1+', pct: 0.95 }] },
  week4: { label: 'Deload', sets: [{ reps: 5, pct: 0.40 }, { reps: 5, pct: 0.50 }, { reps: 5, pct: 0.60 }] },
};

// Calculate estimated 1RM using Epley formula
export function calculate1RM(weight, reps) {
  if (reps === 1) return weight;
  if (reps <= 0 || weight <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

// Round weight to nearest 2.5kg
function roundWeight(weight) {
  return Math.round(weight / 2.5) * 2.5;
}

// Generate a training program based on user profile
export function generateProgram(profile) {
  const { experienceLevel, trainingDays, primaryGoal, squat1RM, bench1RM, deadlift1RM, ohp1RM } = profile;
  
  const level = experienceLevel || 'beginner';
  const days = trainingDays || 4;
  
  // Find the matching program template
  let template = PROGRAMS[level]?.[days];
  if (!template) {
    // Fallback: try 4-day program
    template = PROGRAMS[level]?.[4] || PROGRAMS.beginner[4];
  }

  const weekNumber = 1;
  const program = {
    name: template.name,
    type: template.type,
    weekNumber,
    cycleLength: template.cycleLength,
    startDate: new Date().toISOString(),
    active: 1,
    createdAt: new Date().toISOString(),
  };

  // Compute working weights based on 1RMs
  const trainingMaxes = {
    'Barbell Back Squat': (squat1RM || 100) * 0.9,
    'Barbell Bench Press': (bench1RM || 60) * 0.9,
    'Conventional Deadlift': (deadlift1RM || 120) * 0.9,
    'Overhead Press (OHP)': (ohp1RM || 40) * 0.9,
    'Sumo Deadlift': (deadlift1RM || 120) * 0.9,
    'Pause Squat': (squat1RM || 100) * 0.9,
    'Pause Bench Press': (bench1RM || 60) * 0.9,
    'Close Grip Bench Press': (bench1RM || 60) * 0.85,
    'Incline Bench Press': (bench1RM || 60) * 0.8,
    'Front Squat': (squat1RM || 100) * 0.75,
    'Deficit Deadlift': (deadlift1RM || 120) * 0.85,
  };

  const programDays = template.days.map(day => {
    const exercises = day.exercises.map(ex => {
      let prescribedWeight = null;
      const tm = trainingMaxes[ex.name];

      if (tm) {
        if (template.type === '531' && ex.intensity === '531') {
          // 5/3/1 week 1 percentages
          const week = FIVE_THREE_ONE[`week${weekNumber}`] || FIVE_THREE_ONE.week1;
          prescribedWeight = week.sets.map(s => ({
            reps: s.reps,
            weight: roundWeight(tm * s.pct),
          }));
        } else if (ex.intensity === 'fsl') {
          prescribedWeight = roundWeight(tm * 0.65);
        } else if (ex.intensity === 'bbb') {
          prescribedWeight = roundWeight(tm * 0.55);
        } else if (ex.intensity === 'heavy') {
          prescribedWeight = roundWeight(tm * 0.88);
        } else if (ex.intensity === 'moderate') {
          prescribedWeight = roundWeight(tm * 0.75);
        } else if (ex.intensity === 'light') {
          prescribedWeight = roundWeight(tm * 0.65);
        } else if (ex.intensity === 'work' && level === 'beginner') {
          prescribedWeight = roundWeight(tm * 0.80);
        }
      }

      return {
        ...ex,
        prescribedWeight,
      };
    });

    return {
      dayOfWeek: day.dayOfWeek,
      dayName: day.dayName,
      focus: day.focus,
      exercises: JSON.stringify(exercises),
    };
  });

  return { program, programDays };
}

// Get 5/3/1 details for a given week
export function get531WeekDetails(weekNumber) {
  const weekKey = `week${((weekNumber - 1) % 4) + 1}`;
  return FIVE_THREE_ONE[weekKey];
}

// Auto-adjust program based on performance
export function suggestAdjustment(setLogs, exerciseName) {
  // Filter logs for this exercise in the last 2 weeks
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentLogs = setLogs.filter(
    s => s.exerciseName === exerciseName && new Date(s.timestamp) > twoWeeksAgo && s.completed
  );

  if (recentLogs.length === 0) return null;

  // Check if user consistently hit or exceeded target reps
  const avgRPE = recentLogs.reduce((sum, s) => sum + (s.rpe || 7), 0) / recentLogs.length;
  
  if (avgRPE < 6) return { type: 'increase', message: 'Looking easy! Consider adding 2.5kg.' };
  if (avgRPE > 9) return { type: 'deload', message: 'RPE very high. Consider a deload or reducing weight.' };
  
  return null;
}

// Motivational quotes for dashboard
export const QUOTES = [
  { text: "The iron never lies to you.", author: "Henry Rollins" },
  { text: "Strength does not come from winning.", author: "Mahatma Gandhi" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "What hurts today makes you stronger tomorrow.", author: "Jay Cutler" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { text: "No citizen has a right to be an amateur in the matter of physical training.", author: "Socrates" },
  { text: "The last three or four reps is what makes the muscle grow.", author: "Arnold Schwarzenegger" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
  { text: "Train hard or go home.", author: "Unknown" },
  { text: "The resistance that you fight physically in the gym transforms you.", author: "Kai Greene" },
  { text: "Discipline is doing what needs to be done, even when you don't want to.", author: "Unknown" },
  { text: "Squat till you puke.", author: "Mark Rippetoe" },
  { text: "There are no shortcuts. Everything is reps, reps, reps.", author: "Arnold Schwarzenegger" },
];

export function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
