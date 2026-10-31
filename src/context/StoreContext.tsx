import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  StoreSettings, 
  StoreOrder, 
  ProductCategory, 
  JerseySize, 
  CustomizationData, 
  PatchOption 
} from '../types/store';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialCatalog';

interface StoreContextType {
  products: Product[];
  settings: StoreSettings;
  cart: CartItem[];
  orders: StoreOrder[];
  selectedCategory: ProductCategory;
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name';
  activeProductModal: Product | null;
  isCartOpen: boolean;
  isSizeGuideOpen: boolean;
  isCheckoutOpen: boolean;
  isAdminOpen: boolean;
  activeCoupon: { code: string; percent: number; fixed: number } | null;
  
  // Actions
  setSelectedCategory: (cat: ProductCategory) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (sort: 'featured' | 'price-asc' | 'price-desc' | 'name') => void;
  openProductModal: (p: Product) => void;
  closeProductModal: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsSizeGuideOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  
  // Cart Actions
  addToCart: (
    product: Product, 
    size: JerseySize, 
    customization?: CustomizationData, 
    patches?: PatchOption[], 
    quantity?: number
  ) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Computed values
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  cartCount: number;
  remainingForFreeShipping: number;
  
  // Order actions
  createOrder: (
    customer: StoreOrder['customer'], 
    paymentMethod: StoreOrder['paymentMethod'], 
    shippingMethod: StoreOrder['shippingMethod'],
    notes?: string
  ) => StoreOrder;
  updateOrderStatus: (orderId: string, status: StoreOrder['status']) => void;
  
  // Admin actions
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  resetToDefaults: () => void;
  
