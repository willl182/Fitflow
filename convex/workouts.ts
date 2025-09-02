import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workouts").collect();
  },
});

export const getById = query({
  args: { id: v.id("workouts") },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.id);
    if (!workout) return null;

    // Get exercise details for each exercise in the workout
    const exerciseDetails = [];
    for (const workoutExercise of workout.exercises) {
      const exercise = await ctx.db.get(workoutExercise.exerciseId);
      if (exercise) {
        exerciseDetails.push({
          ...exercise,
          reps: workoutExercise.reps,
          duration: workoutExercise.duration,
          sets: workoutExercise.sets,
        });
      }
    }

    return {
      ...workout,
      exerciseDetails,
    };
  },
});

export const getByCategory = query({
  args: { category: v.union(v.literal("strength"), v.literal("cardio"), v.literal("hiit"), v.literal("flexibility")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workouts")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    estimatedDuration: v.number(),
    exercises: v.array(v.object({
      exerciseId: v.id("exercises"),
      reps: v.optional(v.number()),
      duration: v.optional(v.number()),
      sets: v.optional(v.number()),
    })),
    category: v.union(v.literal("strength"), v.literal("cardio"), v.literal("hiit"), v.literal("flexibility")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workouts", args);
  },
});
