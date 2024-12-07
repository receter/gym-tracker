type TrainingTracker = {
  id: number;
  name: string;
  description?: string;
  machineId?: number;
  sessions: TrainingTrackerSession[];
};

type TrainingTrackerSession = {
  id: number;
  date: string;
  dateEnd: string;
  activities: TrainingActivity[];
};

type TrainingMachine = {
  id: number;
  name: string;
};

type TrainingActivity = TrainingRest | TrainingSet | TrainingSuperSet;

type TrainingActivityType = TrainingActivity["type"];

type TrainingRest = {
  type: "rest";
  duration: number;
};

type TrainingSet = {
  type: "set";
  reps: number;
  weight: number;
};

type TrainingSuperSet = {
  type: "superset";
  repsA: number;
  repsB: number;
  weightA: number;
  weightB: number;
};

type ActiveTrainingSession = {
  sessionPrototype: Omit<TrainingTrackerSession, "dateEnd" | "id" | "date"> & {
    date: TrainingTrackerSession["date"] | null;
  };
  activeActivity: {
    type: TrainingActivityType;
    startTime: number;
  } | null;
  currentValues: {
    weight: number;
    reps: number;
  };
  trackerId: number;
};
