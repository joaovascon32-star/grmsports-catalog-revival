import { createFileRoute } from '@tanstack/react-router';
import { StoreProvider } from '@/context/StoreContext';
import { Storefront } from '@/components/store/Storefront';
const banner = { url: '/images/banners/grm-football-banner.jpg' };

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'GRM Sports — Camisas de futebol' },
    { name: 'description', content: 'Camisas dos principais clubes do Brasil e do mundo. Explore o catálogo GRM Sports, escolha sua camisa e peça pelo WhatsApp.' },
    { property: 'og:title', content: 'GRM Sports — Camisas de futebol' },
    { property: 'og:description', content: 'Seu time. Sua história. Encontre seu próximo manto na GRM Sports.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    ...(banner.url.startsWith('https://') ? [{ property: 'og:image', content: banner.url }, { name: 'twitter:image', content: banner.url }] : []),
  ] }),
  component: Index,
});

function Index() { return <StoreProvider><Storefront /></StoreProvider>; }
