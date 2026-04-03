// GymPro Trainer — Sample Data for Testing
import db from '../db/database';

export async function loadSampleData() {
  const workoutCount = await db.table('workoutLogs').count();
  if (workoutCount > 0) return; // Already has data

  // Sample workout logs for past 4 weeks
  const now = new Date();
  const logs = [];
  const setData = [];

  const exercises = [
    { name: 'Barbell Back Squat', baseWeight: 100 },
    { name: 'Barbell Bench Press', baseWeight: 70 },
    { name: 'Conventional Deadlift', baseWeight: 130 },
    { name: 'Overhead Press (OHP)', baseWeight: 45 },
  ];

  for (let week = 3; week >= 0; week--) {
    for (let day = 0; day < 4; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (week * 7) - (day * 2));
      
      const workoutDate = date.toISOString().split('T')[0];
      const startTime = new Date(date);
      startTime.setHours(7, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 75 + Math.floor(Math.random() * 30));

      const logId = logs.length + 1;
      logs.push({
        date: workoutDate,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: Math.floor((endTime - startTime) / 1000),
        completed: true,
        notes: '',
        sessionRPE: 7 + Math.floor(Math.random() * 2),
      });

      // Main lift for this day
      const mainLift = exercises[day % exercises.length];
      const weeklyIncrease = mainLift.name.includes('Squat') || mainLift.name.includes('Dead') ? 5 : 2.5;
      const weight = mainLift.baseWeight + ((3 - week) * weeklyIncrease);
      
      // Main lift sets
      for (let s = 1; s <= 5; s++) {
        setData.push({
          workoutLogId: logId,
          exerciseName: mainLift.name,
          setNumber: s,
          weight: weight,
          reps: s <= 3 ? 5 : (5 - Math.floor(Math.random() * 2)),
          rpe: 7 + (s > 3 ? 1 : 0),
          completed: true,
          timestamp: new Date(startTime.getTime() + s * 180000).toISOString(),
          isWarmup: false,
          isPR: week === 0 && s === 1,
        });
      }

      // Accessories
      const accessories = [
        { name: 'Barbell Row', weight: 60, reps: 8, sets: 4 },
        { name: 'Lat Pulldown', weight: 50, reps: 10, sets: 3 },
        { name: 'Face Pull', weight: 20, reps: 15, sets: 3 },
        { name: 'Dumbbell Curl', weight: 12, reps: 12, sets: 3 },
      ];

      const dayAccessories = accessories.slice(day % 2, day % 2 + 2);
      let setNum = 6;
      for (const acc of dayAccessories) {
        for (let s = 0; s < acc.sets; s++) {
          setData.push({
            workoutLogId: logId,
            exerciseName: acc.name,
            setNumber: setNum++,
            weight: acc.weight,
            reps: acc.reps,
            rpe: 7,
            completed: true,
            timestamp: new Date(startTime.getTime() + setNum * 120000).toISOString(),
            isWarmup: false,
            isPR: false,
          });
        }
      }
    }
  }

  // Bulk insert
  await db.table('workoutLogs').bulkAdd(logs);
  await db.table('setLogs').bulkAdd(setData);

  // Add PRs
  const prs = [
    { exerciseName: 'Barbell Back Squat', weight: 115, reps: 1, estimated1RM: 115, date: new Date().toISOString().split('T')[0] },
    { exerciseName: 'Barbell Bench Press', weight: 80, reps: 1, estimated1RM: 80, date: new Date().toISOString().split('T')[0] },
    { exerciseName: 'Conventional Deadlift', weight: 145, reps: 1, estimated1RM: 145, date: new Date().toISOString().split('T')[0] },
    { exerciseName: 'Overhead Press (OHP)', weight: 52.5, reps: 1, estimated1RM: 52.5, date: new Date().toISOString().split('T')[0] },
    { exerciseName: 'Barbell Back Squat', weight: 100, reps: 5, estimated1RM: 117, date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] },
    { exerciseName: 'Barbell Bench Press', weight: 72.5, reps: 3, estimated1RM: 80, date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0] },
  ];
  await db.table('personalRecords').bulkAdd(prs);

  // Add nutrition logs
  const nutritionLogs = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    nutritionLogs.push({
      date: d.toISOString().split('T')[0],
      calories: 2400 + Math.floor(Math.random() * 400),
      protein: 150 + Math.floor(Math.random() * 30),
      carbs: 250 + Math.floor(Math.random() * 50),
      fat: 70 + Math.floor(Math.random() * 20),
      notes: '',
    });
  }
  await db.table('nutritionLogs').bulkAdd(nutritionLogs);
}
