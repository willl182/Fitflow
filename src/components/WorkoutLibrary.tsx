import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface WorkoutLibraryProps {
  onStartWorkout: (workoutId: string) => void;
}

export function WorkoutLibrary({ onStartWorkout }: WorkoutLibraryProps) {
  const workouts = useQuery(api.workouts.list);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (workouts === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categories = ["all", "strength", "cardio", "hiit", "flexibility"];
  const filteredWorkouts = selectedCategory === "all" 
    ? workouts 
    : workouts.filter(w => w.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength": return "💪";
      case "cardio": return "❤️";
      case "hiit": return "🔥";
      case "flexibility": return "🧘";
      default: return "🏃";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Workout Library</h1>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Workouts Grid */}
      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🏋️</div>
          <p className="text-gray-600 text-lg">No workouts available yet.</p>
          <p className="text-gray-500">Click "Load Sample Workouts" on the Dashboard to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout) => (
            <div key={workout._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(workout.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
                      <p className="text-sm text-gray-600">{workout.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                    {workout.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{workout.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {workout.estimatedDuration} min</span>
                  <span>🏃 {workout.exercises.length} exercises</span>
                </div>
                
                <button
                  onClick={() => onStartWorkout(workout._id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Workout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
