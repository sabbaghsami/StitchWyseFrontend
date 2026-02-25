import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../components/ProductCard";
import heroImage from "../assets/hero-crochet.jpg";
import { listProducts } from "../lib/supabase-products";

const Index = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const featuredBeanies = useMemo(
    () => products.filter((product) => product.category === "beanies").slice(0, 4),
    [products],
  );

  return (
    <div className="bg-background">
      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <img src={heroImage} alt="Model wearing a crochet beanie" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/50 to-black/25" />

        <div className="container mx-auto flex min-h-[92vh] items-end px-4 pb-16 pt-28 md:px-8 md:pb-24 md:pt-32">
          <div className="max-w-xl text-left">
            <p className="reveal-up text-[10px] font-semibold uppercase tracking-[0.34em] text-primary-foreground/80">
              NEW DROP
            </p>
            <h1
              className="reveal-up mt-4 text-5xl font-semibold uppercase leading-[0.93] tracking-[-0.03em] text-primary-foreground md:text-7xl"
              style={{ animationDelay: "0.12s" }}
            >
              HANDMADE CROCHET
            </h1>
            <p
              className="reveal-up mt-6 max-w-md text-sm uppercase tracking-[0.1em] text-primary-foreground/80 md:text-base"
              style={{ animationDelay: "0.22s" }}
            >
              Premium crochet beanies handcrafted in small batches for a clean streetwear wardrobe.
            </p>
            <Link
              to="/products?category=beanies"
              className="reveal-up mt-10 inline-flex items-center gap-2 bg-primary-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-opacity duration-200 hover:opacity-85"
              style={{ animationDelay: "0.32s" }}
            >
              SHOP NOW <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24 md:px-8 md:py-32">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="editorial-tag">Featured</p>
            <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.05em] text-foreground md:text-5xl">
              Beanie Selection
            </h2>
          </div>
          <Link to="/products?category=beanies" className="button-ghost w-fit px-5 py-3">
            VIEW BEANIES
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Loading products...</p>
          ) : (
            featuredBeanies.map((product, index) => (
              <div key={product.id} className="reveal-up" style={{ animationDelay: `${index * 0.08}s` }}>
                <ProductCard product={product} />
              </div>
            ))
          )}
          {!isLoading && featuredBeanies.length === 0 && (
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              No beanies available right now.
            </p>
          )}
        </div>
      </section>

      <section id="about" className="border-y border-border bg-card">
        <div className="container mx-auto grid gap-12 px-4 py-24 md:grid-cols-2 md:px-8 md:py-32">
          <div>
            <p className="editorial-tag">About</p>
            <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.05em] text-foreground md:text-5xl">
              Crafted By Hand. Styled For Street.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Every StitchWyse beanie is crocheted by hand using premium yarn and fashion-led color tones.
            We keep production intentionally limited, focusing on texture, fit, and clean silhouettes that
            sit naturally beside modern streetwear staples.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24 md:px-8">
        <div className="flex flex-col gap-6 border border-border bg-background p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <h3 className="max-w-xl text-2xl font-semibold uppercase tracking-[0.05em] text-foreground md:text-4xl">
            Built for cold days, clean fits, and daily wear.
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/products?category=beanies" className="button-black w-fit">
              SHOP NOW
            </Link>
            <Link to="/contact" className="button-ghost w-fit">
              CONTACT ME
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
