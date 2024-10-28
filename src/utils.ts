export function getNextIdForItems(items: { id: number }[]) {
  return items.length > 0
    ? items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
    : 1;
}

// XXX: improve and move to sys42/utils?
export function formatTime(time: number) {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  const formattedMinutes = remainingMinutes.toString().padStart(2, "0");
  const formattedHours = hours.toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
