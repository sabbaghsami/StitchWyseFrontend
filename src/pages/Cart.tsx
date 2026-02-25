import { Link } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "../components/ui/use-toast";
import { createStripeCheckoutSession } from "../lib/checkout";

const Cart = () => {
  const { items, removeFromCart, totalPrice, updateQuantity } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (isCheckingOut) {
      return;
    }

    const missingStripeIds = items.filter((item) => !item.product.stripeProductId);
    if (missingStripeIds.length > 0) {
      toast({
        title: "Checkout unavailable",
        description: "Some products are missing Stripe product IDs. Please update products in Supabase.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCheckingOut(true);
      const checkoutUrl = await createStripeCheckoutSession(items);
      window.location.assign(checkoutUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start checkout.";
      toast({
        title: "Checkout failed",
        description: message,
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center md:px-8">
        <ShoppingBag className="mx-auto mb-5 h-10 w-10 text-muted-foreground" />
        <h1 className="text-3xl font-semibold uppercase tracking-[0.05em] text-foreground md:text-4xl">
          Your Cart Is Empty
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm uppercase tracking-[0.1em] text-muted-foreground">
          Browse the latest drop and add your next beanie.
        </p>
        <Link to="/products" className="button-black mt-8">
          SHOP NOW
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <h1 className="text-4xl font-semibold uppercase tracking-[0.05em] text-foreground md:text-5xl">Cart</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr,1fr]">
        <div className="space-y-5">
          {items.map(({ product, quantity }) => (
            <article key={product.id} className="flex gap-4 border border-border bg-card p-4 md:p-5">
              <img src={product.images[0]} alt={product.name} className="h-24 w-20 object-cover md:h-28 md:w-24" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium uppercase tracking-[0.08em] text-foreground">{product.name}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">£{product.price.toFixed(2)}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="inline-flex h-7 w-7 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground"
                    aria-label={`Decrease quantity for ${product.name}`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                    className="inline-flex h-7 w-7 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Increase quantity for ${product.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(product.id)}
                className="self-start text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remove ${product.name} from cart`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
            <span className="text-2xl font-semibold text-foreground">£{totalPrice.toFixed(2)}</span>
          </div>
          <button className="button-black mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60" onClick={handleCheckout} disabled={isCheckingOut}>
            {isCheckingOut ? "Redirecting..." : "Proceed to Checkout"}
          </button>
          <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Secure checkout powered by Stripe.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
