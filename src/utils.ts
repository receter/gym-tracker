export function getNextIdForItems(items: { id: number }[]) {
  return items.length > 0
    ? items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
    : 1;
}
