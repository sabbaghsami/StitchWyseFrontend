import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block hover-lift"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
        <img
          src={hovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="font-display text-base font-semibold text-foreground">{product.name}</h3>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm text-muted-foreground capitalize">{product.category}</span>
        <span className="text-sm font-semibold text-primary">£{product.price.toFixed(2)}</span>
      </div>
    </Link>
  );
};

export default ProductCard;
