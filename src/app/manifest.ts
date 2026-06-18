import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orçamento Casamento',
    short_name: 'Orçamento',
    description: 'Controle financeiro dos fornecedores do seu casamento',
    start_url: '/',
    display: 'standalone',
    background_color: '#FCFCFC',
    theme_color: '#34A86F',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '256x256',
        type: 'image/x-icon',
      },
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
