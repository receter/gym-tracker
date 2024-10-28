import styles from "./styles.module.css";

export function TrackersList({
  trackers,
  onItemClick,
}: {
  trackers: TrainingMachine[];
  onItemClick: (tracker: TrainingMachine) => void;
}) {
  return (
    <div className={styles.trackersList}>
      {trackers.map((tracker) => (
        <TrackersListItem
          key={tracker.id}
          tracker={tracker}
          onClick={() => onItemClick(tracker)}
        />
      ))}
    </div>
  );
}

export function TrackersListItem({
  tracker,
  onClick,
}: {
  tracker: TrainingTracker;
  onClick: () => void;
}) {
  return (
    <div className={styles.trackerListItem} onClick={onClick}>
      <div className={styles.trackerListItemName}>{tracker.name}</div>
      <div className={styles.trackerListItemSub}>
        {tracker.sessions.length} Sessions
      </div>
    </div>
  );
}
