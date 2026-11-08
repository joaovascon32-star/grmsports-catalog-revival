import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreProvider, useStore } from '@/context/StoreContext';
import { ProductModal } from '@/components/store/ProductModal';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '@/data/initialCatalog';

function OrderFixture() {
  const { openProductModal } = useStore();
  const product = INITIAL_PRODUCTS[0];
  if (!product) return null;
  return <><button onClick={() => openProductModal(product)}>Open product</button><ProductModal /></>;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('Catalog WhatsApp order', () => {
  it('orders the selected shirt at its catalog price without customization or patches', () => {
    localStorage.clear();
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const product = INITIAL_PRODUCTS[0];
    if (!product) throw new Error('Catalog must contain a product');
    const size = product.sizes.find(stock => stock.inStock)?.size;
    if (!size) throw new Error('Product must have an available size');
    render(<StoreProvider><OrderFixture /></StoreProvider>);
    fireEvent.click(screen.getByText('Open product'));
    fireEvent.click(screen.getByRole('button', { name: 'Pedir pelo WhatsApp' }));
    expect(open).toHaveBeenCalledTimes(1);
    const url = new URL(String(open.mock.calls[0]?.[0]));
    expect(url.pathname).toBe('/5565996637773');
    expect(url.searchParams.get('text')).toBe(
      `Olá ${INITIAL_SETTINGS.storeName}! Gostaria de pedir este manto:\n\n` +
      `👕 *${product.name}*\n` +
      `📏 Tamanho: *${size}*\n` +
      `💰 Valor Unitário: R$ ${product.price.toFixed(2).replace('.', ',')}\n\n` +
      'Como posso prosseguir com o pagamento e envio? Obrigado!'
    );
  });
});