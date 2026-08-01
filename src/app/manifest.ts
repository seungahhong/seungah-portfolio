import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME.ko,
    short_name: SITE_NAME.ko,
    description: SITE_DESCRIPTION.ko,
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfbfd',
    theme_color: '#fbfbfd',
    lang: 'ko',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
