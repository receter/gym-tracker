import {
  Button,
  classButtonGroup,
  FormField,
  FormFieldContext,
  Stack,
} from "@sys42/ui";
import { produce } from "immer";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";

import { formatTime, isDebugEnabled } from "../../utils";
import { InputQuantity } from "../InputQuantity";
import styles from "./styles.module.css";

type TrainingSessionInterfaceProps = {
  activeSession: ActiveTrainingSession;
  onChange: (activeSession: ActiveTrainingSession) => void;
  onCommit: () => void;
  onClickDiscard: () => void;
  onClickCancel: () => void;
};

export function TrainingSessionInterface({
  activeSession,
  onChange,
  onCommit,
  onClickDiscard,
  onClickCancel,
}: TrainingSessionInterfaceProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date().getTime());

  const activeActivity = activeSession.activeActivity;

  useEffect(() => {
    const intervallCallback = () => {
      setCurrentTime(new Date().getTime());
    };
    const interval = setInterval(intervallCallback, 500);
    intervallCallback();
    return () => clearInterval(interval);
  }, [activeSession]);

  const activeSessionStartTime = useMemo(() => {
    const date = activeSession.sessionPrototype.date;
    if (date === null) {
      return 0;
    }
    return new Date(date).getTime();
  }, [activeSession.sessionPrototype.date]);

  const sessionDuration = currentTime - activeSessionStartTime;

  function handleLogSet(reps: number, weight: number) {
    const updatedSession = produce(activeSession, (draft) => {
      draft.sessionPrototype.activities.push({
        type: "set",
        reps,
        weight,
      });
      draft.activeActivity = {
        type: "rest",
        startTime: new Date(currentTime).getTime(),
      };
    });
    onChange(updatedSession);
  }

  function handleChangeWeight(weight: number) {
    const updatedSession = produce(activeSession, (draft) => {
      draft.currentValues.weight = weight;
    });
    onChange(updatedSession);
  }

  function handleChangeReps(reps: number) {
    const updatedSession = produce(activeSession, (draft) => {
      draft.currentValues.reps = reps;
    });
    onChange(updatedSession);
  }

  function startSetAndEndRest(
    activeSession: ActiveTrainingSession,
  ): ActiveTrainingSession {
    const { activeActivity } = activeSession;
    return produce(activeSession, (draft) => {
      if (activeActivity?.type === "rest") {
        draft.sessionPrototype.activities.push({
          type: "rest",
          duration: currentTime - activeActivity.startTime,
        });
      }
      draft.activeActivity = {
        type: "set",
        startTime: currentTime,
      };
    });
  }

  function handleClickStartNextSet() {
    onChange(startSetAndEndRest(activeSession));
  }

  function handleClickStart() {
    let updatedActiveSession = produce(activeSession, (draft) => {
      draft.sessionPrototype.date = new Date(currentTime).toISOString();
    });
    updatedActiveSession = startSetAndEndRest(updatedActiveSession);
    onChange(updatedActiveSession);
  }

  return (
    <Stack spacing="lg" className={styles.trainingSessionInterface}>
      {activeActivity === null && (
        <>
          <h2 className={styles.classLeadingTrim}>New session</h2>
          <FormField label="Weight (kg)">
            <InputWeight
              weight={activeSession.currentValues.weight}
              onChange={handleChangeWeight}
            />
          </FormField>
          <div className={classButtonGroup}>
            <Button onClick={onClickCancel}>Cancel</Button>
            <Button variant="primary" onClick={handleClickStart}>
              Start
            </Button>
          </div>
        </>
      )}

      {activeActivity?.type === "rest" && (
        <>
          <h2 className={styles.classLeadingTrim}>
            Resting(
            {formatTime(currentTime - activeActivity.startTime)}
            )…
          </h2>
          <ChangeableWeight
            weight={activeSession.currentValues.weight}
            onChange={handleChangeWeight}
          />
          <div className={classButtonGroup}>
            <Button variant="primary" onClick={handleClickStartNextSet}>
              Start next set
            </Button>
          </div>
        </>
      )}

      {activeActivity?.type === "set" && (
        <ActivitySet
          currentWeight={activeSession.currentValues.weight}
          reps={activeSession.currentValues.reps}
          onChangeReps={handleChangeReps}
          onLogSet={handleLogSet}
        />
      )}

      {activeSession.sessionPrototype.activities.length > 0 && (
        <div>
          <h3 className={styles.classLeadingTrim}>Logged activities:</h3>

          <div className={styles.activities}>
            {activeSession.sessionPrototype.activities.map(
              (activity, index) => {
                const setNumber = activeSession.sessionPrototype.activities
                  .slice(0, index + 1)
                  .filter((a) => a.type === "set").length;
                return (
                  <Fragment key={index}>
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
                  </Fragment>
                );
              },
            )}
          </div>
        </div>
      )}

      {activeSession.sessionPrototype.activities.length > 0 && (
        <div className={classButtonGroup}>
          <Button onClick={onCommit}>Commit Session</Button>
          <Button onClick={onClickDiscard}>Discard</Button>
        </div>
      )}

      {isDebugEnabled && (
        <div>
          <h2>Debug</h2>
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

function ActivitySet({
  currentWeight,
  reps,
  onChangeReps,
  onLogSet,
}: {
  currentWeight: number;
  reps: number;
  onChangeReps: (reps: number) => void;
  onLogSet: (reps: number, weight: number) => void;
}) {
  function handleClickLogSet() {
    onLogSet(reps, currentWeight);
  }

  return (
    <>
      <h2 className={styles.classLeadingTrim}>Working({currentWeight}kg)…</h2>
      <FormField label="Reps count">
        <InputQuantity
          className={styles.inputRepsInput}
          value={reps}
          onChangeValue={onChangeReps}
        />
      </FormField>
      <div className={classButtonGroup}>
        <Button variant="primary" onClick={handleClickLogSet}>
          Log set
        </Button>
      </div>
    </>
  );
}
