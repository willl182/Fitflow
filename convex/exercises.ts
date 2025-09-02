import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exercises").collect();
  },
});

export const getById = query({
  args: { id: v.id("exercises") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("exercises")) },
  handler: async (ctx, args) => {
    const exercises = [];
    for (const id of args.ids) {
      const exercise = await ctx.db.get(id);
      if (exercise) {
        exercises.push(exercise);
      }
    }
    return exercises;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    instructions: v.array(v.string()),
    muscleGroups: v.array(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    equipment: v.union(v.literal("none"), v.literal("pullup_bar"), v.literal("mat")),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("exercises", args);
  },
});
