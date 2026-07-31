export type Screen =
  | "intro"
  | "howto-catch"
  | "catch"
  | "howto-memory"
  | "memory"
  | "howto-bouquet"
  | "bouquet"
  | "reveal"
  | "flowers";

export type Progress = {
  screen: Screen;
  catchDone: boolean;
  memoryDone: boolean;
  bouquetDone: boolean;
};

export const STORAGE_KEY = "for-lina-progress";

export const INITIAL_PROGRESS: Progress = {
  screen: "intro",
  catchDone: false,
  memoryDone: false,
  bouquetDone: false,
};
