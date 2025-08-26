import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  classButtonGroup,
  FormField,
  OverflowMenu,
  OverflowMenuItem,
  Stack,
  TextInput,
} from "@sys42/ui";
import { produce } from "immer";
import { Fragment, useState } from "react";

import { formatTime } from "../../utils";
import { ResourceList } from "../ResourceList";
import styles from "./styles.module.css";

export function Tracker({
  tracker,
  onChange,
  onDelete,
  onBack,
  onClickNewSession,
}: {
  tracker: TrainingTracker;
  onChange: (tracker: TrainingTracker) => void;
  onDelete: (trackerId: number) => void;
  onBack: () => void;
  onClickNewSession: () => void;
}) {
  const [isEditingTracker, setIsEditingTracker] = useState(false);
  const [editedTracker, setEditedTracker] = useState<TrainingTracker | null>(
    null,
  );

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
          <OverflowMenuItem onClick={handleClickEditButton}>
            Edit name/description
          </OverflowMenuItem>
          <OverflowMenuItem
            className={styles.deleteTracker}
            onClick={handleClickDelete}
          >
            Delete tracker
          </OverflowMenuItem>
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
        <Button variant="primary" onClick={onClickNewSession}>
          New session
        </Button>
      </div>

      <ResourceList>
        {tracker.sessions.toReversed().map((session) => {
          const sessionStart = new Date(session.date);
          const sessionEnd = new Date(session.dateEnd);
          const sessionDuration = sessionEnd.getTime() - sessionStart.getTime();
          const formattedStartDate = sessionStart.toLocaleString();
          const restActivities = session.activities.filter(
            (activity) => activity.type === "rest",
          );
          const avarageRestDuration =
            restActivities.reduce(
              (sum, activity) => sum + activity.duration,
              0,
            ) / Math.max(1, restActivities.length);

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
                  {avarageRestDuration > 0 && (
                    <>
                      {", "}
                      Avg. resting{" "}
                      <span
                        className={styles.avarageRestDuration}
                        title="Avarage rest duration"
                      >
                        {formatTime(avarageRestDuration)}
                      </span>
                    </>
                  )}
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
