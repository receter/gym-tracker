import { Button, classButtonGroup, Stack, TextLinkButton } from "@sys42/ui";
import { useEffect, useMemo, useState } from "react";

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
      <TextLinkButton className={styles.backButton} onClick={onBack}>
        Back
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
          {tracker.sessions.map((session) => (
            <div key={session.date}>
              <div>{session.date}</div>
              <div>{session.dateEnd}</div>
              {session.activities.map((activity, index) => (
                <div key={index}>
                  {activity.type === "rest" && (
                    <div>Rest for {activity.duration} seconds</div>
                  )}
                  {activity.type === "set" && (
                    <div>
                      {activity.reps} reps at {activity.weight}kg
                    </div>
                  )}
                  {activity.type === "superset" && (
                    <div>
                      {activity.repsA} reps at {activity.weightA}kg and{" "}
                      {activity.repsB} reps at {activity.weightB}kg
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
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
  const [reps, setReps] = useState(8);
  const [weight, setWeight] = useState(10);

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

  function handleAddActivity(reps: number, weight: number) {
    const newActivities = [];

    const newActivity: TrainingActivity = {
      type: "set",
      reps,
      weight,
    };

    newActivities.push(newActivity);

    const updatedSession = {
      ...session,
      activities: [...session.activities, ...newActivities],
    };
    onChange(updatedSession);
  }

  function handleChangeWeight(event: React.ChangeEvent<HTMLInputElement>) {
    setWeight(Number(event.target.value));
  }

  function handleChangeReps(event: React.ChangeEvent<HTMLInputElement>) {
    setReps(Math.round(Number(event.target.value)));
  }

  return (
    <Stack className={styles.trainingSessionInterface}>
      <div>Mode: {mode}</div>
      <div>Session time: {formatTime(sessionDuration)}</div>
      <div className={styles.inputGroupWeight}>
        <input
          className={styles.inputWeight}
          type="number"
          value={weight}
          min={0}
          onChange={handleChangeWeight}
        />
        kg
      </div>
      <div className={styles.inputGroupReps}>
        <input
          className={styles.inputReps}
          type="number"
          value={reps}
          min={0}
          step={1}
          onChange={handleChangeReps}
        />{" "}
        reps
      </div>
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
  const remainingSeconds = seconds % 60;
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}
