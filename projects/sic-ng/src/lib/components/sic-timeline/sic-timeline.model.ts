export interface SicTimelineItem {
  title?: string;
  date?: string;
  description?: string;
  /** Accent color for this entry's circle/text — any CSS color value. */
  color?: string;
  /** Shown inside the circle instead of the 1-based index. */
  icon?: string;
}
