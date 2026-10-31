import { Product, StoreSettings } from '@/types/store';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'GRM Sports',
  tagline: 'Estilo, conforto e qualidade premium · Camisas de Time',
  instagram: '@grm.sportsbr',
  instagramUrl: 'https://www.instagram.com/grm.sportsbr/',
  email: 'grm.sports00@gmail.com',
  logoUrl: '/src/assets/images/grm_sports_logo_1792028069749.jpg',
  whatsappNumber: '5565996637773',
  whatsappDisplay: '+55 65 99663-7773',
  pixKey: 'grm.sports00@gmail.com',
  pixKeyType: 'E-mail',
  pixBeneficiary: 'GRM SPORTS | CAMISAS DE TIME',
  announcement: 'ENTREGAS EM CUIABÁ E VÁRZEA GRANDE | PEDIDOS PELO WHATSAPP',
  freeShippingMin: 299,
  shippingStandardRate: 24.90,
  shippingExpressRate: 39.90,
};


import catalog from './products.json';
export const INITIAL_PRODUCTS = catalog as Product[];
