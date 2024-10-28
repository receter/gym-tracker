import { Button, Stack, TextLinkButton } from "@sys42/ui";
import { produce } from "immer";
import { Fragment, useMemo, useState } from "react";

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

  const [sessionDefaultReps, sessionDefaultWeight] = useMemo(() => {
    if (tracker.sessions.length > 0) {
      const lastSession = tracker.sessions[tracker.sessions.length - 1];
      const lastSet = lastSession.activities.find(
        (activity) => activity.type === "set",
      );
      if (lastSet) {
        return [lastSet.reps, lastSet.weight];
      }
    }
    return [];
  }, [tracker]);

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
        defaultWeight={sessionDefaultWeight}
        defaultReps={sessionDefaultReps}
        session={activeSession}
        onChange={(session) => setActiveSession(session)}
        onCommit={handleCommitSession}
        onClickCancel={handleClickCancel}
      />
    );
  }

  return (
    <Stack className={styles.tracker}>
      <TextLinkButton className={styles.backButton} onClick={onBack}>
        Back
      </TextLinkButton>
      <h1>{tracker.name}</h1>

      <Button variant="primary" onClick={handleClickStartSession}>
        Start session
      </Button>

      <div className={styles.sessions}>
        {tracker.sessions.toReversed().map((session) => {
          const sessionStart = new Date(session.date);
          const sessionEnd = new Date(session.dateEnd);
          const sessionDuration = sessionEnd.getTime() - sessionStart.getTime();
          const formattedStartDate = sessionStart.toLocaleString();

          return (
            <div className={styles.session} key={session.date}>
              <div>
                <div className={styles.sessionActivities}>
                  {session.activities.length === 0 && "0"}
                  {session.activities.map((activity, index) => (
                    <Fragment key={index}>
                      {activity.type === "rest" && (
                        <span className={styles.rest}>
                          ({formatTime(activity.duration)})
                        </span>
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
                  <SessionWeight session={session} />{" "}
                  <span
                    className={styles.sessionDuration}
                    title={formattedStartDate}
                  >
                    {formatTime(sessionDuration)}
                  </span>
                </div>
              </div>
              <TextLinkButton
                className={styles.deleteButton}
                onClick={() => handleDeleteSession(session.id)}
              >
                Delete
              </TextLinkButton>
            </div>
          );
        })}
      </div>
      <div>
        <TextLinkButton onClick={handleClickDelete}>
          Delete this tracker
        </TextLinkButton>
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
  return <span>{isAllSetWeightsEqual ? setWeights[0] : "Mixed"} kg</span>;
}
