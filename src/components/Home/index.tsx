import { Button, Stack } from "@sys42/ui";

import { TrackersList } from "../TrackersList";
import styles from "./styles.module.css";

export function Home({
  trackers,
  onClickTracker,
  onClickAddTracker,
}: {
  trackers: TrainingTracker[];
  onClickTracker: (tracker: TrainingTracker) => void;
  onClickAddTracker: () => void;
}) {
  return (
    <Stack className={styles.home}>
      <h1>Gym Trackers</h1>
      <TrackersList trackers={trackers} onClickItem={onClickTracker} />
      <Button variant="primary" onClick={onClickAddTracker}>
        Add tracker
      </Button>
    </Stack>
  );
}
