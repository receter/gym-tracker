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
  const [restingStartTime, setRestingStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date().getTime());
  const [reps, setReps] = useState<number | null>(defaultReps);
  const [weight, setWeight] = useState<number | null>(defaultWeight);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"resting" | "working" | "idle">("idle");

  useEffect(() => {
    const intervallCallback = () => {
      setCurrentTime(new Date().getTime());
    };
    const interval = setInterval(intervallCallback, 500);
    intervallCallback();
    return () => clearInterval(interval);
  }, [sessionStartTime, restingStartTime]);

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
    setRestingStartTime(new Date().getTime());
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
    setMode("working");
    if (restingStartTime) {
      const restingDuration = currentTime - restingStartTime;
      const updatedSession = produce(session, (draft) => {
        draft.activities.push({
          type: "rest",
          duration: restingDuration,
        });
      });
      setRestingStartTime(null);
      onChange(updatedSession);
    }
  }

  function handleClickStart() {
    setSessionStartTime(new Date().getTime());
    setMode("working");
  }

  return (
    <Stack className={styles.trainingSessionInterface}>
      {mode === "resting" && (
        <Stack className={styles.set}>
          <h2>Resting</h2>
          {restingStartTime && (
            <div className={styles.restingDuration}>
              {formatTime(currentTime - restingStartTime)}
            </div>
          )}
          <ChangeableWeight weight={weight} onChange={handleChangeWeight} />
          <div className={classButtonGroup}>
            <Button variant="primary" onClick={handleClickStartNextSet}>
              Start next set
            </Button>
            <Button onClick={() => onCommit(session)}>Commit Session</Button>
            <Button onClick={onClickCancel}>Cancel</Button>
          </div>
        </Stack>
      )}
      {(mode === "working" || mode === "idle") && (
        <Stack className={styles.set}>
          {error && <div className={styles.error}>{error}</div>}
          {mode === "idle" && (
            <>
              <h2>Start session</h2>
              <InputWeight weight={weight} onChange={handleChangeWeight} />
              <Button variant="primary" onClick={handleClickStart}>
                Start
              </Button>
            </>
          )}
          {mode === "working" && (
            <>
              <h2>Working</h2>
              <div>Weight: {weight}</div>
              <InputReps reps={reps} onChange={handleChangeReps} />
              <Button
                variant="primary"
                onClick={() => handleAddActivity(reps, weight)}
              >
                Log set
              </Button>
            </>
          )}
        </Stack>
      )}
      <div>
        <h2>Debug</h2>
        <div>Mode: {mode}</div>
        {sessionDuration !== null && (
          <div>Session time: {formatTime(sessionDuration)}</div>
        )}
        <div>Logged activities:</div>
        <div>
          {session.activities.map((activity, index) => (
            <div key={index}>
              {activity.type === "set" && (
                <div>
                  {activity.reps} reps at {activity.weight}kg
                </div>
              )}
              {activity.type === "rest" && (
                <div>Resting for {formatTime(activity.duration)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Stack>
  );
}

function InputWeight({
  weight,
  autoFocus,
  onChange,
}: {
  weight: number | null;
  autoFocus?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={styles.inputWeight}>
      <input
        className={styles.inputWeightInput}
        autoFocus={autoFocus}
        type="number"
        value={weight ?? ""}
        onChange={onChange}
      />
      kg
    </div>
  );
}

function InputReps({
  reps,
  onChange,
}: {
  reps: number | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={styles.inputReps}>
      <input
        className={styles.inputRepsInput}
        type="number"
        value={reps ?? ""}
        step={1}
        onChange={onChange}
      />{" "}
      reps
    </div>
  );
}

function ChangeableWeight({
  weight,
  onChange,
}: {
  weight: number | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [isChanging, setIsChanging] = useState(false);
  return (
    <div className={styles.changeableWeight}>
      {isChanging ? (
        <InputWeight autoFocus={true} weight={weight} onChange={onChange} />
      ) : (
        <>
          <div>Weight: {weight}</div>
          <Button
            onClick={() => {
              setIsChanging(true);
            }}
          >
            Change
          </Button>
        </>
      )}
    </div>
  );
}
