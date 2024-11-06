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

import { Home } from "./components/Home";
import { Tracker } from "./components/Tracker";
import { getNextIdForItems } from "./utils";

type AppMode = "trackers" | "new-tracker" | "tracker";

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

  function handleChangeTracker(tracker: TrainingTracker) {
    setTrackers((trackers) => {
      return produce(trackers, (draft) => {
        const trackerIndex = draft.findIndex((t) => t.id === tracker.id);
        if (trackerIndex !== -1) {
          draft.splice(trackerIndex, 1, tracker);
        }
      });
    });
  }

  function handleDeleteTracker(trackerId: number) {
    setTrackers((trackers) => {
      return produce(trackers, (draft) => {
        const trackerIndex = draft.findIndex((t) => t.id === trackerId);
        if (trackerIndex !== -1) {
          draft.splice(trackerIndex, 1);
        }
      });
    });
    setAppMode("trackers");
  }

  function handleBackButtonClick() {
    setAppMode("trackers");
  }

  return (
    <>
      {appMode === "trackers" && (
        <Home
          trackers={trackers}
          onClickAddTracker={handleClickAddTracker}
          onClickTracker={(tracker) => {
            setActiveTrackerId(tracker.id);
            setAppMode("tracker");
          }}
        />
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
              onChange={handleChangeTracker}
              onDelete={handleDeleteTracker}
              onBack={handleBackButtonClick}
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
