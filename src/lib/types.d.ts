export interface Brand {
  id: number;
  slug: string;
  image_url: string;
};

export interface Section {
  id?: number;
  href?: string;
  name?: string;
  x?: number;
  y?: number;
  element?: HTMLElement;
  title?: HTMLHeadingElement;
  active?: boolean;
  lines?: HTMLElement[];
}

export interface HeaderSection extends Section {
  icon?: SVGGElement;
  track?: SVGPathElement;
  grad?: string;
  link?: string;
}

export interface SectionDict {
  [key: string | number]: Section;
};
