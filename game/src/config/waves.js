export const WAVE_CONFIG = [
  // Wave 1
  { enemies: [{ type: 'octopus', count: 5, interval: 1500 }] },
  // Wave 2
  { enemies: [{ type: 'octopus', count: 8, interval: 1200 }] },
  // Wave 3
  { enemies: [{ type: 'octopus', count: 12, interval: 1000 }] },
  // Wave 4
  { enemies: [{ type: 'caterpillar', count: 8, interval: 800 }] },
  // Wave 5
  {
    enemies: [
      { type: 'caterpillar', count: 10, interval: 700 },
      { type: 'octopus', count: 5, interval: 1200 },
    ],
  },
  // Wave 6
  { enemies: [{ type: 'robot', count: 5, interval: 2000 }] },
  // Wave 7
  {
    enemies: [
      { type: 'robot', count: 6, interval: 1800 },
      { type: 'caterpillar', count: 8, interval: 600 },
    ],
  },
  // Wave 8
  { enemies: [{ type: 'jellyfish', count: 10, interval: 1000 }] },
  // Wave 9
  {
    enemies: [
      { type: 'jellyfish', count: 8, interval: 900 },
      { type: 'robot', count: 4, interval: 2000 },
      { type: 'octopus', count: 6, interval: 1000 },
    ],
  },
  // Wave 10 - BOSS
  {
    enemies: [
      { type: 'boss', count: 1, interval: 1000 },
      { type: 'octopus', count: 6, interval: 1500 },
    ],
  },
];
