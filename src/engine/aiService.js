const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * 🔹 Core Gemini API Call
 * Strictly follows requirements for deployment and error handling.
 */
export async function callGemini(prompt) {
  try {
    console.log("API KEY:", import.meta.env.VITE_API_KEY);
    
    if (!API_KEY) {
      throw new Error("API_KEY_MISSING");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    console.log("API RESPONSE STATUS:", response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API ERROR BODY:", errorBody);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error("No output from AI");
    }

    return textOutput;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}

/**
 * 🔹 UI Compatibility Helpers
 */
export function getApiKey() {
  return API_KEY;
}

export function setApiKey() {
  // Key is managed via environment variables for security.
}

/**
 * 🔹 Helper to safely parse JSON from AI response
 */
function parseJsonResponse(text) {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return JSON.parse(cleanText.trim());
  } catch (error) {
    console.error("Failed to parse AI JSON response:", text, error);
    throw new Error("AI returned invalid data format. Please try again.");
  }
}

/**
 * 🔹 Function 1: Analyze Nutrition
 */
export async function analyzeNutrition(foodText) {
  if (!API_KEY) throw new Error("API_KEY_MISSING");

  const prompt = `You are a nutrition expert. 
Analyze the following food description and estimate the total macro nutrients (calories, protein, carbs, fat).
User says: "${foodText}"

Respond ONLY with a valid JSON object in this exact format, with numbers only, no units:
{
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0
}`;

  try {
    const textOutput = await callGemini(prompt);
    return parseJsonResponse(textOutput);
  } catch (error) {
    if (error.message === "API_KEY_MISSING") throw error;
    throw new Error("Failed to analyze nutrition. Check your connection.");
  }
}

/**
 * 🔹 Function 2: Generate Personalized Workout Program
 */
export async function generatePersonalizedProgram(profile) {
  if (!API_KEY) throw new Error("API_KEY_MISSING");

  const {
    name,
    age,
    gender,
    experienceLevel,
    primaryGoal,
    trainingDays,
    squat1RM,
    bench1RM,
    deadlift1RM,
    ohp1RM,
    equipment,
  } = profile;

  const prompt = `You are an elite powerlifting and strength coach.
Create a highly personalized 4-week training program for this user:
Name: ${name || "Lifter"}
Age: ${age || 25}
Gender: ${gender || "Not specified"}
Experience Level: ${experienceLevel || "Intermediate"}
Primary Goal: ${primaryGoal || "Strength"}
Training Days per Week: ${trainingDays || 4}
Equipment Available: ${equipment || "Full Gym"}

Current 1-Rep Maxes (kg):
Squat: ${squat1RM || 100}
Bench: ${bench1RM || 60}
Deadlift: ${deadlift1RM || 120}
Overhead Press: ${ohp1RM || 40}

Generate exactly ${trainingDays || 4} unique workout days that will be repeated over a 4-week cycle. 
Respond ONLY with a valid JSON object matching this strict schema:

{
  "name": "Program Name",
  "type": "ai_custom",
  "cycleLength": 4,
  "days": [
    {
      "dayOfWeek": 1,
      "dayName": "e.g., Heavy Lower",
      "focus": "e.g., Squat/Quads",
      "exercises": [
        {
          "name": "Barbell Back Squat",
          "sets": 4,
          "reps": "5",
          "intensity": "work",
          "notes": "RPE 8",
          "prescribedWeight": 85
        }
      ]
    }
  ]
}

Ensure the JSON is perfectly formatted without any markdown wrappers.`;

  try {
    const textOutput = await callGemini(prompt);
    const parsedProgram = parseJsonResponse(textOutput);

    if (!parsedProgram || !parsedProgram.days || !Array.isArray(parsedProgram.days)) {
      throw new Error("Invalid program structure from AI");
    }

    const program = {
      name: parsedProgram.name || "AI Custom Program",
      type: parsedProgram.type || "ai_custom",
      weekNumber: 1,
      cycleLength: parsedProgram.cycleLength || 4,
      startDate: new Date().toISOString(),
      active: 1,
      createdAt: new Date().toISOString(),
    };

    const programDays = parsedProgram.days.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      dayName: day.dayName,
      focus: day.focus,
      exercises: JSON.stringify(day.exercises),
    }));

    return { program, programDays };
  } catch (error) {
    if (error.message === "API_KEY_MISSING") throw error;
    throw new Error("Failed to generate program. Ensure key has quota/access.");
  }
}