import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  exercises: defineTable({
    name: v.string(),
    description: v.string(),
    instructions: v.array(v.string()),
    muscleGroups: v.array(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    equipment: v.union(v.literal("none"), v.literal("pullup_bar"), v.literal("mat")),
    imageUrl: v.optional(v.string()),
  }),

  workouts: defineTable({
    name: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    estimatedDuration: v.number(), // in minutes
    exercises: v.array(v.object({
      exerciseId: v.id("exercises"),
      reps: v.optional(v.number()),
      duration: v.optional(v.number()), // in seconds
      sets: v.optional(v.number()),
    })),
    category: v.union(
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("hiit"),
      v.literal("flexibility")
    ),
  }),

  workoutSessions: defineTable({
    userId: v.id("users"),
    workoutId: v.id("workouts"),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    completed: v.boolean(),
    exerciseResults: v.array(v.object({
      exerciseId: v.id("exercises"),
      repsCompleted: v.optional(v.number()),
      durationCompleted: v.optional(v.number()),
      setsCompleted: v.optional(v.number()),
    })),
  }).index("by_user", ["userId"]).index("by_user_and_workout", ["userId", "workoutId"]),

  userStats: defineTable({
    userId: v.id("users"),
    totalWorkouts: v.number(),
    totalMinutes: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastWorkoutDate: v.optional(v.number()),
    favoriteCategory: v.optional(v.string()),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
