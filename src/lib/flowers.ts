export const FLOWER_OPTIONS = [
  {
    id: "classic",
    name: "Классика",
    emoji: "🌷",
    blurb: "Нежный микс — когда хочется просто сказать «прости».",
  },
  {
    id: "roses",
    name: "Розы",
    emoji: "🌹",
    blurb: "Классика жанра. Красные, громкие, без лишних слов.",
  },
  {
    id: "mix",
    name: "Микс",
    emoji: "🌼",
    blurb: "Пусть курьер сам выберет. Я доверюсь вкусу флориста.",
  },
  {
    id: "big",
    name: "Большой жест",
    emoji: "💐",
    blurb: "Максимум цветов. Минимум сомнений.",
  },
] as const;

export type FlowerId = (typeof FLOWER_OPTIONS)[number]["id"];
