import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag, 
  Check 
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal, 
    cartDiscount, 
    cartTotal, 
    cartCount,
    remainingForFreeShipping,
    settings,
    applyCoupon,
    removeCoupon,
    activeCoupon,
    setIsCheckoutOpen
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponFeedback({
      text: res.message,
      isError: !res.success
    });
    if (res.success) {
      setCouponCode('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const freeShippingPercent = Math.min(100, Math.round((cartSubtotal / settings.freeShippingMin) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-secondary backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-secondary border-l border-border h-full flex flex-col  animate-in slide-in- duration-200 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-foreground" />
            <h2 className="text-base font-bold text-foreground uppercase ">
              Sacola de Compras ({cartCount})
            </h2>
          </div>
          <Button variant="ghost"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent text-foreground hover:text-primary transition-colors"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-background px-5 py-3 border-b border-border">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-foreground">
              <Truck className="w-3.5 h-3.5 text-foreground" />
              {remainingForFreeShipping > 0 ? (
                <>Faltam <strong className="text-foreground font-sans">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</strong> para frete grátis</>
              ) : (
                <strong className="text-foreground">🎉 Parabéns! Você ganhou Frete Grátis!</strong>
              )}
            </span>
            <span className="font-sans text-xs text-foreground">{freeShippingPercent}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-   h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-background">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-foreground">
              <ShoppingBag className="w-14 h-14 text-foreground stroke-1 mb-3" />
              <p className="text-base font-semibold text-foreground">Sua sacola está vazia</p>
              <p className="text-xs text-foreground max-w-xs mt-1">
                Explore o catálogo de mantos e escolha os seus mantos favoritos.
              </p>
              <Button variant="ghost"
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-5 py-2.5 rounded-md bg-secondary hover:bg-accent text-foreground font-bold text-xs uppercase  transition-all  -600/30"
              >
                Ver Mantos
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.cartItemId}
                className="flex gap-3.5 p-3 rounded-md bg-background border border-border relative group"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-md overflow-hidden bg-image-surface border border-border shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="jersey-image"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-foreground line-clamp-1 leading-snug">
                      {item.product.name}
                    </h3>
                    <Button variant="ghost"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-foreground hover:text-primary transition-colors p-0.5"
                      title="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Size and custom tags */}
                  <div className="text-xs text-foreground mt-1 space-y-0.5">
                    <div>
                      <span>Tamanho: </span>
                      <strong className="text-foreground font-sans">{item.selectedSize}</strong>
                    </div>

                    {item.customization?.hasCustomization && (
                      <div className="text-foreground font-sans text-xs">
                        ✍️ {item.customization.name} #{item.customization.number} (+R$ 20,00)
                      </div>
                    )}

                    {item.selectedPatches && item.selectedPatches.length > 0 && (
                      <div className="text-foreground text-xs">
                        🏷️ {item.selectedPatches.map(p => p.name).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Stepper & Price Row */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-border rounded-lg bg-background">
                      <Button variant="ghost"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 hover:text-primary text-foreground transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="px-2 text-xs font-sans font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <Button variant="ghost"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 hover:text-primary text-foreground transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Total for item */}
                    <span className="font-sans text-sm font-bold text-foreground">
                      R$ {(item.unitTotal * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer (if items present) */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-border bg-background space-y-3">
            {/* Coupon Box */}
            <div>
              {activeCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary border border-border text-xs">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Cupom <strong>{activeCoupon.code}</strong> ativo</span>
                  </div>
                  <Button variant="ghost"
                    onClick={removeCoupon}
                    className="text-xs text-foreground hover:text-primary"
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Possui cupom? (ex: GRM10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground uppercase font-sans placeholder:text-muted-foreground focus:outline-none focus:border-primary w-full"
                  />
                  <Button variant="ghost"
                    type="submit"
                    className="px-3 py-1.5 bg-secondary hover:bg-accent text-xs font-semibold text-foreground rounded-md transition-colors shrink-0"
                  >
                    Aplicar
                  </Button>
                </form>
              )}
              {couponFeedback && (
                <p className={`text-xs mt-1 ${couponFeedback.isError ? 'text-foreground' : 'text-foreground'}`}>
                  {couponFeedback.text}
                </p>
              )}
            </div>

            {/* Subtotal & Discount calculations */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-border">
              <div className="flex justify-between text-foreground">
                <span>Subtotal:</span>
                <span className="font-sans text-foreground">
                  R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-foreground">
                  <span>Desconto Cupom:</span>
                  <span className="font-sans font-bold">
                    -R$ {cartDiscount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t border-border">
                <span>Total Estimado:</span>
                <span className="font-sans text-lg text-foreground">
                  R$ {cartTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Checkout Action CTA */}
            <Button variant="default"
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-md bg-gradient-   hover: hover: text-foreground font-bold text-sm uppercase  transition-all  -600/30 active:scale-98"
            >
              <span>Avançar para o Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
