export interface BuyerCartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

const STORAGE_KEY = "buyerCart";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getBuyerCart(): BuyerCartItem[] {
  if (!hasWindow()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBuyerCart(items: BuyerCartItem[]) {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addBuyerCartItem(productId: string, quantity = 1) {
  const items = getBuyerCart();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productId,
      quantity,
      addedAt: new Date().toISOString(),
    });
  }

  saveBuyerCart(items);
  return items;
}

export function updateBuyerCartItem(productId: string, quantity: number) {
  const items = getBuyerCart()
    .map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    )
    .filter((item) => item.quantity > 0);

  saveBuyerCart(items);
  return items;
}

export function removeBuyerCartItem(productId: string) {
  const items = getBuyerCart().filter((item) => item.productId !== productId);
  saveBuyerCart(items);
  return items;
}

export function clearBuyerCart() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getBuyerCartQuantity(items = getBuyerCart()) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}