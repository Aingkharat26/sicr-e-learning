export interface SicCardStackItem<T = unknown> {
  id?: string | number;
  title?: string;
  description?: string;
  imageUrl?: string;
  /** Small pill shown top-left of the image, e.g. "01". */
  label?: string;
  /** Small pill shown top-right of the image, e.g. "6 min read". */
  meta?: string;
  location?: string;
  data?: T;
}
