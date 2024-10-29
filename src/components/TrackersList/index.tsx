import { ResourceList } from "../ResourceList";
import styles from "./styles.module.css";

export function TrackersList({
  trackers,
  onClickItem: onItemClick,
}: {
  trackers: TrainingTracker[];
  onClickItem: (tracker: TrainingTracker) => void;
}) {
  return (
    <ResourceList className={styles.trackersList}>
      {trackers.map((tracker) => (
        <ResourceList.Item
          onClick={() => onItemClick(tracker)}
          key={tracker.id}
        >
          <div className={styles.trackerName}>{tracker.name}</div>
          <div className={styles.trackerSub}>
            {tracker.sessions.length} Sessions
          </div>
        </ResourceList.Item>
      ))}
    </ResourceList>
  );
}
