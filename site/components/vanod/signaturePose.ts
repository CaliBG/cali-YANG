// Brand Lockup, motion study 10. Use its original spring and registration
// points on the 1280 × 600 stage, with scroll position as its clock.
const wordScale = 680 / 293.642;
export const wordTransform = `translate(300 ${300 - 71.601 * wordScale / 2}) scale(${wordScale})`;
const centers = [90, 143.5, 200.5, 261];

function spring(elapsed: number, duration: number) {
  if (elapsed <= 0) return 0;
  if (elapsed >= duration) return 1;
  const t = elapsed / duration;
  return 1 - Math.exp(-7.5 * t) * (Math.cos(13.5 * t) + 0.55 * Math.sin(13.5 * t));
}

export function markPose(progress: number) {
  const move = spring(progress * 2.1, 1.4);
  const x = 640 + (300 + 43.8252 * wordScale - 640) * move;
  const y = 300 + (35.15 - 71.601 / 2) * wordScale * move;
  const scale = 0.512 + (0.1377016 * wordScale - 0.512) * move;
  return `translate(${x} ${y}) scale(${scale}) translate(-527 -512)`;
}

export function letterPose(progress: number, index: number) {
  const appear = spring(progress * 2.1 - 0.6 - index * 0.1, 1.1);
  const x = centers[index] + (1 - appear) * 26;
  const y = 35.8 + (1 - appear) * 6;
  return {
    opacity: Math.max(0, Math.min(1, appear)),
    transform: `translate(${x} ${y}) scale(1 ${Math.max(0.02, appear)}) translate(${-centers[index]} -35.8)`,
  };
}
