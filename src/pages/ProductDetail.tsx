import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";
import { getProductById } from "../data/products";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = getProductById(id || "");
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left — Images */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                  selectedImage === i ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right — Info */}
        <div className="flex flex-col justify-center">
          <span className="text-sm uppercase tracking-wider text-primary font-medium mb-2">
            {product.category}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">{product.summary}</p>
          <p className="text-2xl font-bold text-foreground mb-8">£{product.price.toFixed(2)}</p>

          <button
            onClick={handleAddToCart}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              added
                ? "bg-green-600 text-primary-foreground"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
