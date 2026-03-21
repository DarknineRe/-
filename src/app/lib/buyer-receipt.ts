export interface BuyerReceiptItem {
  productId: string;
  name: string;
  workspaceName: string;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  lineTotal: number;
}

export interface BuyerReceipt {
  id: string;
  createdAt: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  pickupMethod: "pickup" | "delivery";
  locationDetail: string;
  note?: string;
  subtotal: number;
  items: BuyerReceiptItem[];
}

const RECEIPT_STORAGE_KEY = "buyerReceipts";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getBuyerReceipts(): BuyerReceipt[] {
  if (!hasWindow()) return [];

  try {
    const raw = window.localStorage.getItem(RECEIPT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBuyerReceipt(receipt: BuyerReceipt) {
  const current = getBuyerReceipts();
  const next = [receipt, ...current].slice(0, 100);
  if (hasWindow()) {
    window.localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(next));
  }
  return receipt;
}

export function getBuyerReceiptById(receiptId: string) {
  return getBuyerReceipts().find((receipt) => receipt.id === receiptId) || null;
}

export function createReceiptId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RC-${timestamp}-${random}`;
}