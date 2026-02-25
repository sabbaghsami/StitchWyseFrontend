import { Link } from "react-router-dom";
import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const hasSecondaryImage = Boolean(product.images[1]);

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-muted">
        {product.stockQuantity < 1 && (
          <span className="absolute left-2 top-2 z-10 bg-background/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
            Sold out
          </span>
        )}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`h-full w-full object-cover transition-all duration-500 ${
            hasSecondaryImage ? "group-hover:scale-105 group-hover:opacity-0" : "group-hover:scale-105"
          }`}
        />
        {hasSecondaryImage && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        )}
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">{product.name}</h3>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{product.category}</span>
        <span className="text-sm font-semibold text-foreground">£{product.price.toFixed(2)}</span>
      </div>
    </Link>
  );
};

export default ProductCard;
