import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ActiveWorkoutProps {
  workoutId: string;
  onFinish: () => void;
}

export function ActiveWorkout({ workoutId, onFinish }: ActiveWorkoutProps) {
  const workout = useQuery(api.workouts.getById, { id: workoutId as any });
  const startSession = useMutation(api.sessions.startSession);
  const completeSession = useMutation(api.sessions.completeSession);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [exerciseResults, setExerciseResults] = useState<any[]>([]);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentSets, setCurrentSets] = useState(0);

  useEffect(() => {
    if (workout && !sessionId) {
      startSession({ workoutId: workoutId as any })
        .then(setSessionId)
        .catch(() => toast.error("Failed to start workout session"));
    }
  }, [workout, sessionId, startSession, workoutId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isResting) {
      setIsResting(false);
      toast.success("Rest complete! Next exercise.");
    }
  }, [timeLeft, isResting]);

  if (!workout || !workout.exerciseDetails) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentExercise = workout.exerciseDetails[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exerciseDetails.length - 1;

  const handleCompleteExercise = () => {
    const result = {
      exerciseId: currentExercise._id,
      repsCompleted: currentExercise.reps ? currentReps : undefined,
      durationCompleted: currentExercise.duration,
      setsCompleted: currentExercise.sets ? currentSets : undefined,
    };

    setExerciseResults([...exerciseResults, result]);

    if (isLastExercise) {
      handleFinishWorkout([...exerciseResults, result]);
    } else {
      // Start rest period
      setIsResting(true);
      setTimeLeft(60); // 60 second rest
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentReps(0);
      setCurrentSets(0);
    }
  };

  const handleFinishWorkout = async (results: any[]) => {
    if (!sessionId) return;
    
    try {
      await completeSession({
        sessionId: sessionId as any,
        exerciseResults: results,
      });
      toast.success("Workout completed! Great job! 🎉");
      onFinish();
    } catch (error) {
      toast.error("Failed to save workout");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isResting) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rest Time</h2>
          <div className="text-4xl font-bold text-blue-600 mb-4">{formatTime(timeLeft)}</div>
          <p className="text-gray-600">Get ready for the next exercise!</p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Next: {workout.exerciseDetails[currentExerciseIndex]?.name}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Exercise {currentExerciseIndex + 1} of {workout.exerciseDetails.length}</span>
          <span>{Math.round(((currentExerciseIndex) / workout.exerciseDetails.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentExerciseIndex) / workout.exerciseDetails.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Exercise */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentExercise.name}</h2>
        <p className="text-gray-600 mb-4">{currentExercise.description}</p>
        
        {/* Exercise Target */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex justify-center space-x-8 text-center">
            {currentExercise.reps && (
              <div>
                <div className="text-2xl font-bold text-blue-600">{currentExercise.reps}</div>
                <div className="text-sm text-gray-600">Reps</div>
              </div>
            )}
            {currentExercise.duration && (
              <div>
                <div className="text-2xl font-bold text-blue-600">{currentExercise.duration}s</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            )}
            {currentExercise.sets && (
              <div>
                <div className="text-2xl font-bold text-blue-600">{currentExercise.sets}</div>
                <div className="text-sm text-gray-600">Sets</div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            {currentExercise.instructions.map((instruction: string, index: number) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        {/* Rep/Set Counter */}
        {currentExercise.reps && (
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => setCurrentReps(Math.max(0, currentReps - 1))}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            >
              -
            </button>
            <div className="text-xl font-bold">{currentReps} reps</div>
            <button
              onClick={() => setCurrentReps(currentReps + 1)}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
            >
              +
            </button>
          </div>
        )}

        {currentExercise.sets && (
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={() => setCurrentSets(Math.max(0, currentSets - 1))}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            >
              -
            </button>
            <div className="text-xl font-bold">{currentSets} sets</div>
            <button
              onClick={() => setCurrentSets(currentSets + 1)}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
            >
              +
            </button>
          </div>
        )}

        {/* Complete Exercise Button */}
        <button
          onClick={handleCompleteExercise}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
        >
          {isLastExercise ? "Finish Workout" : "Complete Exercise"}
        </button>
      </div>

      {/* Skip/Quit Options */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleCompleteExercise()}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Skip Exercise
        </button>
        <button
          onClick={onFinish}
          className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
        >
          Quit Workout
        </button>
      </div>
    </div>
  );
}
