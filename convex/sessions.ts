import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const startSession = mutation({
  args: {
    workoutId: v.id("workouts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("workoutSessions", {
      userId,
      workoutId: args.workoutId,
      startTime: Date.now(),
      completed: false,
      exerciseResults: [],
    });
  },
});

export const completeSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
    exerciseResults: v.array(v.object({
      exerciseId: v.id("exercises"),
      repsCompleted: v.optional(v.number()),
      durationCompleted: v.optional(v.number()),
      setsCompleted: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - session.startTime) / 1000 / 60); // minutes

    await ctx.db.patch(args.sessionId, {
      endTime,
      completed: true,
      exerciseResults: args.exerciseResults,
    });

    // Update user stats
    await updateUserStats(ctx, userId, duration);

    return { success: true };
  },
});

export const getUserSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    // Get workout details for each session
    const sessionsWithWorkouts = [];
    for (const session of sessions) {
      const workout = await ctx.db.get(session.workoutId);
      if (workout) {
        sessionsWithWorkouts.push({
          ...session,
          workout,
        });
      }
    }

    return sessionsWithWorkouts;
  },
});

async function updateUserStats(ctx: any, userId: string, workoutDuration: number) {
  const existingStats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();

  const today = new Date().toDateString();
  const lastWorkoutDate = existingStats?.lastWorkoutDate 
    ? new Date(existingStats.lastWorkoutDate).toDateString()
    : null;

  let currentStreak = 1;
  if (existingStats) {
    if (lastWorkoutDate === today) {
      // Same day workout, don't increment streak
      currentStreak = existingStats.currentStreak;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastWorkoutDate === yesterday.toDateString()) {
        // Consecutive day, increment streak
        currentStreak = existingStats.currentStreak + 1;
      }
      // If more than 1 day gap, streak resets to 1
    }
  }

  if (existingStats) {
    await ctx.db.patch(existingStats._id, {
      totalWorkouts: existingStats.totalWorkouts + 1,
      totalMinutes: existingStats.totalMinutes + workoutDuration,
      currentStreak,
      longestStreak: Math.max(existingStats.longestStreak, currentStreak),
      lastWorkoutDate: Date.now(),
    });
  } else {
    await ctx.db.insert("userStats", {
      userId,
      totalWorkouts: 1,
      totalMinutes: workoutDuration,
      currentStreak: 1,
      longestStreak: 1,
      lastWorkoutDate: Date.now(),
    });
  }
}

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("userStats")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();
  },
});
