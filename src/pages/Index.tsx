import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "../data/products";
import ProductCard from "../components/ProductCard";
import heroImage from "../assets/hero-crochet.jpg";

const Index = () => {
  const featured = getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Handmade crochet items" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
        <div className="relative container mx-auto px-4 py-32 md:py-44 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Handmade with Love
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            Unique crocheted beanies, scarves & scrunchies — crafted one stitch at a time.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="container mx-auto px-4 py-20 text-center max-w-2xl">
        <h2 className="font-display text-3xl font-bold mb-4">About Me</h2>
        <p className="text-muted-foreground leading-relaxed">
          Hi! I'm the maker behind StitchWyse. Every piece is handcrafted by me using high-quality
          yarn and lots of patience. I started crocheting as a way to unwind and fell in love
          with creating wearable art. Each item is made to order — meaning no two are exactly
          alike. Thank you for supporting small, handmade businesses!
        </p>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold">Featured Pieces</h2>
          <Link to="/products" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
