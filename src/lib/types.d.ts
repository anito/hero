export interface Brand {
  id: number;
  slug: string;
  image_url: string;
};

export interface Section {
  id?: string | number;
  href?: string;
  link?: string;
  name?: string;
  y?: number;
  element?: HTMLElement;
  title?: HTMLHeadingElement;
  active?: boolean;
  lines?: HTMLElement[];
}

export interface SectionDict {
  [key: string | number]: Section;
};
