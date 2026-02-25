import { useMemo } from "react";
import { type ProductCategory } from "../data/products";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "react-router-dom";
import { listProducts } from "../lib/supabase-products";

const categories: { label: string; value: ProductCategory | "all" }[] = [
  { label: "ALL", value: "all" },
  { label: "BEANIES", value: "beanies" },
  { label: "SCARVES", value: "scarves" },
  { label: "SCRUNCHIES", value: "scrunchies" },
];

const categorySet = new Set<ProductCategory>(["beanies", "scarves", "scrunchies"]);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });
  const rawCategory = searchParams.get("category");
  const searchTerm = searchParams.get("search")?.trim().toLowerCase() ?? "";

  const activeCategory: ProductCategory | "all" =
    rawCategory && categorySet.has(rawCategory as ProductCategory)
      ? (rawCategory as ProductCategory)
      : "all";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === "all" || product.category === activeCategory;
      const textMatch =
        searchTerm.length === 0 ||
        `${product.name} ${product.summary} ${product.category}`.toLowerCase().includes(searchTerm);

      return categoryMatch && textMatch;
    });
  }, [activeCategory, products, searchTerm]);

  const setCategory = (nextCategory: ProductCategory | "all") => {
    const params = new URLSearchParams(searchParams);

    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <div className="max-w-3xl">
        <p className="editorial-tag">Shop</p>
        <h1 className="mt-3 text-4xl font-semibold uppercase tracking-[0.05em] text-foreground md:text-6xl">
          Crochet Collection
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.1em] text-muted-foreground md:text-base">
          Minimal silhouettes, handmade texture, and small-batch production.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-b border-border pb-5">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setCategory(category.value)}
            className={`text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
              activeCategory === category.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {searchTerm && (
        <div className="mt-6 flex items-center justify-between gap-4 border border-border bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Search: {searchTerm}</p>
          <button onClick={clearFilters} className="text-xs uppercase tracking-[0.18em] text-foreground underline">
            Clear
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="mt-16 border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="reveal-up" style={{ animationDelay: `${index * 0.06}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">No products match this filter.</p>
          <button onClick={clearFilters} className="button-black mt-6">
            RESET VIEW
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
