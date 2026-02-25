import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { CartProvider, useCart } from "../context/CartContext";
import { products } from "../data/products";

const STORAGE_KEY = "stitchwyse.cart.v1";

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("CartContext localStorage persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hydrates the cart from localStorage", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          product: products[0],
          quantity: 2,
        },
      ]),
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.product.id).toBe(products[0]?.id);
    expect(result.current.items[0]?.quantity).toBe(2);
  });

  it("persists updates to localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(products[0]!);
    });

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();

    const parsed = JSON.parse(raw ?? "[]") as Array<{ product: { id: string }; quantity: number }>;
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.product.id).toBe(products[0]?.id);
    expect(parsed[0]?.quantity).toBe(1);
  });

  it("clamps quantity at 20", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      for (let index = 0; index < 25; index += 1) {
        result.current.addToCart(products[0]!);
      }
    });

    expect(result.current.items[0]?.quantity).toBe(20);
  });

  it("ignores invalid persisted payloads", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          product: { id: "invalid-only-id" },
          quantity: 4,
        },
      ]),
    );

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
  });
});
