// Urutan workflow resmi PANORAMA
export const WORKFLOW_ORDER = [
  "WAITING",
  "ENTRY",
  "TRANSPORT",
  "PACKAGING",
  "READY",
  "COMPLETED",
];

export function getNextStage(currentStage) {
  const index = WORKFLOW_ORDER.indexOf(currentStage);
  if (index === -1) return null;
  return WORKFLOW_ORDER[index + 1] || null;
}

export function isValidTransition(current, next) {
  if (next === "CANCELLED") return true;
  return getNextStage(current) === next;
}

