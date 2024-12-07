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
import { TrainingSessionInterface } from "./components/TrainingSessionInterface";
import { getNextIdForItems } from "./utils";

type AppMode = "trackers" | "new-tracker" | "tracker";

function App() {
  const [appMode, setAppMode] = useState<AppMode>("trackers");
  const [activeTrackerId, setActiveTrackerId] = useState<number | null>(null);

  const [trackers, setTrackers] = usePersistentState<TrainingTracker[]>(
    "trackers",
    [],
  );

  const [activeTrainingSession, setActiveTrainingSession] =
    usePersistentState<ActiveTrainingSession | null>(
      "active-training-session",
      null,
    );

  const activeTracker = trackers.find(
    (tracker) => tracker.id === activeTrackerId,
  );

  const nextTrackerId = getNextIdForItems(trackers);

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

  function handleNewSession(trackerId: number) {
    const sessionDefaults = getSessionDefaults(
      trackers.find((t) => t.id === trackerId),
    );

    setActiveTrainingSession({
      sessionPrototype: {
        activities: [],
        date: null,
      },
      activeActivity: null,
      currentValues: sessionDefaults,
      trackerId,
    });
  }

  function handleCommitActiveTrainingSession() {
    if (activeTrainingSession == null) {
      return;
    }
    const updatedTrackers = produce(trackers, (draft) => {
      const trackerIndex = draft.findIndex(
        (t) => t.id === activeTrainingSession.trackerId,
      );
      const date: string | null = activeTrainingSession.sessionPrototype.date;
      if (trackerIndex !== -1 && date !== null) {
        // There should be and "active activity" and this is the current rest which we
        // will not use. But the start time is actually a more accurate time for when
        // we ended the session.
        let dateEnd: string;
        if (activeTrainingSession.activeActivity?.startTime) {
          dateEnd = new Date(
            activeTrainingSession.activeActivity.startTime,
          ).toISOString();
        } else {
          dateEnd = new Date().toISOString();
        }

        draft[trackerIndex].sessions.push({
          ...activeTrainingSession.sessionPrototype,
          date,
          dateEnd,
          id: getNextIdForItems(draft[trackerIndex].sessions),
        });
      }
    });
    setTrackers(updatedTrackers);
    setActiveTrackerId(activeTrainingSession.trackerId);
    setAppMode("tracker");
    setActiveTrainingSession(null);
  }

  if (activeTrainingSession) {
    return (
      <ActiveTrainingSession
        activeTrainingSession={activeTrainingSession}
        onChange={setActiveTrainingSession}
        onCommit={handleCommitActiveTrainingSession}
      />
    );
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
              onClickNewSession={() => handleNewSession(activeTracker.id)}
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
        <Button variant="primary" onClick={handleClickSave}>
          Save
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </div>
    </Stack>
  );
}

function getSessionDefaults(
  tracker?: TrainingTracker,
): ActiveTrainingSession["currentValues"] {
  let reps = 0;
  let weight = 0;
  if (tracker && tracker.sessions.length > 0) {
    const lastSession = tracker.sessions[tracker.sessions.length - 1];
    const firstSet = lastSession.activities.find(
      (activity) => activity.type === "set",
    );
    if (firstSet) {
      reps = firstSet.reps;
      weight = firstSet.weight;
    }
  }
  return {
    reps,
    weight,
  };
}

function ActiveTrainingSession({
  activeTrainingSession,
  onChange,
  onCommit,
}: {
  activeTrainingSession: ActiveTrainingSession;
  onChange: (session: ActiveTrainingSession | null) => void;
  onCommit: () => void;
}) {
  function handleOnClickDiscard() {
    if (window.confirm("Are you sure you want to discard this session?")) {
      onChange(null);
    }
  }

  return (
    <TrainingSessionInterface
      activeSession={activeTrainingSession}
      onClickCancel={() => onChange(null)}
      onClickDiscard={handleOnClickDiscard}
      onChange={onChange}
      onCommit={onCommit}
    />
  );
}

export default App;
