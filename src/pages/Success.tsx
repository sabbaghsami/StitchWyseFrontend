import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Success = () => {
  const orderNumber = `SW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-lg">
      <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
      <h1 className="font-display text-3xl font-bold mb-3">Thank You for Your Purchase!</h1>
      <p className="text-muted-foreground mb-2">Your order has been confirmed.</p>
      <p className="text-lg font-semibold text-foreground mb-8">
        Order Number: <span className="text-primary">{orderNumber}</span>
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        You'll receive a confirmation email shortly. Each item is handmade to order, so please allow a few days for crafting.
      </p>
      <Link
        to="/"
        className="inline-flex bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default Success;
