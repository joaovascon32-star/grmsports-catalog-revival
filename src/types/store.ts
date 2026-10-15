export type ProductCategory = 
  | 'inicio'
  | 'todos'
  | 'brasileirao'
  | 'premier_league'
  | 'la_liga'
  | 'serie_a'
  | 'bundesliga'
  | 'ligue_1'
  | 'selecoes'
  | 'retro'
  | 'europeus'
  | 'jogador'
  | 'corta_vento'
  | 'infantil';

export type ProductVersion = 'Torcedor' | 'Jogador' | 'Retrô' | 'Casual' | 'Corta-Vento';

export type JerseySize = 'P' | 'M' | 'G' | 'GG' | 'XGG' | '2XGG';

export interface SizeStock {
  size: JerseySize;
  inStock: boolean;
  stockCount: number;
}

export interface PatchOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  club: string;
  league: string;
  category: ProductCategory;
  version: ProductVersion;
  price: number;
  compareAtPrice?: number | undefined;
  images: string[];
  description: string;
  composition: string;
  sizes: SizeStock[];
  customizable: boolean;
  patchOptions?: PatchOption[] | undefined;
  featured?: boolean | undefined;
  badge?: string | undefined;
  season: string;
}

export interface CustomizationData {
  hasCustomization: boolean;
  name: string;
  number: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedSize: JerseySize;
  quantity: number;
  customization?: CustomizationData | undefined;
  selectedPatches: PatchOption[];
  unitTotal: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  instagram: string;
  instagramUrl: string;
  email: string;
  logoUrl: string;
  whatsappNumber: string; // international digits ex: 5565996637773
  whatsappDisplay: string;
  pixKey: string;
  pixKeyType: string;
  pixBeneficiary: string;
  announcement: string;
  freeShippingMin: number;
  shippingStandardRate: number;
  shippingExpressRate: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string | undefined;
  district: string;
  city: string;
  state: string;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  shippingMethod: 'PAC' | 'SEDEX' | 'GRATIS';
  total: number;
  paymentMethod: 'whatsapp' | 'pix' | 'credit_card';
  status: 'Pendente' | 'Confirmado' | 'Em Preparação' | 'Enviado' | 'Entregue' | 'Cancelado';
  notes?: string | undefined;
}
