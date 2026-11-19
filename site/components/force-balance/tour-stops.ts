export const stops = [
  {
    key: 0, start: 0, anchor: [0, 0.44, 0.30],
    zh: ["全景", "力量与平衡", "一把倾斜的榔头悬在钉阵上方。先看整个装置，再沿着底板进入它的内部。"],
    en: ["Overview", "Force & balance", "A tilted hammer hangs above a field of nails. Follow the board from the whole sculpture into the space beneath the hammer."],
  },
  {
    key: 2, start: 1.2, anchor: [-0.483, 0.428, 0.601],
    zh: ["钉头", "橙色钉头", "奶白色让工具的轮廓连成一体。钉头上留下的一点亮橙，像力经过之后残留的温度。"],
    en: ["Nail heads", "Orange nail head", "Cream paint brings the tools together as forms. A dot of orange on each nail head suggests the heat left by a passing force."],
  },
  {
    key: 4, start: 3.15, anchor: [-0.483, 0.428, -0.301],
    zh: ["穿行", "钉阵的间隙", "视线降到钉头以下，从两列钉子之间穿过。原本承受敲击的钉子，在这里围住并支撑了榔头。"],
    en: ["Passage", "Between the nails", "Dip below the nail heads and pass between two rows. The nails that would normally receive the blow now surround and support the hammer."],
  },
  {
    key: 8, start: 6.25, anchor: [0.68, 0.493, 0.002],
    zh: ["锤头", "停住的锤面", "举起榔头，下一刻就该敲下。橙色锤面停在半空，把注意力留在击打之前的那一瞬。"],
    en: ["Hammer", "The striking face", "The hammer introduces a familiar gesture. It has been raised to strike. Its orange face stops in midair, holding the instant before impact."],
  },
  {
    key: 11, start: 9.6, anchor: [-0.52, 1.11, 0.04],
    zh: ["悬停", "倾斜的锤柄", "沿锤柄向上，再回望底板。倾斜的重量与钉阵的支撑同时进入视野，动作停在冲动与克制之间。"],
    en: ["Suspension", "The raised handle", "Rise along the handle and look back at the base. The leaning weight and its supports come into view together, poised between impulse and restraint."],
  },
] as const;

export function stopAt(key: number) {
  const next = stops.findIndex(stop => stop.start > key);
  return next < 0 ? stops.length - 1 : Math.max(0, next - 1);
}
