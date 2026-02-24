import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Browse our collection and add something you love.</p>
        <Link to="/products" className="inline-flex bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>

      <div className="space-y-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
            <img src={product.images[0]} alt={product.name} className="w-20 h-20 rounded-md object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
              <p className="text-sm font-semibold text-primary mt-1">£{product.price.toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-card rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-display font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">£{totalPrice.toFixed(2)}</span>
        </div>
        <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Proceed to Checkout
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          You'll be redirected to Stripe for secure payment.
        </p>
      </div>
    </div>
  );
};

export default Cart;
