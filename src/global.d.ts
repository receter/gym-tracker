type TrainingTracker = {
  id: number;
  name: string;
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
