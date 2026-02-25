import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast } from "./components/ui/use-toast";
import { CartProvider } from "./context/CartContext";
import { getApiErrorMessage, isRetryableApiError } from "./lib/http";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import CustomOrders from "./pages/CustomOrders";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const showRequestError = (error: unknown) => {
  const message = getApiErrorMessage(error);
  if (message === "Request was cancelled.") {
    return;
  }

  toast({
    title: "Request failed",
    description: message,
    variant: "destructive",
  });
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: showRequestError,
  }),
  mutationCache: new MutationCache({
    onError: showRequestError,
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => failureCount < 2 && isRetryableApiError(error),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/success" element={<Success />} />
              <Route path="/custom-orders" element={<CustomOrders />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
