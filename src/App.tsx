import "./App.css";

import {
  Button,
  classButtonGroup,
  FormField,
  Stack,
  TextInput,
} from "@sys42/ui";
import { usePersistentState } from "@sys42/utils";
import { produce } from "immer";
import { useState } from "react";

import { Tracker } from "./components/Tracker";
import { TrackersList } from "./components/TrackersList";

type AppMode = "trackers" | "new-tracker" | "tracker";

function getNextIdForItems(items: { id: number }[]) {
  return items.length > 0
    ? items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
    : 1;
}

function App() {
  const [appMode, setAppMode] = useState<AppMode>("trackers");
  const [activeTrackerId, setActiveTrackerId] = useState<number | null>(null);

  const [trackers, setTrackers] = usePersistentState<TrainingTracker[]>(
    "trackers",
    [],
  );

  const activeTracker = trackers.find(
    (tracker) => tracker.id === activeTrackerId,
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

  function handleSaveNewTracker(tracker: Omit<TrainingTracker, "id">) {
    const newTracker: TrainingTracker = {
      ...tracker,
      id: nextTrackerId,
    };
    setTrackers((trackers) => [...trackers, newTracker]);
    setAppMode("trackers");
  }

  function handleCommitSession(
    trackerId: number,
    session: TrainingTrackerSession,
  ) {
    setTrackers((trackers) => {
      return produce(trackers, (draft) => {
        const tracker = draft.find((t) => t.id === trackerId);
        if (tracker) {
          tracker.sessions.push(session);
        }
      });
    });
  }

  return (
    <>
      {appMode === "trackers" && (
        <Stack>
          <TrackersList
            trackers={trackers}
            onItemClick={(tracker) => {
              setActiveTrackerId(tracker.id);
              setAppMode("tracker");
            }}
          />
          <Button variant="primary" onClick={handleClickAddTracker}>
            Add tracker
          </Button>
        </Stack>
      )}

      {appMode === "new-tracker" && (
        <NewTrackerForm
          handleClose={() => setAppMode("trackers")}
          handleSave={handleSaveNewTracker}
        />
      )}

      {appMode === "tracker" && (
        <div>
          {activeTracker && (
            <Tracker
              tracker={activeTracker}
              onCommitSession={handleCommitSession}
            />
          )}
          {!activeTracker && (
            <Stack>
              <div>Tracker not found</div>
              <Button onClick={() => setAppMode("trackers")}>Back</Button>
            </Stack>
          )}
        </div>
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

export default App;
