export type StopType = "food" | "sight" | "travel";

export interface Swap {
  id: string;
  name: string;
  desc: string;
}

export interface Stop {
  id: string;
  time: string;
  type: StopType;
  name: string;
  detail: string;
  link?: string;
  chips: string[];
  swaps: Swap[];
}

export interface Day {
  id: string;
  sort_order: number;
  day: string;
  date: string;
  title: string;
  subtitle: string;
  blurb: string;
  stops: Stop[];
}

export interface CheckItem {
  id: string;
  sort_order: number;
  title: string;
  description: string;
  completed: boolean;
}
