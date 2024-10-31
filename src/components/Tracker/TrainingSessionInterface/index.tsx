import { Button, classButtonGroup, Stack } from "@sys42/ui";
import { produce } from "immer";
import { useEffect, useState } from "react";

import { formatTime } from "../../../utils";
import { InputQuantity } from "../../InputQuantity";
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
  const [reps, setReps] = useState<number>(defaultReps);
  const [weight, setWeight] = useState<number>(defaultWeight);
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

  function handleAddActivity(reps: number, weight: number) {
    const updatedSession = produce(session, (draft) => {
      draft.activities.push({
        type: "set",
        reps,
        weight,
      });
    });
    setMode("resting");
    setRestingStartTime(new Date().getTime());
    onChange(updatedSession);
  }

  function handleChangeWeight(weight: number) {
    setWeight(weight);
  }

  function handleChangeReps(value: number) {
    setReps(value);
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
          {mode === "idle" && (
            <>
              <h2>Start session</h2>
              <InputWeight weight={weight} onChange={handleChangeWeight} />
              <div className={classButtonGroup}>
                <Button onClick={onClickCancel}>Back</Button>
                <Button variant="primary" onClick={handleClickStart}>
                  Start
                </Button>
              </div>
            </>
          )}
          {mode === "working" && (
            <>
              <h2>Working</h2>
              <div>Weight: {weight}</div>
              <div>Reps: {reps}</div>
              <InputQuantity
                className={styles.inputRepsInput}
                value={reps}
                onChangeValue={handleChangeReps}
              />
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
  weight: number;
  autoFocus?: boolean;
  onChange: (weight: number) => void;
}) {
  return (
    <InputQuantity
      autoFocus={autoFocus}
      value={weight}
      onChangeValue={onChange}
      className={styles.inputWeight}
    />
  );
}

function ChangeableWeight({
  weight,
  onChange,
}: {
  weight: number;
  onChange: (weight: number) => void;
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
