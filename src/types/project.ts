export interface IProjectItem {
  title: string;
  date: string;
  images: {
    src: string;
    alt: string;
  }[];
  description: {
    'sub-discription': string | string[];
    labels: {
      name: string;
      value: {
        type: string;
        data: string;
        title?: string;
      };
    }[];
  };
}

export interface IProjectItemType {
  [key: string]: {
    header: string;
    items: IProjectItem[];
  };
}
