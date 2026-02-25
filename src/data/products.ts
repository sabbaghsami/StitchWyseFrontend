export type ProductCategory = "beanies" | "scarves" | "scrunchies";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stockQuantity: number;
  summary: string;
  images: string[];
  stripeProductId?: string;
  featured?: boolean;
}

// Using placeholder images — replace with your own product photos
export const products: Product[] = [
  {
    id: "beanie-rust",
    name: "Rust Ribbed Beanie",
    category: "beanies",
    price: 28,
    stockQuantity: 2,
    summary: "A cozy hand-crocheted beanie in warm rust orange. Perfect for chilly mornings and autumn walks. One size fits most.",
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=600&fit=crop",
    ],
    featured: true,
    stripeProductId: "prod_U2lNJLuFnXBXJR",
  },
  {
    id: "beanie-dusty-blue",
    name: "Dusty Blue Slouch Beanie",
    category: "beanies",
    price: 30,
    stockQuantity: 2,
    summary: "Relaxed slouch-style beanie in a calming dusty blue. Soft, lightweight yarn that's perfect year-round.",
    images: [
      "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=600&h=600&fit=crop",
    ],
    featured: true,
    stripeProductId: "prod_U2lNxQZpQXVQvt",
  },
  {
    id: "beanie-cream",
    name: "Cream Cable Knit Beanie",
    category: "beanies",
    price: 30,
    stockQuantity: 2,
    summary: "Classic cable-knit pattern in creamy white. A timeless piece that pairs with everything.",
    images: [
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=600&fit=crop",
    ],
    stripeProductId: "prod_U2lNk0T515ZRds",
  },
  {
    id: "scarf-blue-cable",
    name: "Blue Cable Scarf",
    category: "scarves",
    price: 45,
    stockQuantity: 2,
    summary: "Chunky cable-knit scarf in dusty blue. Extra long for wrapping and styling however you like.",
    images: [
      "https://images.unsplash.com/photo-1457545195570-67f207084966?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1601924921557-45e8e0b8587e?w=600&h=600&fit=crop",
    ],
    featured: true,
    stripeProductId: "prod_U2lNfdkbL5FkWh",
  },
  {
    id: "scarf-sunset",
    name: "Sunset Ombré Scarf",
    category: "scarves",
    price: 48,
    stockQuantity: 2,
    summary: "Gorgeous gradient scarf blending warm oranges and soft peaches. Each one is uniquely hand-dyed.",
    images: [
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1457545195570-67f207084966?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1601924921557-45e8e0b8587e?w=600&h=600&fit=crop",
    ],
    stripeProductId: "prod_U2lNysZDEJTS5u",
  },
  {
    id: "scarf-cream-infinity",
    name: "Cream Infinity Scarf",
    category: "scarves",
    price: 40,
    stockQuantity: 2,
    summary: "Elegant infinity scarf in soft cream. Easy to throw on and instantly elevates any outfit.",
    images: [
      "https://images.unsplash.com/photo-1601924921557-45e8e0b8587e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1457545195570-67f207084966?w=600&h=600&fit=crop",
    ],
    stripeProductId: "prod_U2lNkTCClsCdg0",
  },
  {
    id: "scrunchie-rust",
    name: "Rust Crochet Scrunchie",
    category: "scrunchies",
    price: 8,
    stockQuantity: 2,
    summary: "Cute handmade scrunchie in burnt orange. Gentle on hair and adds a pop of colour.",
    images: [
      "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
    ],
    featured: true,
    stripeProductId: "prod_U2lNjbX3JHUAkp",
  },
  {
    id: "scrunchie-blue",
    name: "Dusty Blue Scrunchie",
    category: "scrunchies",
    price: 8,
    stockQuantity: 2,
    summary: "Soft blue crochet scrunchie. Perfect for everyday wear or gifting.",
    images: [
      "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
    ],
    stripeProductId: "prod_U2lNjl8RMbOt8g",
  },
  {
    id: "scrunchie-set",
    name: "Scrunchie Set (3 Pack)",
    category: "scrunchies",
    price: 20,
    stockQuantity: 2,
    summary: "Get the trio! One rust, one blue, one cream scrunchie bundled together at a sweet price.",
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600&h=600&fit=crop",
    ],
    stripeProductId: "prod_U2lO4EODEjl60S",
  },
];

export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getFeaturedProducts = () => products.filter((p) => p.featured);
export const getProductsByCategory = (cat: ProductCategory) => products.filter((p) => p.category === cat);
