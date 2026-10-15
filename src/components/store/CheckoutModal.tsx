import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { StoreOrder, OrderCustomer } from '@/types/store';
import { 
  X, 
  CheckCircle2, 
  Truck, 
  MessageCircle, 
  QrCode, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartSubtotal, 
    cartDiscount, 
    cartTotal, 
    settings, 
    createOrder, 
    clearCart,
    generateOrderWhatsAppLink 
  } = useStore();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdOrder, setCreatedOrder] = useState<StoreOrder | null>(null);

  // Form State
  const [customer, setCustomer] = useState<OrderCustomer>({
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: 'SP',
  });

  const [shippingMethod, setShippingMethod] = useState<'PAC' | 'SEDEX' | 'GRATIS'>(() => {
    return cartSubtotal >= settings.freeShippingMin ? 'GRATIS' : 'PAC';
  });

  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'pix' | 'credit_card'>('whatsapp');
  const [notes, setNotes] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isCheckoutOpen) return null;

  // ViaCEP fetch
  const handleCepChange = async (val: string) => {
    const raw = val.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5, 8)}`;
    }
    setCustomer(prev => ({ ...prev, cep: formatted }));

    if (raw.length === 8) {
      try {
        setLoadingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setCustomer(prev => ({
            ...prev,
            street: data.logradouro || prev.street,
            district: data.bairro || prev.district,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch (e) {
        // Silent fallback if network/CORS blocks ViaCEP
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!customer.name.trim()) errors.name = 'Nome é obrigatório.';
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Informe o WhatsApp com DDD.';
    }
    if (!customer.cep.trim() || customer.cep.replace(/\D/g, '').length < 8) {
      errors.cep = 'CEP obrigatório.';
    }
    if (!customer.street.trim()) errors.street = 'Rua obrigatória.';
    if (!customer.number.trim()) errors.number = 'Número obrigatório.';
    if (!customer.district.trim()) errors.district = 'Bairro obrigatório.';
    if (!customer.city.trim()) errors.city = 'Cidade obrigatória.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Shipping Cost Calculation
  const isFreeShippingEligible = cartSubtotal >= settings.freeShippingMin;
  const shippingCost = isFreeShippingEligible 
    ? 0 
    : shippingMethod === 'SEDEX' 
      ? settings.shippingExpressRate 
      : settings.shippingStandardRate;

  // Final Total with payment discounts
  const finalSubtotalWithDiscount = cartTotal;
  const pixDiscount = paymentMethod === 'pix' ? (finalSubtotalWithDiscount * 0.05) : 0;
  const grandTotal = finalSubtotalWithDiscount - pixDiscount + shippingCost;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const order = createOrder(
      customer,
      paymentMethod,
      isFreeShippingEligible ? 'GRATIS' : shippingMethod,
      notes
    );

    setCreatedOrder(order);
    clearCart();
    setStep('success');
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-secondary backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-background border border-border rounded-lg  overflow-hidden my-auto text-foreground max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-background">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground uppercase ">
              {step === 'form' ? 'Finalização do Pedido' : 'Pedido preparado!'}
            </h2>
            <p className="text-xs text-foreground">
              {step === 'form' ? 'Preencha seus dados para envio e escolha a forma de pagamento' : 'Seu pedido foi registrado na loja'}
            </p>
          </div>
          <Button variant="ghost"
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent text-foreground hover:text-primary transition-colors"
            aria-label="Fechar checkout"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-background">
          {step === 'form' ? (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Step 1: Customer Data */}
              <div>
                <h3 className="text-xs font-sans uppercase  text-foreground font-bold mb-3 flex items-center gap-1.5">
                  <span>1. Dados Pessoais & Contato</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-foreground block mb-1 font-medium">Nome Completo *</label>
                    <input
                      type="text"
                      placeholder="Ex: João da Silva"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {formErrors.name && <p className="text-xs text-foreground mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-foreground block mb-1 font-medium">WhatsApp com DDD *</label>
                    <input
                      type="tel"
                      placeholder="Ex: (65) 99663-7773"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {formErrors.phone && <p className="text-xs text-foreground mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Address */}
              <div>
                <h3 className="text-xs font-sans uppercase  text-foreground font-bold mb-3 flex items-center gap-1.5">
                  <span>2. Endereço de Entrega</span>
                  {loadingCep && <span className="text-xs text-foreground font-normal">(Buscando CEP...)</span>}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-foreground block mb-1 font-medium">CEP *</label>
                    <input
                      type="text"
                      maxLength={9}
                      placeholder="00000-000"
                      value={customer.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {formErrors.cep && <p className="text-xs text-foreground mt-1">{formErrors.cep}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-foreground block mb-1 font-medium">Logradouro / Rua *</label>
                    <input
                      type="text"
                      placeholder="Rua, Avenida..."
                      value={customer.street}
                      onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {formErrors.street && <p className="text-xs text-foreground mt-1">{formErrors.street}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-foreground block mb-1 font-medium">Número *</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={customer.number}
                      onChange={(e) => setCustomer({ ...customer, number: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {formErrors.number && <p className="text-xs text-foreground mt-1">{formErrors.number}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-foreground block mb-1 font-medium">Complemento</label>
                    <input
                      type="text"
                      placeholder="Apto 42, Bloco B"
                      value={customer.complement}
                      onChange={(e) => setCustomer({ ...customer, complement: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-foreground block mb-1 font-medium">Bairro *</label>
                    <input
                      type="text"
                      placeholder="Centro"
                      value={customer.district}
                      onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {formErrors.district && <p className="text-xs text-foreground mt-1">{formErrors.district}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-foreground block mb-1 font-medium">Cidade *</label>
                    <input
                      type="text"
                      placeholder="São Paulo"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {formErrors.city && <p className="text-xs text-foreground mt-1">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-foreground block mb-1 font-medium">UF *</label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="SP"
                      value={customer.state}
                      onChange={(e) => setCustomer({ ...customer, state: e.target.value.toUpperCase() })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground uppercase font-sans placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Shipping Choice */}
              <div>
                <h3 className="text-xs font-sans uppercase  text-foreground font-bold mb-3 flex items-center gap-1.5">
                  <span>3. Opção de Envio</span>
                </h3>

                <div className="space-y-2">
                  {isFreeShippingEligible ? (
                    <div className="flex items-center justify-between p-3 rounded-md border border-border bg-secondary text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-foreground" />
                        <div>
                          <strong className="text-foreground block">Frete Grátis Qualificado</strong>
                          <span className="text-foreground text-xs">Prazo médio de 5 a 8 dias úteis</span>
                        </div>
                      </div>
                      <span className="font-sans font-bold text-foreground">R$ 0,00</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button variant="ghost"
                        type="button"
                        onClick={() => setShippingMethod('PAC')}
                        className={`flex items-center justify-between p-3 rounded-md border text-left text-xs transition-colors ${
                          shippingMethod === 'PAC'
                            ? 'bg-background border-border text-foreground'
                            : 'bg-background border-border text-foreground hover:border-primary'
                        }`}
                      >
                        <div>
                          <strong className="text-foreground block">PAC Econômico</strong>
                          <span className="text-xs text-foreground">5 a 8 dias úteis</span>
                        </div>
                        <span className="font-sans font-bold text-foreground">
                          R$ {settings.shippingStandardRate.toFixed(2).replace('.', ',')}
                        </span>
                      </Button>

                      <Button variant="ghost"
                        type="button"
                        onClick={() => setShippingMethod('SEDEX')}
                        className={`flex items-center justify-between p-3 rounded-md border text-left text-xs transition-colors ${
                          shippingMethod === 'SEDEX'
                            ? 'bg-background border-border text-foreground'
                            : 'bg-background border-border text-foreground hover:border-primary'
                        }`}
                      >
                        <div>
                          <strong className="text-foreground block">SEDEX Expresso</strong>
                          <span className="text-xs text-foreground">2 a 4 dias úteis</span>
                        </div>
                        <span className="font-sans font-bold text-foreground">
                          R$ {settings.shippingExpressRate.toFixed(2).replace('.', ',')}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Payment Method */}
              <div>
                <h3 className="text-xs font-sans uppercase  text-foreground font-bold mb-3 flex items-center gap-1.5">
                  <span>4. Método de Pagamento</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button variant="ghost"
                    type="button"
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`p-3 rounded-md border text-left transition-all ${
                      paymentMethod === 'whatsapp'
                        ? 'bg-secondary border-border text-foreground ring-1 ring-ring'
                        : 'bg-background border-border text-foreground hover:border-primary'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5 text-foreground mb-1" />
                    <strong className="text-xs block text-foreground">Fechar no WhatsApp</strong>
                    <span className="text-xs text-foreground leading-tight block mt-0.5">
                      Atendimento direto com confirmação
                    </span>
                  </Button>

                  <Button variant="ghost"
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-md border text-left transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-secondary border-border text-foreground ring-1 ring-ring'
                        : 'bg-background border-border text-foreground hover:border-primary'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-foreground mb-1" />
                    <strong className="text-xs block text-foreground">PIX (5% OFF)</strong>
                    <span className="text-xs text-foreground leading-tight block mt-0.5">
                      Desconto imediato de 5%
                    </span>
                  </Button>

                  <Button variant="ghost"
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-md border text-left transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'bg-secondary border-border text-foreground ring-1 ring-ring'
                        : 'bg-background border-border text-foreground hover:border-primary'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-foreground mb-1" />
                    <strong className="text-xs block text-foreground">Cartão de Crédito</strong>
                    <span className="text-xs text-foreground leading-tight block mt-0.5">
                      Em até 3x sem juros
                    </span>
                  </Button>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="text-xs text-foreground block mb-1 font-medium">Observações adicionais (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Instruções de entrega, horário preferido..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Order Summary Recap */}
              <div className="p-3.5 rounded-md bg-background border border-border space-y-1.5 text-xs">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal ({cart.length} itens):</span>
                  <span className="font-sans text-foreground">R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-foreground">
                    <span>Desconto Cupom:</span>
                    <span className="font-sans">-R$ {cartDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                {paymentMethod === 'pix' && pixDiscount > 0 && (
                  <div className="flex justify-between text-foreground">
                    <span>Desconto 5% PIX:</span>
                    <span className="font-sans">-R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-foreground">
                  <span>Frete ({isFreeShippingEligible ? 'Grátis' : shippingMethod}):</span>
                  <span className="font-sans text-foreground">{shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                  <span>Total a Pagar:</span>
                  <span className="font-sans text-lg text-foreground">R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <Button variant="default"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-md bg-gradient-   hover: hover: text-foreground font-bold text-sm uppercase  transition-all  -600/30 active:scale-98"
              >
                <span>Concluir e Gerar Pedido</span>
              </Button>
            </form>
          ) : (
            /* Order Success View */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto text-foreground">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-sans uppercase  text-foreground font-bold block mb-1">
                  Pedido Registrado com Sucesso!
                </span>
                <h3 className="text-2xl font-display font-extrabold text-foreground">
                  {createdOrder?.orderNumber}
                </h3>
                <p className="text-xs text-foreground max-w-sm mx-auto mt-2 leading-relaxed">
                  Muito obrigado, <strong>{createdOrder?.customer.name}</strong>! Envie seu pedido pelo WhatsApp para confirmar disponibilidade e pagamento.
                </p>
              </div>

              {/* PIX instructions if chosen */}
              {createdOrder?.paymentMethod === 'pix' && (
                <div className="p-4 rounded-md bg-background border border-border text-left max-w-md mx-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-foreground" />
                      <span>Pagamento via PIX</span>
                    </span>
                    <span className="text-xs font-sans font-bold text-foreground">
                      R$ {createdOrder.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="bg-background p-2.5 rounded-md border border-border flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-foreground block">Chave PIX ({settings.pixKeyType}):</span>
                      <span className="font-sans text-xs text-foreground select-all truncate block">
                        {settings.pixKey}
                      </span>
                    </div>
                    <Button variant="ghost"
                      type="button"
                      onClick={copyPixKey}
                      className="px-2.5 py-1.5 bg-secondary hover:bg-accent text-xs font-semibold text-foreground rounded-lg flex items-center gap-1 shrink-0"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </Button>
                  </div>

                  <div className="text-xs text-foreground">
                    Beneficiário: <strong className="text-foreground">{settings.pixBeneficiary}</strong>
                  </div>
                </div>
              )}

              {/* Primary Action: Send to WhatsApp */}
              {createdOrder && (
                <div className="space-y-3 max-w-md mx-auto pt-2">
                  <a
                    href={generateOrderWhatsAppLink(createdOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-md bg-gradient-   hover: hover: text-foreground font-bold text-sm uppercase  transition-all  -600/30 active:scale-98"
                  >
                    <MessageCircle className="w-5 h-5 fill-foreground stroke-none" />
                    <span>Enviar Pedido pelo WhatsApp</span>
                  </a>

                  <p className="text-xs text-foreground leading-normal">
                    Ao clicar no botão acima, uma mensagem com todos os detalhes do seu pedido será aberta no WhatsApp da GRM Sports ({settings.whatsappDisplay}) para validação do estoque e envio.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Button variant="ghost"
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-xs text-foreground hover:text-primary transition-colors"
                >
                  Voltar para a Loja
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
