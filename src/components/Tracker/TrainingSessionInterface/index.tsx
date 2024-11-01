import {
  Button,
  classButtonGroup,
  FormField,
  FormFieldContext,
  Stack,
} from "@sys42/ui";
import { produce } from "immer";
import { useContext, useEffect, useState } from "react";

import { formatTime, isDebugEnabled } from "../../../utils";
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
  onClickDiscard: () => void;
  defaultWeight?: number;
  defaultReps?: number;
};

export function TrainingSessionInterface({
  session,
  onChange,
  onCommit,
  onClickDiscard,
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
    <Stack spacing="lg" className={styles.trainingSessionInterface}>
      {mode === "resting" && (
        <>
          <h2 className={styles.classLeadingTrim}>
            Resting(
            {restingStartTime && formatTime(currentTime - restingStartTime)}
            )…
          </h2>
          <ChangeableWeight weight={weight} onChange={handleChangeWeight} />
          <div className={classButtonGroup}>
            <Button variant="primary" onClick={handleClickStartNextSet}>
              Start next set
            </Button>
          </div>
        </>
      )}

      {mode === "idle" && (
        <>
          <h2 className={styles.classLeadingTrim}>Start session</h2>
          <FormField label="Weight (kg)">
            <InputWeight weight={weight} onChange={handleChangeWeight} />
          </FormField>
          <div className={classButtonGroup}>
            <Button onClick={onClickDiscard}>Cancel</Button>
            <Button variant="primary" onClick={handleClickStart}>
              Start
            </Button>
          </div>
        </>
      )}

      {mode === "working" && (
        <>
          <h2 className={styles.classLeadingTrim}>Working({weight}kg)…</h2>
          <FormField label="Reps count">
            <InputQuantity
              className={styles.inputRepsInput}
              value={reps}
              onChangeValue={handleChangeReps}
            />
          </FormField>
          <div className={classButtonGroup}>
            <Button
              variant="primary"
              onClick={() => handleAddActivity(reps, weight)}
            >
              Log set
            </Button>
          </div>
        </>
      )}

      {session.activities.length > 0 && (
        <div>
          <h3 className={styles.classLeadingTrim}>Logged activities:</h3>

          <div className={styles.activities}>
            {session.activities.map((activity, index) => {
              const setNumber = session.activities
                .slice(0, index + 1)
                .filter((a) => a.type === "set").length;
              return (
                <>
                  {activity.type === "set" && (
                    <div className={styles.loggedActivity}>
                      <strong>
                        Set {setNumber}: {activity.reps} reps at{" "}
                        {activity.weight}
                        kg
                      </strong>
                    </div>
                  )}
                  {activity.type === "rest" && (
                    <div className={styles.loggedActivity}>
                      Resting for {formatTime(activity.duration)}
                    </div>
                  )}
                </>
              );
            })}
          </div>
        </div>
      )}

      <div className={classButtonGroup}>
        <Button onClick={() => onCommit(session)}>Commit Session</Button>
        <Button onClick={onClickDiscard}>Discard</Button>
      </div>

      {isDebugEnabled && (
        <div>
          <h2>Debug</h2>
          <div>Mode: {mode}</div>
          {sessionDuration !== null && (
            <div>Session time: {formatTime(sessionDuration)}</div>
          )}
        </div>
      )}
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
  const formFieldContext = useContext(FormFieldContext);
  return (
    <InputQuantity
      inputId={formFieldContext?.htmlFor}
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
        <Button
          onClick={() => {
            setIsChanging(true);
          }}
        >
          Change weight ({weight}kg)
        </Button>
      )}
    </div>
  );
}
