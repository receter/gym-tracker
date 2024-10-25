import { Stack } from "@sys42/ui";

import styles from "./styles.module.css";

export function TrackersList({
  trackers,
  onItemClick,
}: {
  trackers: TrainingMachine[];
  onItemClick: (tracker: TrainingMachine) => void;
}) {
  return (
    <Stack className={styles.trackersList}>
      {trackers.map((tracker) => (
        <TrackersListItem
          key={tracker.id}
          tracker={tracker}
          onClick={() => onItemClick(tracker)}
        />
      ))}
    </Stack>
  );
}

export function TrackersListItem({
  tracker,
  onClick,
}: {
  tracker: TrainingMachine;
  onClick: () => void;
}) {
  return (
    <div className={styles.trackerListItem} onClick={onClick}>
      {tracker.name}
    </div>
  );
}
