export interface ICardItemProps {
  href: string;
  image: {
    src: string;
    alt: string;
    objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  };
  title: string;
  description?: string;
  date?: string;
}
