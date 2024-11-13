import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  classButtonGroup,
  FormField,
  OverflowMenu,
  Stack,
  TextInput,
} from "@sys42/ui";
import { produce } from "immer";
import { Fragment, useMemo, useState } from "react";

import { formatTime, getNextIdForItems } from "../../utils";
import { ResourceList } from "../ResourceList";
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
  const [isEditingTracker, setIsEditingTracker] = useState(false);
  const [editedTracker, setEditedTracker] = useState<TrainingTracker | null>(
    null,
  );

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

  function handleClickDiscardSession() {
    if (window.confirm("Are you sure you want to discard this session?")) {
      setActiveSession(null);
    }
  }

  function handleClickCancelSession() {
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

  function handleClickEditButton() {
    setEditedTracker(tracker);
    setIsEditingTracker(true);
  }

  function handleChangeEditedTrackerName(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (editedTracker) {
      setEditedTracker({ ...editedTracker, name: event.target.value });
    }
  }

  function handleChangeEditedTrackerDescription(
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    if (editedTracker) {
      setEditedTracker({ ...editedTracker, description: event.target.value });
    }
  }

  function handleSaveTracker(tracker: TrainingTracker) {
    onChange(tracker);
    setIsEditingTracker(false);
  }

  if (activeSession) {
    return (
      <TrainingSessionInterface
        defaultWeight={sessionDefaultWeight}
        defaultReps={sessionDefaultReps}
        session={activeSession}
        onChange={(session) => setActiveSession(session)}
        onCommit={handleCommitSession}
        onClickDiscard={handleClickDiscardSession}
        onClickCancel={handleClickCancelSession}
      />
    );
  }

  if (isEditingTracker && editedTracker) {
    return (
      <Stack className={styles.editTrackerContainer}>
        <h1>Edit tracker: {tracker.name}</h1>
        <FormField label="Name">
          {(ctx) => (
            <TextInput
              autoFocus
              id={ctx.htmlFor}
              value={editedTracker.name}
              onChange={handleChangeEditedTrackerName}
            />
          )}
        </FormField>
        <div>
          <textarea
            value={editedTracker.description}
            onChange={handleChangeEditedTrackerDescription}
          />
        </div>
        <div className={classButtonGroup}>
          <Button
            variant="primary"
            onClick={() => handleSaveTracker(editedTracker)}
          >
            Save
          </Button>
          <Button onClick={() => setIsEditingTracker(false)}>Cancel</Button>
        </div>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg" className={styles.tracker}>
      <div className={styles.trackerHeader}>
        <h1>{tracker.name}</h1>
        <OverflowMenu>
          <OverflowMenu.Item onClick={handleClickEditButton}>
            Edit name/description
          </OverflowMenu.Item>
          <OverflowMenu.Item
            className={styles.deleteTracker}
            onClick={handleClickDelete}
          >
            Delete tracker
          </OverflowMenu.Item>
        </OverflowMenu>
      </div>
      {tracker.description && (
        <div className={styles.trackerDescription}>
          {tracker.description.split("\n").map((line, index) => (
            <Fragment key={index}>
              {line}
              <br />
            </Fragment>
          ))}
        </div>
      )}
      <div className={classButtonGroup}>
        <Button className={styles.backButton} onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={handleClickStartSession}>
          New session
        </Button>
      </div>

      <ResourceList>
        {tracker.sessions.toReversed().map((session) => {
          const sessionStart = new Date(session.date);
          const sessionEnd = new Date(session.dateEnd);
          const sessionDuration = sessionEnd.getTime() - sessionStart.getTime();
          const formattedStartDate = sessionStart.toLocaleString();
          const avarageRestDuration =
            session.activities
              .filter((activity) => activity.type === "rest")
              .reduce((sum, activity) => sum + activity.duration, 0) /
            session.activities.filter((activity) => activity.type === "rest")
              .length;

          return (
            <ResourceList.Item key={session.date} className={styles.session}>
              <div>
                <div className={styles.sessionActivities}>
                  {session.activities.length === 0 && "0"}
                  {session.activities.map((activity, index) => (
                    <Fragment key={index}>
                      {activity.type === "rest" && (
                        <span className={styles.rest}>
                          {formatTime(activity.duration)}
                        </span>
                      )}
                      {activity.type === "set" && (
                        <span className={styles.set}>{activity.reps}</span>
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
                  Duration{" "}
                  <span
                    className={styles.sessionDuration}
                    title={formattedStartDate}
                  >
                    {formatTime(sessionDuration)}
                  </span>
                  {", "}
                  Avg. resting{" "}
                  <span
                    className={styles.avarageRestDuration}
                    title="Avarage rest duration"
                  >
                    {formatTime(avarageRestDuration)}
                  </span>
                </div>
              </div>
              <SessionWeight
                className={styles.sessionWeight}
                session={session}
              />
              <Button
                className={styles.deleteButton}
                onClick={() => handleDeleteSession(session.id)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>
            </ResourceList.Item>
          );
        })}
      </ResourceList>
    </Stack>
  );
}

function SessionWeight({
  session,
  className,
}: {
  session: TrainingTrackerSession;
  className?: string;
}) {
  const setWeights = session.activities.reduce(
    (weights, activity) =>
      activity.type === "set" ? [...weights, activity.weight] : weights,
    [] as number[],
  );
  const isAllSetWeightsEqual = setWeights.every(
    (weight) => weight === setWeights[0],
  );
  const minWeight = Math.min(...setWeights);
  const maxWeight = Math.max(...setWeights);

  // If not all sets are equal show like 10kg/12kg/10kg… in the title
  const title = !isAllSetWeightsEqual
    ? setWeights.map((t) => t + "kg").join("/")
    : undefined;

  return (
    <span className={className} title={title}>
      {isAllSetWeightsEqual
        ? setWeights[0] + "kg"
        : minWeight + "kg - " + maxWeight + "kg"}
    </span>
  );
}
