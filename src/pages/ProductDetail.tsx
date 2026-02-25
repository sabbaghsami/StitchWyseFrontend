import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../context/CartContext";
import { getProductById } from "../lib/supabase-products";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id ?? ""),
    enabled: Boolean(id),
  });
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSelectedImage(0);
    setAdded(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center md:px-8">
        <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center md:px-8">
        <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Product not found.</p>
        <Link to="/products" className="button-black mt-6">
          BACK TO SHOP
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr,1fr] lg:gap-14">
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((image, index) => (
              <button
                key={image}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden border transition-colors ${
                  selectedImage === index ? "border-foreground" : "border-border"
                }`}
                aria-label={`Show ${product.name} view ${index + 1}`}
              >
                <img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">{product.category}</p>
          <h1 className="mt-3 text-4xl font-semibold uppercase leading-tight tracking-[0.04em] text-foreground md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-6 text-2xl font-semibold text-foreground">£{product.price.toFixed(2)}</p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{product.summary}</p>

          <div className="mt-8 space-y-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <p>Handmade in small batches</p>
            <p>Premium yarn blend</p>
            <p>Ships in 2-4 business days</p>
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-10 inline-flex w-full items-center justify-center gap-2 border border-primary bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-opacity duration-200 hover:opacity-85"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Added to Cart
              </>
            ) : (
              "Add to Cart"
            )}
          </button>

          <Link to="/products" className="button-ghost mt-3 w-full">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
