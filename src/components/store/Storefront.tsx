import { useMemo, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Search, ShoppingBag, Menu, X, Instagram, MessageCircle, Truck, Ruler, LayoutGrid, List, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/context/StoreContext';
import type { ProductCategory } from '@/types/store';
import banner from '@/assets/banner.asset.json';
import { ProductModal } from './ProductModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { SizeGuideModal } from './SizeGuideModal';
import { AdminPanel } from './AdminPanel';

const leagues: { id: ProductCategory; name: string }[] = [
  { id: 'inicio', name: 'Todos os mantos' }, { id: 'brasileirao', name: 'Brasileirão' },
  { id: 'premier_league', name: 'Premier League' }, { id: 'la_liga', name: 'La Liga' },
  { id: 'serie_a', name: 'Serie A' }, { id: 'bundesliga', name: 'Bundesliga' }, { id: 'ligue_1', name: 'Ligue 1' },
];
const money = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Storefront() {
  const store = useStore();
  const { products, settings, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, sortBy, setSortBy, openProductModal, cartCount, setIsCartOpen, generateWhatsAppLink } = store;
  const [menuOpen, setMenuOpen] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [limit, setLimit] = useState(12);
  const [faq, setFaq] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const filtered = useMemo(() => products.filter(p =>
    (selectedCategory === 'inicio' || p.category === selectedCategory) &&
    `${p.name} ${p.club} ${p.league} ${p.season}`.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase())
  ).sort((a, b) => sortBy === 'price-asc' ? a.price - b.price : sortBy === 'price-desc' ? b.price - a.price : sortBy === 'name' ? a.name.localeCompare(b.name) : Number(Boolean(b.featured)) - Number(Boolean(a.featured))), [products, selectedCategory, searchQuery, sortBy]);
  useEffect(() => { setLimit(12); }, [selectedCategory, searchQuery]);
  useEffect(() => {
    const open = store.activeProductModal || store.isCartOpen || store.isCheckoutOpen || store.isSizeGuideOpen || menuOpen;
    document.body.style.overflow = open ? 'hidden' : '';
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') { store.closeProductModal(); store.setIsCartOpen(false); store.setIsCheckoutOpen(false); store.setIsSizeGuideOpen(false); setMenuOpen(false); } };
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', close); };
  }, [store.activeProductModal, store.isCartOpen, store.isCheckoutOpen, store.isSizeGuideOpen, menuOpen]);
  const scrollCatalogue = () => document.getElementById('catalogo')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
  const selectLeague = (id: ProductCategory) => { setSelectedCategory(id); setSearchQuery(''); setMenuOpen(false); scrollCatalogue(); };
  const faqs = [
    ['Posso personalizar minha camisa?', 'Sim. Adicione nome e número por R$ 20,00 na página do produto. Você também pode escolher os patches disponíveis.'],
    ['Como funciona a entrega?', 'Enviamos para todo o Brasil. PAC: R$ 24,90, de 5 a 8 dias úteis. SEDEX: R$ 39,90, de 2 a 4 dias úteis. Frete grátis a partir de R$ 299. O envio será confirmado no WhatsApp.'],
    ['Quais são as formas de pagamento?', 'PIX com 5% de desconto, cartão em até 3x sem juros ou pagamento combinado pelo WhatsApp. A disponibilidade e o pagamento são confirmados pela nossa equipe.'],
  ];
  return <>
    <header className="border-b border-border">
      <div className="store-width store-header">
        <Button variant="ghost" onClick={() => { setSelectedCategory('inicio'); setSearchQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-0 h-auto" aria-label="GRM Sports início"><div className="wordmark">GRM<span>SPORTS</span><span className="text-xs ml-1">®</span></div></Button>
        <nav className="store-nav" aria-label="Navegação principal"><Button variant="ghost" onClick={() => selectLeague('inicio')}>Catálogo</Button><Button variant="ghost" onClick={() => selectLeague('brasileirao')}>Brasileirão</Button><Button variant="ghost" onClick={() => selectLeague('premier_league')}>Clubes europeus</Button><Button variant="ghost" asChild><a href={generateWhatsAppLink()} target="_blank" rel="noreferrer">Fale com a gente <ArrowRight /></a></Button></nav>
        <div className="flex items-center gap-3"><Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex" title="Instagram"><a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram GRM Sports"><Instagram /></a></Button><Button variant="ghost" onClick={() => setIsCartOpen(true)} className="gap-2 px-1" aria-label="Abrir sacola de compras"><ShoppingBag /><span className="text-xs">Sacola ({cartCount})</span></Button><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu /></Button></div>
      </div>
    </header>
    <section className="hero">
      <img className="hero-photo" src={banner.url} alt="Bukayo Saka vestindo a camisa vermelha do Arsenal" fetchPriority="high" />
      <motion.div className="store-width hero-content" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
        <span className="eyebrow text-primary">Futebol, dentro e fora de campo.</span>
        <h1>GRM SPORTS</h1>
        <p>Seu time. Sua história. Seu próximo manto.<br />Camisas para quem vive o futebol.</p>
        <Button className="hero-action" onClick={() => selectLeague('inicio')}>Encontre seu manto <ArrowRight /></Button>
      </motion.div>
    </section>
    <main className="store-width">
      <div className="benefits"><span><Truck />Frete grátis a partir de R$ 299</span><span><Ruler />Personalize com seu nome e número</span><span><MessageCircle />Atendimento de quem entende de futebol</span></div>
      <section id="catalogo" className="scroll-mt-6">
        <div className="catalog-heading"><div><h2>Escolha seu manto.</h2><p>Dos gramados do Brasil aos grandes clubes do mundo.</p></div><label className="search-field"><Search size={17} /><input aria-label="Buscar clube ou camisa" placeholder="Busque seu time ou camisa" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />{searchQuery && <Button variant="ghost" size="icon" aria-label="Limpar busca" onClick={() => setSearchQuery('')}><X /></Button>}</label></div>
        <nav className="league-tabs" aria-label="Filtrar por liga">{leagues.map(l => <Button variant="ghost" key={l.id} aria-pressed={selectedCategory === l.id} onClick={() => { setSelectedCategory(l.id); setSearchQuery(''); }}>{l.name}</Button>)}</nav>
        <div className="catalog-toolbar"><span>{filtered.length} camisas {searchQuery && `para “${searchQuery}”`}</span><div className="flex items-center gap-2"><select aria-label="Ordenar produtos" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}><option value="featured">Destaques</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome: A–Z</option></select><div className="hidden sm:flex"><Button variant="ghost" size="icon" title="Visualização em grade" aria-label="Grade" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')}><LayoutGrid /></Button><Button variant="ghost" size="icon" title="Visualização em lista" aria-label="Lista" aria-pressed={layout === 'list'} onClick={() => setLayout('list')}><List /></Button></div></div></div>
        <div className={`product-grid ${layout === 'list' ? 'product-list' : ''}`}>{filtered.slice(0, limit).map((p, i) => <motion.article key={p.id} className="product-card" initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .4, delay: (i % 4) * .045 }}>
          <Button variant="ghost" className="product-photo" aria-label={`Ver ${p.name}`} onClick={() => openProductModal(p)}>{p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading={i < 4 ? 'eager' : 'lazy'} /> : <span className="text-sm text-muted-foreground">Foto em breve</span>}<span className="product-badge">{p.version}</span></Button>
          <div><div className="product-club">{p.league} · {p.season}</div><h3 className="product-name">{p.name}</h3><div className="product-price"><span>{money(p.price)}</span>{p.compareAtPrice && <del>{money(p.compareAtPrice)}</del>}</div><p className="product-pix">{money(p.price * .95)} no PIX</p></div>
        </motion.article>)}</div>
        {filtered.length === 0 && <div className="py-20 text-center"><Search className="mx-auto mb-4 text-muted-foreground" /><p>Nenhuma camisa encontrada.</p><Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('inicio'); }}><RotateCcw />Ver todas as camisas</Button></div>}
        {filtered.length > limit && <div className="flex justify-center mt-10"><Button variant="outline" onClick={() => setLimit(v => v + 12)} className="px-8">Ver mais camisas <ChevronDown /></Button></div>}
      </section>
      <section className="mt-16 max-w-2xl border-t border-border pt-8"><h2 className="font-display text-3xl font-semibold mb-5">Antes de escolher.</h2>{faqs.map(([q, a], i) => <div key={q} className="border-b border-border"><Button variant="ghost" className="w-full justify-between px-0 h-auto py-4 whitespace-normal text-left text-xs" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? null : i)}>{q}<ChevronDown className={faq === i ? 'rotate-180' : ''} /></Button>{faq === i && <p className="pb-5 text-xs text-muted-foreground leading-7">{a}</p>}</div>)}</section>
    </main>
    <footer className="store-footer"><div className="store-width footer-inner"><div><div className="wordmark mb-3">GRM<span>SPORTS</span></div><p>Futebol é parte de quem a gente é.</p></div><div className="footer-links"><a href={settings.instagramUrl} target="_blank" rel="noreferrer">{settings.instagram}</a><a href={generateWhatsAppLink()} target="_blank" rel="noreferrer">WhatsApp <ArrowRight className="inline size-3" /></a><a href={`mailto:${settings.email}`}>E-mail</a></div><p>GRM Sports © {new Date().getFullYear()}</p></div></footer>
    <Button asChild className="floating-contact" title="Conversar no WhatsApp"><a href={generateWhatsAppLink()} target="_blank" rel="noreferrer" aria-label="Conversar no WhatsApp"><MessageCircle /></a></Button>
    {menuOpen && <div className="fixed inset-0 z-50 bg-overlay"><div className="bg-background h-full w-full max-w-sm p-6"><div className="flex justify-between items-center mb-8"><span className="wordmark">GRM<span>SPORTS</span></span><Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X /></Button></div>{leagues.map(l => <Button key={l.id} variant="ghost" className="w-full justify-between rounded-none border-b border-border py-6" onClick={() => selectLeague(l.id)}>{l.name}<ArrowRight /></Button>)}<Button variant="link" asChild className="mt-6"><a href={generateWhatsAppLink()} target="_blank" rel="noreferrer"><MessageCircle />Fale com a gente</a></Button></div></div>}
    <ProductModal /><CartDrawer /><CheckoutModal /><SizeGuideModal /><AdminPanel />
  </>;
}