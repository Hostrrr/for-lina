export const FLOWER_OPTIONS = [
  {
    id: "roses",
    name: "Розы",
    emoji: "🌹",
    blurb: "Классика. Красные и честные.",
  },
  {
    id: "lilies",
    name: "Лилии",
    emoji: "🪷",
    blurb: "Нежно, тихо и красиво.",
  },
  {
    id: "secret",
    name: "Секретные",
    emoji: "✨",
    blurb: "Сюрприз от меня. Увидишь сама.",
  },
] as const;

export type FlowerId = (typeof FLOWER_OPTIONS)[number]["id"];
