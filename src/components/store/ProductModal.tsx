import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product, JerseySize } from '@/types/store';
import { 
  X, 
  MessageCircle, 
  Ruler, 
  Truck, 
  ShieldCheck, 
} from 'lucide-react';

interface ProductModalContentProps {
  product: Product;
}

const ProductModalContent: React.FC<ProductModalContentProps> = ({ product }) => {
  const { 
    closeProductModal, 
    setIsSizeGuideOpen, 
    settings,
    generateWhatsAppLink 
  } = useStore();

  // Selected state
  const [selectedSize, setSelectedSize] = useState<JerseySize>(() => {
    const firstInStock = product.sizes.find(s => s.inStock);
    return firstInStock ? firstInStock.size : 'M';
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Error validation
  const [sizeError, setSizeError] = useState('');

  // Price calculations
  const basePrice = product.price;
  const totalUnitPrice = basePrice;
  const installmentValue = (totalUnitPrice / 3).toFixed(2).replace('.', ',');
  const pixPrice = (totalUnitPrice * 0.95).toFixed(2).replace('.', ',');

  const handleDirectWhatsApp = () => {
    const sizeObj = product.sizes.find(s => s.size === selectedSize);
    if (!sizeObj || !sizeObj.inStock) {
      setSizeError('Por favor selecione um tamanho disponível.');
      return;
    }

    const message = `Olá ${settings.storeName}! Gostaria de pedir este manto:\n\n` +
      `👕 *${product.name}*\n` +
      `📏 Tamanho: *${selectedSize}*\n` +
      `💰 Valor Unitário: R$ ${totalUnitPrice.toFixed(2).replace('.', ',')}` +
      `\n\n` +
      `Como posso prosseguir com o pagamento e envio? Obrigado!`;

    const link = generateWhatsAppLink(undefined, undefined, message);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-secondary backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-secondary border border-border rounded-lg  overflow-hidden my-auto text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Modal Button */}
        <Button variant="ghost"
          onClick={closeProductModal}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-secondary hover:bg-accent text-foreground hover:text-primary border border-border transition-colors"
          aria-label="Fechar detalhes"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Gallery & Live Jersey Preview */}
          <div className="relative bg-background p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border">
            <div className="jersey-gallery relative w-full max-w-md rounded-md overflow-hidden border border-border">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="jersey-image"
                referrerPolicy="no-referrer"
              />

              {product.badge && (
                <div className="absolute bottom-3 right-3 bg-secondary border border-border text-foreground text-xs font-sans uppercase font-black  px-2.5 py-1 rounded ">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Gallery Thumbnails Carousel */}
            {product.images && product.images.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto max-w-md w-full py-1">
                {product.images.map((img, idx) => (
                  <Button variant="ghost"
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Ver foto ${idx + 1} de ${product.name}`}
                    aria-pressed={selectedImageIndex === idx}
                    className={`relative w-14 h-14 p-0 bg-image-surface rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx 
                        ? 'border-border ring-2 ring-ring scale-105' 
                        : 'border-border hover:border-primary opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Foto ${idx + 1}`} 
                      className="jersey-image" 
                      referrerPolicy="no-referrer"
                    />
                  </Button>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3 text-xs text-foreground">
              <ShieldCheck className="w-4 h-4 text-foreground shrink-0" />
              <span>Garantia de 7 dias para trocas e qualidade tailandesa 1:1</span>
            </div>
          </div>

          {/* Right Column: PDP Purchase Module */}
          <div className="p-6 sm:p-7 flex flex-col max-h-[85vh] overflow-y-auto bg-background">
            {/* Club & League unboxed text */}
            <div className="flex items-center gap-2 text-xs font-sans uppercase  text-foreground font-semibold mb-1">
              <span>{product.club}</span>
              <span aria-hidden="true">·</span>
              <span>{product.league}</span>
              <span aria-hidden="true">·</span>
              <span>{product.season}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight mb-3">
              {product.name}
            </h2>

            {/* Price Box */}
            <div className="p-3.5 rounded-md bg-background border border-border mb-5">
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                  R$ {totalUnitPrice.toFixed(2).replace('.', ',')}
                </span>
                {product.compareAtPrice && (
                  <span className="font-sans text-sm text-foreground line-through tabular-nums">
                    R$ {(product.compareAtPrice).toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
              <div className="text-xs text-foreground mt-1">
                <span>ou 3x de </span>
                <strong className="text-foreground font-sans">R$ {installmentValue}</strong>
                <span> sem juros no cartão</span>
              </div>
              <div className="text-xs text-foreground font-medium mt-0.5">
                <span>R$ {pixPrice} no PIX (5% de desconto automático)</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase  text-foreground">
                  Tamanho Selecionado: <span className="text-foreground">{selectedSize}</span>
                </label>
                <Button variant="ghost"
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-xs text-foreground hover:text-primary transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Tabela de Medidas</span>
                </Button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s.size;
                  return (
                    <Button variant="ghost"
                      key={s.size}
                      type="button"
                      disabled={!s.inStock}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setSizeError('');
                      }}
                      className={`relative py-2.5 text-xs font-sans font-bold rounded-lg border transition-all ${
                        !s.inStock
                          ? 'bg-secondary border-border text-foreground line-through cursor-not-allowed'
                          : isSelected
                            ? 'bg-secondary border-border text-foreground  ring-2 ring-ring'
                            : 'bg-secondary border-border text-foreground hover:border-primary hover:text-primary'
                      }`}
                    >
                      {s.size}
                      {s.inStock && s.stockCount <= 5 && (
                        <span className="absolute -top-1.5 -right-1 w-2 h-2 rounded-full bg-secondary" title="Poucas unidades" />
                      )}
                    </Button>
                  );
                })}
              </div>
              {sizeError && (
                <p className="text-xs text-foreground mt-1.5 font-medium">{sizeError}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-5 text-xs text-foreground leading-relaxed border-t border-border pt-3">
              <p>{product.description}</p>
              <p className="mt-2 text-foreground font-sans text-xs">{product.composition}</p>
            </div>

            {/* Local delivery note */}
            <div className="mb-6 p-3 rounded-md bg-secondary border border-border flex gap-2 items-start text-xs text-muted-foreground leading-5">
              <Truck className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
              <span>Entregas apenas em <strong className="text-foreground">Cuiabá e Várzea Grande</strong>. Disponibilidade, entrega e pagamento são combinados pelo WhatsApp.</span>
            </div>

            {/* Primary Action */}
            <div className="mt-auto pt-2">
              <Button variant="default"
                onClick={handleDirectWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-md font-bold text-sm uppercase"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir pelo WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductModal: React.FC = () => {
  const { activeProductModal } = useStore();
  if (!activeProductModal) return null;
  return <ProductModalContent key={activeProductModal.id} product={activeProductModal} />;
};
