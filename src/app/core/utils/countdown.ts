export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  complete: boolean;
}

export function countdownUntil(target: string, now: number): CountdownValue {
  const timestamp = Date.parse(target);
  if (!Number.isFinite(timestamp) || !Number.isFinite(now)) {
    throw new Error('Le compte à rebours nécessite des dates valides.');
  }

  const remaining = Math.max(0, Math.floor((timestamp - now) / 1000));
  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
    complete: now >= timestamp,
  };
}
