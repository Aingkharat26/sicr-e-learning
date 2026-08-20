/** One segment of a row's bar — rows can have more than one, non-overlapping or not, to represent phases (e.g. "planning" then "in progress"). */
export interface SicCalendarTimelinePhase {
  id?: string | number;
  label?: string;
  description?: string;
  start: Date | string;
  end: Date | string;
  /** CSS color for the bar. Defaults to the theme primary color. */
  color?: string;
  avatarUrl?: string;
}

export interface SicCalendarTimelineRow<T = unknown> {
  id: string | number;
  label: string;
  avatarUrl?: string;
  /** 0-100. Shown in the label column's "Progress" cell when set. */
  progress?: number;
  phases: SicCalendarTimelinePhase[];
  /** Arbitrary passthrough data your own #labelTemplate/#phaseTemplate can read. */
  data?: T;
}
