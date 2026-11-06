const fallbackAsset = { url: '/images/brand/grm-leverkusen.jpg' };
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product, StoreOrder, JerseySize } from '@/types/store';
import { 
  X, 
  Package, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  RotateCcw,
  MessageCircle,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    products, 
    saveProduct, 
    deleteProduct, 
    settings, 
    updateSettings, 
    orders, 
    updateOrderStatus,
    resetToDefaults
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isAdminOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const startNewProduct = () => {
    const newProd: Product = {
      id: `grm-prod-${Date.now()}`,
      name: '',
      club: '',
      league: 'Outros',
      category: 'europeus',
      version: 'Torcedor',
      price: 149.90,
      compareAtPrice: 189.90,
      images: [fallbackAsset.url],
      description: 'Manto confeccionado em tecido AeroDry de alta tecnologia, toque macio e escudo em alta definição.',
      composition: '100% Poliéster Reciclado.',
      sizes: [
        { size: 'P', inStock: true, stockCount: 10 },
        { size: 'M', inStock: true, stockCount: 15 },
        { size: 'G', inStock: true, stockCount: 15 },
        { size: 'GG', inStock: true, stockCount: 8 },
        { size: 'XGG', inStock: true, stockCount: 4 },
        { size: '2XGG', inStock: false, stockCount: 0 },
      ],
      customizable: true,
      season: '2024/25',
      featured: false,
    };
    setEditingProduct(newProd);
    setIsCreatingNew(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) {
      alert('Informe o nome do produto.');
      return;
    }
    saveProduct(editingProduct);
    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-secondary backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-secondary border border-border rounded-lg  overflow-hidden my-auto text-foreground max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-secondary">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold font-display text-lg">
              G
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground uppercase  flex items-center gap-2">
                <span>Painel de Gestão GRM Sports</span>
                <span className="text-xs font-sans px-2 py-0.5 rounded bg-secondary text-foreground">
                  ADMIN
                </span>
              </h2>
              <p className="text-xs text-foreground">
                Gerencie catálogo, estoque de tamanhos, pedidos de clientes e informações comerciais
              </p>
            </div>
          </div>
          <Button variant="ghost"
            onClick={() => setIsAdminOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent text-foreground hover:text-primary transition-colors"
            aria-label="Fechar painel"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-secondary px-4 pt-2 gap-2 text-xs font-semibold">
          <Button variant="ghost"
            onClick={() => { setActiveTab('products'); setEditingProduct(null); }}
            className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-border text-foreground'
                : 'border-transparent text-foreground hover:text-primary'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos ({products.length})</span>
          </Button>

          <Button variant="ghost"
            onClick={() => { setActiveTab('orders'); setEditingProduct(null); }}
            className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-border text-foreground'
                : 'border-transparent text-foreground hover:text-primary'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos ({orders.length})</span>
          </Button>

          <Button variant="ghost"
            onClick={() => { setActiveTab('settings'); setEditingProduct(null); }}
            className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-border text-foreground'
                : 'border-transparent text-foreground hover:text-primary'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações da Loja</span>
          </Button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              {editingProduct ? (
                /* Edit/Create Product Form */
                <form onSubmit={handleSaveProductForm} className="space-y-4 max-w-3xl">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h3 className="text-sm font-bold text-foreground uppercase">
                      {isCreatingNew ? 'Novo Produto' : `Editar: ${editingProduct.name}`}
                    </h3>
                    <Button variant="ghost"
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-xs text-foreground hover:text-primary"
                    >
                      Cancelar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-foreground block mb-1 font-medium">Nome do Produto *</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-foreground block mb-1 font-medium">Clube / Time *</label>
                      <input
                        type="text"
                        value={editingProduct.club}
                        onChange={(e) => setEditingProduct({ ...editingProduct, club: e.target.value })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-foreground block mb-1 font-medium">Categoria</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                      >
                        <option value="brasileirao">Brasileirão BR</option>
                        <option value="premier_league">Premier League</option>
                        <option value="la_liga">La Liga</option>
                        <option value="serie_a">Serie A Italiano</option>
                        <option value="bundesliga">Bundesliga</option>
                        <option value="ligue_1">Ligue One FR</option>
                        <option value="selecoes">Seleções</option>
                        <option value="retro">Mantos Retrô</option>
                        <option value="europeus">Outros Europeus</option>
                        <option value="jogador">Versão Jogador</option>
                        <option value="corta_vento">Corta-Vento</option>
                        <option value="infantil">Infantil</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-foreground block mb-1 font-medium">Versão</label>
                      <select
                        value={editingProduct.version}
                        onChange={(e) => setEditingProduct({ ...editingProduct, version: e.target.value as any })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                      >
                        <option value="Torcedor">Torcedor</option>
                        <option value="Jogador">Jogador</option>
                        <option value="Retrô">Retrô</option>
                        <option value="Corta-Vento">Corta-Vento</option>
                        <option value="Casual">Casual</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-foreground block mb-1 font-medium">Preço (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-foreground block mb-1 font-medium">Preço Comparativo De (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.compareAtPrice || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: parseFloat(e.target.value) || undefined })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-sans"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-foreground block mb-1 font-medium">URL da Imagem Principal</label>
                      <input
                        type="text"
                        value={editingProduct.images[0] || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-sans"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-foreground block mb-1 font-medium">Descrição</label>
                      <textarea
                        rows={2}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                      />
                    </div>
                  </div>

                  {/* Stock Management by Size */}
                  <div className="pt-2 border-t border-border">
                    <label className="text-xs font-bold text-foreground block mb-2 uppercase">
                      Estoque por Tamanho
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                      {editingProduct.sizes.map((s, idx) => (
                        <div key={s.size} className="p-2.5 rounded-lg bg-secondary border border-border space-y-1">
                          <span className="font-sans font-bold text-foreground block">{s.size}</span>
                          <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={s.inStock}
                              onChange={(e) => {
                                const newSizes = [...editingProduct.sizes];
                                const current = newSizes[idx];
                                if (!current) return;
                                newSizes[idx] = { ...current, inStock: e.target.checked };
                                setEditingProduct({ ...editingProduct, sizes: newSizes });
                              }}
                            />
                            <span>Disponível</span>
                          </label>
                          <input
                            type="number"
                            placeholder="Qtd"
                            value={s.stockCount}
                            onChange={(e) => {
                              const newSizes = [...editingProduct.sizes];
                              const current = newSizes[idx];
                              if (!current) return;
                              newSizes[idx] = { ...current, stockCount: parseInt(e.target.value) || 0 };
                              setEditingProduct({ ...editingProduct, sizes: newSizes });
                            }}
                            className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-center font-sans text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button variant="ghost"
                      type="submit"
                      className="px-5 py-2.5 bg-secondary hover:bg-accent text-foreground font-bold text-xs uppercase rounded-lg transition-colors"
                    >
                      Salvar Produto
                    </Button>
                    <Button variant="ghost"
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2.5 bg-secondary text-foreground text-xs rounded-lg"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                /* Products Table */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground uppercase">Mantos Cadastrados</h3>
                      <p className="text-xs text-foreground">Total de {products.length} itens no catálogo</p>
                    </div>
                    <Button variant="ghost"
                      onClick={startNewProduct}
                      className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-accent text-foreground font-bold text-xs rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Manto</span>
                    </Button>
                  </div>

                  <div className="border border-border rounded-md overflow-hidden bg-secondary">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary border-b border-border text-foreground uppercase font-sans text-xs">
                        <tr>
                          <th className="py-2.5 px-3">Manto</th>
                          <th className="py-2.5 px-3">Categoria</th>
                          <th className="py-2.5 px-3">Preço</th>
                          <th className="py-2.5 px-3">Tamanhos em Estoque</th>
                          <th className="py-2.5 px-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-accent">
                            <td className="py-2.5 px-3 flex items-center gap-2.5">
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-9 h-9 rounded object-cover bg-secondary shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <strong className="text-foreground block line-clamp-1">{p.name}</strong>
                                <span className="text-xs text-foreground">{p.club} · {p.season}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-foreground uppercase font-sans text-xs">
                              {p.category}
                            </td>
                            <td className="py-2.5 px-3 font-sans font-bold text-foreground">
                              R$ {p.price.toFixed(2).replace('.', ',')}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex gap-1">
                                {p.sizes.filter(s => s.inStock).map(s => (
                                  <span key={s.size} className="text-xs font-sans bg-secondary px-1 rounded text-foreground">
                                    {s.size}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button variant="ghost"
                                  onClick={() => setEditingProduct(p)}
                                  className="p-1 hover:text-primary text-foreground"
                                  title="Editar"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost"
                                  onClick={() => {
                                    if (confirm(`Excluir o manto "${p.name}"?`)) {
                                      deleteProduct(p.id);
                                    }
                                  }}
                                  className="p-1 hover:text-primary text-foreground"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button variant="ghost"
                      onClick={() => {
                        if (confirm('Restaurar catálogo inicial com os mantos originais?')) {
                          resetToDefaults();
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Catálogo Padrão</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase">Histórico de Pedidos</h3>
                <p className="text-xs text-foreground">
                  Acompanhe e atualize o status dos pedidos gerados na loja
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center border border-border rounded-md bg-secondary text-foreground text-xs">
                  Nenhum pedido registrado ainda. Quando um cliente finalizar uma compra, ele aparecerá aqui com todos os detalhes.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className="p-4 rounded-md bg-secondary border border-border text-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-base font-bold text-foreground">
                            {ord.orderNumber}
                          </span>
                          <span className="text-foreground font-sans">·</span>
                          <span className="text-foreground">
                            {new Date(ord.createdAt).toLocaleDateString('pt-BR')} às {new Date(ord.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-xs">Status:</span>
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                            className="bg-secondary border border-border text-xs text-foreground rounded px-2 py-1 font-semibold"
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Em Preparação">Em Preparação</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregue">Entregue</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Info & Address */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-foreground">
                        <div>
                          <strong className="text-foreground block">{ord.customer.name}</strong>
                          <span className="text-foreground block font-sans">WhatsApp: {ord.customer.phone}</span>
                          <span className="text-foreground block">
                            {ord.customer.street}, {ord.customer.number} {ord.customer.complement}
                          </span>
                          <span className="text-foreground block">
                            {ord.customer.district} - {ord.customer.city}/{ord.customer.state} · CEP {ord.customer.cep}
                          </span>
                        </div>

                        <div>
                          <strong className="text-foreground block mb-1">Itens do Pedido ({ord.items.length}):</strong>
                          <div className="space-y-1">
                            {ord.items.map((it, i) => (
                              <div key={i} className="text-xs text-foreground">
                                • {it.quantity}x {it.product.name} (Tam: {it.selectedSize})
                                {it.customization?.hasCustomization && (
                                  <span className="text-foreground ml-1">
                                    [{it.customization.name} #{it.customization.number}]
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-right">
                            <span className="text-foreground">Total: </span>
                            <strong className="font-sans text-sm text-foreground">
                              R$ {ord.total.toFixed(2).replace('.', ',')}
                            </strong>
                            <span className="text-xs text-foreground block uppercase">
                              Pagamento: {ord.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl text-xs">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase">Dados Comerciais & Atendimento</h3>
                <p className="text-foreground">
                  Configure o WhatsApp da loja para onde as mensagens de pedidos e clientes serão direcionadas.
                </p>
              </div>

              {savedNotice && (
                <div className="p-2.5 rounded-lg bg-secondary border border-border text-foreground font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Configurações atualizadas com sucesso!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-foreground block mb-1 font-medium">Nome da Marca</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-foreground block mb-1 font-medium">Instagram Oficial (@)</label>
                  <input
                    type="text"
                    value={settingsForm.instagram}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-foreground block mb-1 font-medium">
                    WhatsApp Internacional (Ex: 5511999999999) *
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-sans"
                    placeholder="55 + DDD + Número"
                  />
                  <span className="text-xs text-foreground mt-0.5 block">
                    Os cliques no botão de WhatsApp e pedidos irão para este número.
                  </span>
                </div>

                <div>
                  <label className="text-foreground block mb-1 font-medium">Exibição do WhatsApp</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappDisplay}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappDisplay: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-sans"
                  />
                </div>

                <div>
                  <label className="text-foreground block mb-1 font-medium">Chave PIX da Loja</label>
                  <input
                    type="text"
                    value={settingsForm.pixKey}
                    onChange={(e) => setSettingsForm({ ...settingsForm, pixKey: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-sans"
                  />
                </div>

                <div>
                  <label className="text-foreground block mb-1 font-medium">Beneficiário do PIX</label>
                  <input
                    type="text"
                    value={settingsForm.pixBeneficiary}
                    onChange={(e) => setSettingsForm({ ...settingsForm, pixBeneficiary: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-foreground block mb-1 font-medium">Texto do Banner Superior</label>
                  <input
                    type="text"
                    value={settingsForm.announcement}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-foreground block mb-1 font-medium">Mínimo para Frete Grátis (R$)</label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingMin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingMin: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-sans"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button variant="ghost"
                  type="submit"
                  className="px-5 py-2.5 bg-secondary hover:bg-accent text-foreground font-bold text-xs uppercase rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configurações</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
