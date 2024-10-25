import { Button, classButtonGroup, Stack, TextLinkButton } from "@sys42/ui";
import { produce } from "immer";
import { Fragment, useEffect, useMemo, useState } from "react";

import styles from "./styles.module.css";

export function Tracker({
  tracker,
  onCommitSession,
  onBack,
}: {
  tracker: TrainingTracker;
  onCommitSession: (trackerId: number, session: TrainingTrackerSession) => void;
  onBack: () => void;
}) {
  const [activeSession, setActiveSession] =
    useState<TrainingTrackerSession | null>(null);

  function handleClickStartSession() {
    const newSession: typeof activeSession = {
      date: new Date().toISOString(),
      dateEnd: new Date().toISOString(),
      activities: [],
    };
    setActiveSession(newSession);
  }

  function handleCommitSession(session: TrainingTrackerSession) {
    onCommitSession(tracker.id, {
      ...session,
      dateEnd: new Date().toISOString(),
    });
    setActiveSession(null);
  }

  function handleClickCancel() {
    setActiveSession(null);
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

      {activeSession && (
        <TrainingSessionInterface
          session={activeSession}
          onChange={(session) => setActiveSession(session)}
          onCommit={handleCommitSession}
          onClickCancel={handleClickCancel}
        />
      )}

      {!activeSession && (
        <>
          <Button variant="primary" onClick={handleClickStartSession}>
            Let's go!
          </Button>
          {tracker.sessions.map((session) => {
            const sessionStart = new Date(session.date);
            const sessionEnd = new Date(session.dateEnd);
            const sessionDuration =
              sessionEnd.getTime() - sessionStart.getTime();
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
              </div>
            );
          })}
        </>
      )}
    </Stack>
  );
}

type TrainingSessionInterfaceProps = {
  session: TrainingTrackerSession;
  onChange: (session: TrainingTrackerSession) => void;
  onCommit: (session: TrainingTrackerSession) => void;
  onClickCancel: () => void;
};

export function TrainingSessionInterface({
  session,
  onChange,
  onCommit,
  onClickCancel,
}: TrainingSessionInterfaceProps) {
  let mode;
  if (
    session.activities.length === 0 ||
    session.activities[session.activities.length - 1].type === "rest"
  ) {
    mode = "lifting";
  } else {
    mode = "resting";
  }

  const [currentTime, setCurrentTime] = useState(() => new Date().getTime());
  const [reps, setReps] = useState<number | null>(8);
  const [weight, setWeight] = useState<number | null>(10);
  const [error, setError] = useState<string | null>(null);

  const sessionStartTime = useMemo(
    () => new Date(session.date).getTime(),
    [session.date],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sessionDuration = currentTime - sessionStartTime;

  function handleAddActivity(reps: number | null, weight: number | null) {
    if (reps === null || weight === null) {
      setError("Reps and weight must be provided.");
      return;
    }
    setError(null);
    const updatedSession = produce(session, (draft) => {
      draft.activities.push({
        type: "set",
        reps,
        weight,
      });
    });
    onChange(updatedSession);
  }

  function handleChangeWeight(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setWeight(value === "" ? null : Number(value));
  }

  function handleChangeReps(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setReps(value === "" ? null : Math.round(Number(value)));
  }

  return (
    <Stack className={styles.trainingSessionInterface}>
      <div>Mode: {mode}</div>
      <div>Session time: {formatTime(sessionDuration)}</div>
      <div className={styles.inputGroupWeight}>
        <input
          className={styles.inputWeight}
          type="number"
          value={weight ?? ""}
          onChange={handleChangeWeight}
        />
        kg
      </div>
      <div className={styles.inputGroupReps}>
        <input
          className={styles.inputReps}
          type="number"
          value={reps ?? ""}
          step={1}
          onChange={handleChangeReps}
        />{" "}
        reps
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={classButtonGroup}>
        <Button onClick={() => handleAddActivity(reps, weight)}>
          Add Activity
        </Button>
        <Button onClick={() => onCommit(session)}>Commit Session</Button>
      </div>
      <div>Logged sets:</div>
      <div>
        {session.activities.map((activity, index) => (
          <div key={index}>
            {activity.type === "set" && (
              <div>
                {activity.reps} reps at {activity.weight}kg
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={classButtonGroup}>
        <Button onClick={onClickCancel}>Cancel</Button>
        <Button
          variant="primary"
          onClick={() => onCommit(session)}
          disabled={session.activities.length === 0}
        >
          Commit Session
        </Button>
      </div>
    </Stack>
  );
}

function formatTime(time: number) {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  const formattedMinutes = remainingMinutes.toString().padStart(2, "0");
  const formattedHours = hours.toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
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
