import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Product } from "../data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = "stitchwyse.cart.v1";
const MAX_QUANTITY_PER_PRODUCT = 20;
const ALLOWED_CATEGORIES: Product["category"][] = ["beanies", "scarves", "scrunchies"];

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getMaxAllowedQuantity(product: Product): number {
  if (!Number.isInteger(product.stockQuantity) || product.stockQuantity < 1) {
    return 0;
  }

  return Math.min(product.stockQuantity, MAX_QUANTITY_PER_PRODUCT);
}

function sanitizeQuantity(quantity: number, maxAllowed: number): number {
  if (maxAllowed < 1) {
    return 0;
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return 1;
  }
  return Math.min(quantity, maxAllowed);
}

function isValidProduct(value: unknown): value is Product {
  if (!isRecord(value)) {
    return false;
  }

  const id = value.id;
  const name = value.name;
  const category = value.category;
  const price = value.price;
  const summary = value.summary;
  const images = value.images;
  const featured = value.featured;
  const stripeProductId = value.stripeProductId;
  const stockQuantity = value.stockQuantity;

  if (typeof id !== "string" || !id.trim()) {
    return false;
  }
  if (typeof name !== "string" || !name.trim()) {
    return false;
  }
  if (!ALLOWED_CATEGORIES.includes(category as Product["category"])) {
    return false;
  }
  if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
    return false;
  }
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    return false;
  }
  if (typeof summary !== "string" || !summary.trim()) {
    return false;
  }
  if (!Array.isArray(images) || images.length === 0 || images.some((image) => typeof image !== "string" || !image.trim())) {
    return false;
  }
  if (featured !== undefined && typeof featured !== "boolean") {
    return false;
  }
  if (stripeProductId !== undefined && typeof stripeProductId !== "string") {
    return false;
  }

  return true;
}

function normalizePersistedItems(rawItems: unknown): CartItem[] {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const quantityByProductId = new Map<string, number>();
  const productById = new Map<string, Product>();

  for (const rawItem of rawItems) {
    if (!isRecord(rawItem) || !isValidProduct(rawItem.product)) {
      continue;
    }

    const maxAllowed = getMaxAllowedQuantity(rawItem.product);
    if (maxAllowed < 1) {
      continue;
    }

    const quantity = sanitizeQuantity(Number(rawItem.quantity), maxAllowed);
    if (quantity < 1) {
      continue;
    }
    const productId = rawItem.product.id;
    const previousQuantity = quantityByProductId.get(productId) ?? 0;
    quantityByProductId.set(productId, Math.min(previousQuantity + quantity, maxAllowed));
    productById.set(productId, rawItem.product);
  }

  return [...quantityByProductId.entries()].map(([productId, quantity]) => ({
    product: productById.get(productId)!,
    quantity,
  }));
}

function loadStoredCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return normalizePersistedItems(JSON.parse(raw));
  } catch {
    return [];
  }
}

function persistCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage failures (for example private mode quota limits).
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadStoredCartItems());

  useEffect(() => {
    persistCartItems(items);
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const maxAllowed = getMaxAllowedQuantity(product);
      if (maxAllowed < 1) {
        return prev;
      }

      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, maxAllowed) }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId
            ? {
                ...i,
                quantity: sanitizeQuantity(quantity, getMaxAllowedQuantity(i.product)),
              }
            : i
        )
        .filter((item) => item.quantity > 0)
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
