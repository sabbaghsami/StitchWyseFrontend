import { appEnv } from "../config/env";
import { requestJson } from "./http";
import { getProductById as getStaticProductById, products as staticProducts, type Product } from "../data/products";

const PRODUCT_SELECT = "id,name,category,price,stock_quantity,summary,featured,stripe_product_id,product_images(image_url,position)";

interface ProductImageRow {
  image_url: string;
  position: number;
}

interface ProductRow {
  id: string;
  name: string;
  category: Product["category"];
  price: number;
  stock_quantity: number;
  summary: string;
  featured: boolean;
  stripe_product_id: string | null;
  product_images?: ProductImageRow[] | null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(appEnv.supabaseUrl && appEnv.supabasePublishableKey);
}

function getSupabaseHeaders(): HeadersInit {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase environment variables are missing.");
  }

  const apiKey = appEnv.supabasePublishableKey;
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };
}

function mapProductRow(row: ProductRow): Product {
  const orderedImages = [...(row.product_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((image) => image.image_url)
    .filter((image): image is string => Boolean(image));

  if (orderedImages.length === 0) {
    orderedImages.push("https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=600&fit=crop");
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stockQuantity: Math.max(0, Math.floor(Number(row.stock_quantity))),
    summary: row.summary,
    images: orderedImages,
    featured: row.featured,
    stripeProductId: row.stripe_product_id ?? undefined,
  };
}

export async function listProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return staticProducts;
  }

  const params = new URLSearchParams({
    select: PRODUCT_SELECT,
    active: "eq.true",
    order: "sort_order.asc,created_at.desc",
    "product_images.order": "position.asc",
  });

  const rows = await requestJson<ProductRow[]>(`${appEnv.supabaseUrl}/rest/v1/products?${params.toString()}`, {
    headers: getSupabaseHeaders(),
  });

  return rows.map(mapProductRow);
}

export async function getProductById(productId: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return getStaticProductById(productId) ?? null;
  }

  const params = new URLSearchParams({
    select: PRODUCT_SELECT,
    active: "eq.true",
    id: `eq.${productId}`,
    limit: "1",
  });

  const rows = await requestJson<ProductRow[]>(`${appEnv.supabaseUrl}/rest/v1/products?${params.toString()}`, {
    headers: getSupabaseHeaders(),
  });

  const row = rows[0];
  return row ? mapProductRow(row) : null;
}
