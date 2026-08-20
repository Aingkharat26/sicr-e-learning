export interface SicImageSliderItem<T = unknown> {
  id?: string | number;
  imageUrl: string;
  alt?: string;
  caption?: string;
  data?: T;
}