  // WhatsApp Link Builder
  generateWhatsAppLink: (product?: Product, size?: string, customText?: string) => string;
  generateOrderWhatsAppLink: (order: StoreOrder) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'grm_sports_products_v5',
  SETTINGS: 'grm_sports_settings_v5',
  CART: 'grm_sports_cart_v5',
  ORDERS: 'grm_sports_orders_v5',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Orders
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  // Navigation & Modals State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; percent: number; fixed: number } | null>(null);

  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const c = localStorage.getItem(STORAGE_KEYS.CART);
      const o = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (p) {
        const cached: Product[] = JSON.parse(p);
        // Fill photos added to the source catalogue after the device cached it
        setProducts(cached.map(cp => {
          if (cp.images?.length) return cp;
          const src = INITIAL_PRODUCTS.find(ip => ip.id === cp.id);
          return src?.images?.length ? { ...cp, images: src.images } : cp;
        }));
      }
      if (s) {
        const cachedSettings = { ...INITIAL_SETTINGS, ...JSON.parse(s) };
        // Devices that cached the previous destination keep reaching the current number
        if (cachedSettings.whatsappNumber === '5565996637773') {
          cachedSettings.whatsappNumber = INITIAL_SETTINGS.whatsappNumber;
          cachedSettings.whatsappDisplay = INITIAL_SETTINGS.whatsappDisplay;
        }
        setSettings(cachedSettings);
      }
      if (c) setCart(JSON.parse(c));
      if (o) setOrders(JSON.parse(o));
    } catch { /* damaged device cache falls back to source catalog */ }
    setRestored(true);
  }, []);
  // Sync to LocalStorage
  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products, restored]);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings, restored]);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart, restored]);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders, restored]);

  // Cart Calculation Helpers
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitTotal * item.quantity), 0);
  
  let cartDiscount = 0;
  if (activeCoupon) {
    if (activeCoupon.percent > 0) {
      cartDiscount = (cartSubtotal * activeCoupon.percent) / 100;
    } else if (activeCoupon.fixed > 0) {
      cartDiscount = Math.min(activeCoupon.fixed, cartSubtotal);
    }
  }

  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, settings.freeShippingMin - cartSubtotal);

  // Cart Handlers
  const addToCart = (
    product: Product, 
    size: JerseySize, 
    customization?: CustomizationData, 
    patches: PatchOption[] = [], 
    quantity = 1
  ) => {
    // Calculate unit price with extras
    let unitTotal = product.price;
    if (customization && customization.hasCustomization) {
      unitTotal += customization.price || 20;
    }
    patches.forEach(p => {
      unitTotal += p.price;
    });

    const cartItemId = `${product.id}-${size}-${customization?.hasCustomization ? customization.name + customization.number : 'std'}-${patches.map(p => p.id).sort().join(',')}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev, 
        {
          cartItemId,
          product,
          selectedSize: size,
          quantity,
          customization,
          selectedPatches: patches,
          unitTotal
        }
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: qty } : item));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'GRM10') {
      setActiveCoupon({ code: 'GRM10', percent: 10, fixed: 0 });
      return { success: true, message: 'Cupom GRM10 aplicado! 10% de desconto.' };
    }
    if (cleanCode === 'PRIMEIRACOMPRA') {
      setActiveCoupon({ code: 'PRIMEIRACOMPRA', percent: 0, fixed: 20 });
      return { success: true, message: 'Cupom de R$ 20,00 aplicado com sucesso!' };
    }
    if (cleanCode === 'LEOVERKUSEN') {
      setActiveCoupon({ code: 'LEOVERKUSEN', percent: 15, fixed: 0 });
      return { success: true, message: 'Cupom especial de 15% aplicado!' };
    }
    return { success: false, message: 'Cupom inválido ou expirado.' };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Modals
  const openProductModal = (product: Product) => {
    setActiveProductModal(product);
  };

  const closeProductModal = () => {
    setActiveProductModal(null);
  };

  // Orders
  const createOrder = (
    customer: StoreOrder['customer'], 
    paymentMethod: StoreOrder['paymentMethod'],
    shippingMethod: StoreOrder['shippingMethod'],
    notes?: string
  ): StoreOrder => {
    const shippingCost = shippingMethod === 'GRATIS' 
      ? 0 
      : shippingMethod === 'SEDEX' 
        ? settings.shippingExpressRate 
        : settings.shippingStandardRate;

    const newOrder: StoreOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: `GRM-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      customer,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount + (paymentMethod === 'pix' ? cartTotal * 0.05 : 0),
      shippingCost,
      shippingMethod,
      total: cartTotal * (paymentMethod === 'pix' ? 0.95 : 1) + shippingCost,
      paymentMethod,
      status: 'Pendente',
      notes,
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: StoreOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Admin operations
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveProduct = (product: Product) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = product;
        return updated;
      }
      return [product, ...prev];
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  // WhatsApp Formatters
  const generateWhatsAppLink = (product?: Product, size?: string, customText?: string) => {
    const phone = settings.whatsappNumber.replace(/\D/g, '') || '5511999999999';
    let text = '';
    
    if (customText) {
      text = customText;
    } else if (product) {
      text = `Olá ${settings.storeName}! Gostaria de informações sobre o produto:\n\n👕 *${product.name}*\n💰 Preço: R$ ${product.price.toFixed(2).replace('.', ',')}\n${size ? `📏 Tamanho de interesse: ${size}\n` : ''}🔗 Link da loja: ${window.location.origin}\n\nEstá disponível a pronta entrega ou sob encomenda?`;
    } else {
      text = `Olá equipe ${settings.storeName}! Acessei a loja virtual oficial (${settings.instagram}) e gostaria de tirar uma dúvida sobre mantos e pedidos.`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const generateOrderWhatsAppLink = (order: StoreOrder) => {
    const phone = settings.whatsappNumber.replace(/\D/g, '') || '5511999999999';
    
    const itemsList = order.items.map((item, i) => {
      let customLine = '';
      if (item.customization && item.customization.hasCustomization) {
        customLine = `\n   ✍️ Personalização: *${item.customization.name} #${item.customization.number}* (+R$ 20,00)`;
      }
      let patchesLine = '';
      if (item.selectedPatches && item.selectedPatches.length > 0) {
        patchesLine = `\n   🏷️ Patches: ${item.selectedPatches.map(p => p.name).join(', ')}`;
      }
      return `${i + 1}. *${item.product.name}*\n   Tamanho: *${item.selectedSize}* | Qtd: *${item.quantity}x* | R$ ${item.unitTotal.toFixed(2).replace('.', ',')}${customLine}${patchesLine}`;
    }).join('\n\n');

    const paymentLabel = order.paymentMethod === 'pix' 
      ? 'PIX (com 5% OFF)' 
      : order.paymentMethod === 'credit_card' 
        ? 'Cartão de Crédito' 
        : 'Combinar no WhatsApp';

    const text = `⚽ *NOVO PEDIDO #${order.orderNumber} - ${settings.storeName}*\n` +
      `📅 Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')} às ${new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
      `👤 *DADOS DO CLIENTE:*\n` +
      `Nome: ${order.customer.name}\n` +
      `WhatsApp: ${order.customer.phone}\n` +
      `Endereço: ${order.customer.street}, nº ${order.customer.number}${order.customer.complement ? ' (' + order.customer.complement + ')' : ''}\n` +
      `Bairro: ${order.customer.district} - ${order.customer.city}/${order.customer.state}\n` +
      `CEP: ${order.customer.cep}\n\n` +
      `📦 *ITENS DO PEDIDO:*\n${itemsList}\n\n` +
      `──────────────────\n` +
      `Subtotal: R$ ${order.subtotal.toFixed(2).replace('.', ',')}\n` +
      (order.discount > 0 ? `Desconto: -R$ ${order.discount.toFixed(2).replace('.', ',')}\n` : '') +
      `Frete (${order.shippingMethod}): ${order.shippingCost === 0 ? 'GRÁTIS' : `R$ ${order.shippingCost.toFixed(2).replace('.', ',')}`}\n` +
      `*TOTAL: R$ ${order.total.toFixed(2).replace('.', ',')}*\n` +
      `Forma de Pagamento: *${paymentLabel}*\n` +
      (order.notes ? `\n📝 Observações: ${order.notes}\n` : '') +
      `\nPor favor, confirmem a disponibilidade dos itens e chave de pagamento! Obrigado.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        settings,
        cart,
        orders,
        selectedCategory,
        searchQuery,
        sortBy,
        activeProductModal,
        isCartOpen,
        isSizeGuideOpen,
        isCheckoutOpen,
        isAdminOpen,
        activeCoupon,
        setSelectedCategory,
        setSearchQuery,
        setSortBy,
        openProductModal,
        closeProductModal,
        setIsCartOpen,
        setIsSizeGuideOpen,
        setIsCheckoutOpen,
        setIsAdminOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        cartCount,
        remainingForFreeShipping,
        createOrder,
        updateOrderStatus,
        updateSettings,
        saveProduct,
        deleteProduct,
        resetToDefaults,
        generateWhatsAppLink,
        generateOrderWhatsAppLink,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
