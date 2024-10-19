import "./App.css";

import {
  Button,
  classButtonGroup,
  FormField,
  Stack,
  TextInput,
} from "@sys42/ui";
import { usePersistentState } from "@sys42/utils";
import { useState } from "react";

type TrainingTracker = {
  id: number;
  name: string;
  machineId?: number;
  sessions: TrainingTrackerSession[];
};

type TrainingTrackerSession = {
  date: string;
  activities: TrainingActivity[];
};

type TrainingMachine = {
  id: number;
  name: string;
};

type TrainingActivity = TrainingRest | TrainingSet | TrainingSuperSet;

type TrainingRest = {
  duration: number;
};

type TrainingSet = {
  reps: number;
  weight: number;
};

type TrainingSuperSet = {
  repsA: number;
  repsB: number;
  weightA: number;
  weightB: number;
};

type AppMode = "trackers" | "new-tracker";

function getNextIdForItems(items: { id: number }[]) {
  return items.length > 0
    ? items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
    : 1;
}

function App() {
  const [appMode, setAppMode] = useState<AppMode>("trackers");

  const [trackers, setTrackers] = usePersistentState<TrainingTracker[]>(
    "trackers",
    [],
  );

  // const [machines] = usePersistentState<TrainingMachine[]>(
  //   "machines",
  //   [],
  // );

  const nextTrackerId = getNextIdForItems(trackers);
  //const nextMachineId = getNextIdForItems(machines);

  const handleClickAddTracker = () => {
    setAppMode("new-tracker");
  };

  return (
    <>
      {appMode === "trackers" && (
        <Stack>
          <TrackersList trackers={trackers} />
          <Button variant="primary" onClick={handleClickAddTracker}>
            Add tracker
          </Button>
        </Stack>
      )}

      {appMode === "new-tracker" && (
        <NewTrackerForm
          handleClose={() => setAppMode("trackers")}
          handleSave={(tracker) => {
            const newTracker: TrainingTracker = {
              ...tracker,
              id: nextTrackerId,
            };
            setTrackers((trackers) => [...trackers, newTracker]);
            setAppMode("trackers");
          }}
        />
      )}
    </>
  );
}

function NewTrackerForm(props: {
  handleClose: () => void;
  handleSave: (tracker: Omit<TrainingTracker, "id">) => void;
}) {
  const { handleClose, handleSave } = props;
  const [name, setName] = useState("");

  const handleClickSave = () => {
    handleSave({ name, sessions: [] });
  };

  return (
    <Stack>
      <h1>New tracker</h1>
      <FormField label="Name">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <div className={classButtonGroup}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleClickSave}>
          Save
        </Button>
      </div>
    </Stack>
  );
}

function TrackersList({ trackers }: { trackers: TrainingMachine[] }) {
  return (
    <Stack>
      {trackers.map((tracker) => (
        <TrackersListItem key={tracker.id} tracker={tracker} />
      ))}
    </Stack>
  );
}

function TrackersListItem({ tracker }: { tracker: TrainingMachine }) {
  return <div>{tracker.name}</div>;
}

export default App;
