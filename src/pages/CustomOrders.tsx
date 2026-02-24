import { MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CustomOrders = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Custom Orders</h1>
      <p className="text-muted-foreground leading-relaxed mb-8">
        Want something truly unique? I take custom orders for beanies, scarves, scrunchies, and more!
        Choose your colours, size, and style — and I'll craft it just for you.
      </p>

      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <h2 className="font-display text-xl font-semibold mb-4">How it works</h2>
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
            Send me a message on WhatsApp with your idea
          </li>
          <li className="flex gap-3">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
            We'll discuss colours, size, and details
          </li>
          <li className="flex gap-3">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
            I'll send you a quote and timeline
          </li>
          <li className="flex gap-3">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
            Once confirmed, I'll start crafting your piece!
          </li>
        </ol>
      </div>

      <a
        href="https://wa.me/447000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-600 text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        <MessageCircle className="w-5 h-5" /> Message me on WhatsApp
      </a>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-muted-foreground mb-4">Or browse my ready-made collection:</p>
        <Link to="/products" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
          View Products <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default CustomOrders;
