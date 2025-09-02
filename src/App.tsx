import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { WorkoutLibrary } from "./components/WorkoutLibrary";
import { Dashboard } from "./components/Dashboard";
import { ActiveWorkout } from "./components/ActiveWorkout";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">FitFlow</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [activeView, setActiveView] = useState<"dashboard" | "workouts" | "active">("dashboard");
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const startWorkout = (workoutId: string) => {
    setActiveWorkoutId(workoutId);
    setActiveView("active");
  };

  const finishWorkout = () => {
    setActiveWorkoutId(null);
    setActiveView("dashboard");
  };

  return (
    <div className="flex flex-col">
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[500px] p-8">
          <div className="w-full max-w-md mx-auto text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">FitFlow</h1>
            <p className="text-xl text-gray-600 mb-8">Your personal bodyweight fitness trainer</p>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {activeView === "active" && activeWorkoutId ? (
          <ActiveWorkout workoutId={activeWorkoutId} onFinish={finishWorkout} />
        ) : (
          <>
            {/* Navigation */}
            <nav className="bg-white border-b px-4 py-3">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === "dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView("workouts")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === "workouts"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Workouts
                </button>
              </div>
            </nav>

            {/* Content */}
            <div className="p-6">
              {activeView === "dashboard" && <Dashboard />}
              {activeView === "workouts" && <WorkoutLibrary onStartWorkout={startWorkout} />}
            </div>
          </>
        )}
      </Authenticated>
    </div>
  );
}
