import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function Dashboard() {
  const userStats = useQuery(api.sessions.getUserStats);
  const recentSessions = useQuery(api.sessions.getUserSessions);
  const seedExercises = useMutation(api.seedData.seedExercises);
  const seedWorkouts = useMutation(api.seedData.seedWorkouts);

  const handleSeedData = async () => {
    try {
      await seedExercises();
      await seedWorkouts();
      toast.success("Sample workouts loaded!");
    } catch (error) {
      toast.error("Failed to load sample data");
    }
  };

  if (userStats === undefined || recentSessions === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleSeedData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load Sample Workouts
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{userStats?.totalWorkouts || 0}</div>
          <div className="text-sm text-gray-600">Total Workouts</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{userStats?.totalMinutes || 0}</div>
          <div className="text-sm text-gray-600">Minutes Trained</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{userStats?.currentStreak || 0}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{userStats?.longestStreak || 0}</div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Workouts</h2>
        </div>
        <div className="p-6">
          {recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">💪</div>
              <p className="text-gray-600">No workouts yet. Start your fitness journey!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.slice(0, 5).map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{session.workout.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(session.startTime).toLocaleDateString()} • 
                      {session.endTime ? 
                        ` ${Math.round((session.endTime - session.startTime) / 1000 / 60)} min` : 
                        " In progress"
                      }
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    session.completed 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {session.completed ? "Completed" : "In Progress"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
