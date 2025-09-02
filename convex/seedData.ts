import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedExercises = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if exercises already exist
    const existingExercises = await ctx.db.query("exercises").take(1);
    if (existingExercises.length > 0) {
      return { message: "Exercises already seeded" };
    }

    const exercises = [
      {
        name: "Push-ups",
        description: "Classic upper body exercise targeting chest, shoulders, and triceps",
        instructions: [
          "Start in plank position with hands shoulder-width apart",
          "Lower your body until chest nearly touches the floor",
          "Push back up to starting position",
          "Keep your body in a straight line throughout"
        ],
        muscleGroups: ["chest", "shoulders", "triceps", "core"],
        difficulty: "beginner" as const,
        equipment: "none" as const,
      },
      {
        name: "Squats",
        description: "Fundamental lower body exercise for legs and glutes",
        instructions: [
          "Stand with feet shoulder-width apart",
          "Lower your body as if sitting back into a chair",
          "Keep your chest up and knees behind toes",
          "Return to standing position"
        ],
        muscleGroups: ["quadriceps", "glutes", "hamstrings"],
        difficulty: "beginner" as const,
        equipment: "none" as const,
      },
      {
        name: "Burpees",
        description: "Full-body explosive exercise combining squat, plank, and jump",
        instructions: [
          "Start standing, then squat down and place hands on floor",
          "Jump feet back into plank position",
          "Do a push-up (optional)",
          "Jump feet back to squat position",
          "Jump up with arms overhead"
        ],
        muscleGroups: ["full body", "cardio"],
        difficulty: "intermediate" as const,
        equipment: "none" as const,
      },
      {
        name: "Mountain Climbers",
        description: "Dynamic cardio exercise that targets core and improves agility",
        instructions: [
          "Start in plank position",
          "Bring right knee toward chest",
          "Quickly switch legs, bringing left knee toward chest",
          "Continue alternating legs rapidly"
        ],
        muscleGroups: ["core", "shoulders", "cardio"],
        difficulty: "intermediate" as const,
        equipment: "none" as const,
      },
      {
        name: "Pull-ups",
        description: "Upper body pulling exercise for back and biceps",
        instructions: [
          "Hang from pull-up bar with palms facing away",
          "Pull your body up until chin clears the bar",
          "Lower yourself back down with control",
          "Keep core engaged throughout"
        ],
        muscleGroups: ["back", "biceps", "shoulders"],
        difficulty: "advanced" as const,
        equipment: "pullup_bar" as const,
      },
      {
        name: "Plank",
        description: "Isometric core strengthening exercise",
        instructions: [
          "Start in push-up position",
          "Lower to forearms, keeping body straight",
          "Hold position, engaging core muscles",
          "Breathe normally while maintaining form"
        ],
        muscleGroups: ["core", "shoulders"],
        difficulty: "beginner" as const,
        equipment: "mat" as const,
      },
      {
        name: "Jumping Jacks",
        description: "Classic cardio exercise for full-body warm-up",
        instructions: [
          "Start standing with feet together, arms at sides",
          "Jump feet apart while raising arms overhead",
          "Jump back to starting position",
          "Maintain steady rhythm"
        ],
        muscleGroups: ["cardio", "legs", "shoulders"],
        difficulty: "beginner" as const,
        equipment: "none" as const,
      },
      {
        name: "Lunges",
        description: "Single-leg exercise for lower body strength and balance",
        instructions: [
          "Step forward with one leg",
          "Lower hips until both knees are at 90 degrees",
          "Push back to starting position",
          "Alternate legs or complete all reps on one side"
        ],
        muscleGroups: ["quadriceps", "glutes", "hamstrings"],
        difficulty: "beginner" as const,
        equipment: "none" as const,
      }
    ];

    const exerciseIds = [];
    for (const exercise of exercises) {
      const id = await ctx.db.insert("exercises", exercise);
      exerciseIds.push(id);
    }

    return { message: "Exercises seeded successfully", exerciseIds };
  },
});

export const seedWorkouts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if workouts already exist
    const existingWorkouts = await ctx.db.query("workouts").take(1);
    if (existingWorkouts.length > 0) {
      return { message: "Workouts already seeded" };
    }

    // Get exercise IDs (assuming exercises are already seeded)
    const exercises = await ctx.db.query("exercises").collect();
    const exerciseMap = exercises.reduce((map, ex) => {
      map[ex.name] = ex._id;
      return map;
    }, {} as Record<string, any>);

    const workouts = [
      {
        name: "Beginner Full Body",
        description: "Perfect starter workout for building foundational strength",
        difficulty: "beginner" as const,
        estimatedDuration: 20,
        category: "strength" as const,
        exercises: [
          { exerciseId: exerciseMap["Push-ups"], reps: 10, sets: 3 },
          { exerciseId: exerciseMap["Squats"], reps: 15, sets: 3 },
          { exerciseId: exerciseMap["Plank"], duration: 30, sets: 3 },
          { exerciseId: exerciseMap["Lunges"], reps: 10, sets: 2 },
        ],
      },
      {
        name: "HIIT Cardio Blast",
        description: "High-intensity interval training for maximum calorie burn",
        difficulty: "intermediate" as const,
        estimatedDuration: 15,
        category: "hiit" as const,
        exercises: [
          { exerciseId: exerciseMap["Burpees"], reps: 10, sets: 4 },
          { exerciseId: exerciseMap["Mountain Climbers"], duration: 30, sets: 4 },
          { exerciseId: exerciseMap["Jumping Jacks"], duration: 45, sets: 3 },
          { exerciseId: exerciseMap["Squats"], reps: 20, sets: 3 },
        ],
      },
      {
        name: "Upper Body Power",
        description: "Intense upper body workout for advanced athletes",
        difficulty: "advanced" as const,
        estimatedDuration: 25,
        category: "strength" as const,
        exercises: [
          { exerciseId: exerciseMap["Pull-ups"], reps: 8, sets: 4 },
          { exerciseId: exerciseMap["Push-ups"], reps: 20, sets: 4 },
          { exerciseId: exerciseMap["Mountain Climbers"], duration: 45, sets: 3 },
          { exerciseId: exerciseMap["Plank"], duration: 60, sets: 3 },
        ],
      },
      {
        name: "Quick Cardio",
        description: "Fast-paced cardio session to get your heart pumping",
        difficulty: "beginner" as const,
        estimatedDuration: 10,
        category: "cardio" as const,
        exercises: [
          { exerciseId: exerciseMap["Jumping Jacks"], duration: 60, sets: 3 },
          { exerciseId: exerciseMap["Mountain Climbers"], duration: 30, sets: 3 },
          { exerciseId: exerciseMap["Burpees"], reps: 5, sets: 3 },
        ],
      },
    ];

    const workoutIds = [];
    for (const workout of workouts) {
      const id = await ctx.db.insert("workouts", workout);
      workoutIds.push(id);
    }

    return { message: "Workouts seeded successfully", workoutIds };
  },
});
