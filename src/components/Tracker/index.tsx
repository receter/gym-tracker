import { Button, Stack, TextLinkButton } from "@sys42/ui";
import { produce } from "immer";
import { Fragment, useState } from "react";

import { formatTime, getNextIdForItems } from "../../utils";
import styles from "./styles.module.css";
import {
  TrainingSessionInterface,
  TrainingTrackerSessionPrototype,
} from "./TrainingSessionInterface";

export function Tracker({
  tracker,
  onChange,
  onDelete,
  onBack,
}: {
  tracker: TrainingTracker;
  onChange: (tracker: TrainingTracker) => void;
  onDelete: (trackerId: number) => void;
  onBack: () => void;
}) {
  const [activeSession, setActiveSession] =
    useState<TrainingTrackerSessionPrototype | null>(null);

  function handleClickStartSession() {
    const newSession: TrainingTrackerSessionPrototype = {
      date: new Date().toISOString(),
      activities: [],
    };
    setActiveSession(newSession);
  }

  function handleCommitSession(session: TrainingTrackerSessionPrototype) {
    const updatedTracker = produce(tracker, (draft) => {
      draft.sessions.push({
        ...session,
        dateEnd: new Date().toISOString(),
        id: getNextIdForItems(tracker.sessions),
      });
    });
    onChange(updatedTracker);
    setActiveSession(null);
  }

  function handleClickCancel() {
    setActiveSession(null);
  }

  function handleDeleteSession(sessionId: number) {
    if (window.confirm("Are you sure you want to delete this session?")) {
      const updatedTracker = produce(tracker, (draft) => {
        const sessionIndex = draft.sessions.findIndex(
          (i) => i.id === sessionId,
        );
        if (sessionIndex !== -1) {
          draft.sessions.splice(sessionIndex, 1);
        }
      });
      onChange(updatedTracker);
    }
  }

  function handleClickDelete() {
    if (window.confirm("Are you sure you want to delete this tracker?"))
      onDelete(tracker.id);
  }

  if (activeSession) {
    return (
      <TrainingSessionInterface
        session={activeSession}
        onChange={(session) => setActiveSession(session)}
        onCommit={handleCommitSession}
        onClickCancel={handleClickCancel}
      />
    );
  }

  return (
    <Stack className={styles.tracker}>
      <TextLinkButton
        className={styles.backButton}
        onClick={onBack}
        aria-label="Back"
      >
        ⨉
      </TextLinkButton>
      <h1>{tracker.name}</h1>

      <Button variant="primary" onClick={handleClickStartSession}>
        Let's go!
      </Button>
      {tracker.sessions.toReversed().map((session) => {
        const sessionStart = new Date(session.date);
        const sessionEnd = new Date(session.dateEnd);
        const sessionDuration = sessionEnd.getTime() - sessionStart.getTime();
        const formattedStartDate = sessionStart.toLocaleString();

        return (
          <div className={styles.session} key={session.date}>
            <div className={styles.sessionActivities}>
              {session.activities.length === 0 && "0"}
              {session.activities.map((activity, index) => (
                <Fragment key={index}>
                  {activity.type === "rest" && (
                    <div>Rest for {activity.duration} seconds</div>
                  )}
                  {activity.type === "set" && (
                    <>
                      {index !== 0 && "/"}
                      {activity.reps}
                    </>
                  )}
                  {activity.type === "superset" && (
                    <div>
                      {activity.repsA} reps at {activity.weightA}kg and{" "}
                      {activity.repsB} reps at {activity.weightB}kg
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
            <div className={styles.durationAndWeight}>
              <SessionWeight session={session} />
              <div
                className={styles.sessionDuration}
                title={formattedStartDate}
              >
                Duration: {formatTime(sessionDuration)}
              </div>
            </div>
            <Button
              className={styles.deleteButton}
              onClick={() => handleDeleteSession(session.id)}
            >
              Delete
            </Button>
          </div>
        );
      })}

      <div>
        <Button onClick={handleClickDelete}>Delete this tracker</Button>
      </div>
    </Stack>
  );
}

function SessionWeight({ session }: { session: TrainingTrackerSession }) {
  const setWeights = session.activities.reduce(
    (weights, activity) =>
      activity.type === "set" ? [...weights, activity.weight] : weights,
    [] as number[],
  );
  // const totalSetWeight = setWeights.reduce((a, b) => a + b, 0);
  const isAllSetWeightsEqual = setWeights.every(
    (weight) => weight === setWeights[0],
  );
  return <div>{isAllSetWeightsEqual ? setWeights[0] : "Mixed"} kg</div>;
}
