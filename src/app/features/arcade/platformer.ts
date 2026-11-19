export const GROUND = 174;
export const SHORT_GAP = 42;
export const LONG_GAP = 112;
const SECTIONS = [
  [SHORT_GAP, SHORT_GAP, SHORT_GAP, SHORT_GAP],
  [SHORT_GAP, SHORT_GAP, LONG_GAP],
  [LONG_GAP, LONG_GAP, SHORT_GAP],
] as const;

function makeCourse() {
  const ledges = [{ from: 0, to: 150 }];
  const markers: number[] = [];
  for (const [sectionIndex, gaps] of SECTIONS.entries()) {
    gaps.forEach((width, index) => {
      const from = ledges[ledges.length - 1].to + width;
      const separator = index === gaps.length - 1 && sectionIndex < SECTIONS.length - 1;
      ledges.push({ from, to: from + (separator ? 188 : 138) });
      if (separator) markers.push(from + 80);
    });
  }
  return { ledges, markers };
}

const course = makeCourse();
export const LEDGES = course.ledges;
export const MARKERS = course.markers;
export const COURSE_END = LEDGES[LEDGES.length - 1].to;
export const FINISH = COURSE_END - 45;
export const SCREEN_WIDTH = 500;
const FOOT = 8;

export interface MorsioRun {
  readonly x: number;
  readonly y: number;
  readonly velocity: number;
  readonly grounded: boolean;
  readonly facing: number;
  readonly falls: number;
  readonly checkpoint: number;
  readonly done: boolean;
}

export function startMorsio(falls = 0, checkpoint = 0): MorsioRun {
  const x = checkpoint ? MARKERS[checkpoint - 1] + 12 : 42;
  return { x, y: GROUND, velocity: 0, grounded: true, facing: 1, falls, checkpoint, done: false };
}

export function stepMorsio(run: MorsioRun, direction: number, jump: boolean, elapsed: number): MorsioRun {
  if (run.done) return run;
  const dt = Math.min(0.035, Math.max(elapsed, 0));
  const x = Math.max(18, Math.min(COURSE_END, run.x + direction * 205 * dt));
  const facing = direction || run.facing;
  const platform = LEDGES.some((ledge) => x + FOOT > ledge.from && x - FOOT < ledge.to);
  const velocity = (jump && run.grounded ? -480 : run.velocity) + 1220 * dt;
  const y = run.y + velocity * dt;
  if (velocity >= 0 && run.y <= GROUND && y >= GROUND && platform) {
    const checkpoint = Math.max(run.checkpoint, MARKERS.filter((marker) => x >= marker).length);
    return { ...run, x, y: GROUND, velocity: 0, grounded: true, facing, checkpoint, done: x >= FINISH };
  }
  if (y > 248) return startMorsio(run.falls + 1, run.checkpoint);
  return { ...run, x, y, velocity, grounded: false, facing };
}
