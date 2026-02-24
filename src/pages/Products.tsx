import { useState } from "react";
import { products, type ProductCategory } from "../data/products";
import ProductCard from "../components/ProductCard";

const categories: { label: string; value: ProductCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Beanies", value: "beanies" },
  { label: "Scarves", value: "scarves" },
  { label: "Scrunchies", value: "scrunchies" },
];

const Products = () => {
  const [filter, setFilter] = useState<ProductCategory | "all">("all");

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Shop</h1>
      <p className="text-muted-foreground mb-8">Browse all handmade pieces</p>

      {/* Filters */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((product, i) => (
          <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-20">No products in this category yet.</p>
      )}
    </div>
  );
};

export default Products;
