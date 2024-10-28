import { Button, classButtonGroup, Stack } from "@sys42/ui";
import { produce } from "immer";
import { useEffect, useState } from "react";

import { formatTime } from "../../../utils";
import styles from "./styles.module.css";

export type TrainingTrackerSessionPrototype = Omit<
  TrainingTrackerSession,
  "dateEnd" | "id"
>;

type TrainingSessionInterfaceProps = {
  session: TrainingTrackerSessionPrototype;
  onChange: (session: TrainingTrackerSessionPrototype) => void;
  onCommit: (session: TrainingTrackerSessionPrototype) => void;
  onClickCancel: () => void;
  defaultWeight?: number;
  defaultReps?: number;
};

export function TrainingSessionInterface({
  session,
  onChange,
  onCommit,
  onClickCancel,
  defaultReps = 8,
  defaultWeight = 10,
}: TrainingSessionInterfaceProps) {
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date().getTime());
  const [reps, setReps] = useState<number | null>(defaultReps);
  const [weight, setWeight] = useState<number | null>(defaultWeight);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"resting" | "lifting" | "idle">("idle");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sessionDuration = sessionStartTime
    ? currentTime - sessionStartTime
    : null;

  function handleAddActivity(reps: number | null, weight: number | null) {
    if (reps === null || weight === null) {
      setError("Reps and weight must be provided.");
      return;
    }
    const updatedSession = produce(session, (draft) => {
      draft.activities.push({
        type: "set",
        reps,
        weight,
      });
    });
    setError(null);
    setMode("resting");
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

  function handleClickStartNextSet() {
    setMode("lifting");
  }

  function handleClickStart() {
    setSessionStartTime(new Date().getTime());
    setMode("lifting");
  }

  return (
    <Stack className={styles.trainingSessionInterface}>
      {mode === "idle" && <Button onClick={handleClickStart}>Start</Button>}
      {mode === "resting" && (
        <Stack className={styles.set}>
          <div>
            <strong>Resting...</strong>
          </div>
          <Button onClick={handleClickStartNextSet}>Start next set</Button>
        </Stack>
      )}
      {mode === "lifting" && (
        <Stack className={styles.set}>
          <div className={styles.weightAndReps}>
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
            <div className={styles.inputGroupWeight}>
              <input
                className={styles.inputWeight}
                type="number"
                value={weight ?? ""}
                onChange={handleChangeWeight}
              />
              kg
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={classButtonGroup}>
            <Button
              variant="primary"
              onClick={() => handleAddActivity(reps, weight)}
            >
              Log set
            </Button>
          </div>
        </Stack>
      )}
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
      <div>
        <h2>Debug</h2>
        <div>Mode: {mode}</div>
        {sessionDuration !== null && (
          <div>Session time: {formatTime(sessionDuration)}</div>
        )}
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
      </div>
    </Stack>
  );
}
