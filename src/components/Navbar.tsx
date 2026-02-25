import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Minus, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

const Navbar = () => {
  const { items, removeFromCart, totalItems, totalPrice, updateQuantity } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const searchFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") ?? "";
  }, [location.search]);

  useEffect(() => {
    setSearchValue(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const id = location.hash.replace("#", "");
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const term = searchValue.trim();

    if (term) {
      params.set("search", term);
    }

    navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    setSearchOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/products") {
      return location.pathname === "/products";
    }

    if (href === "/#about") {
      return location.pathname === "/" && location.hash.startsWith("#about");
    }

    return location.pathname === href;
  };

  const handleAboutClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== "/") {
      return;
    }

    event.preventDefault();
    navigate("/#about");
    const section = document.getElementById("about");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (location.pathname !== "/" || location.search || location.hash) {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground transition-opacity hover:opacity-70"
        >
          STITCHWYSE
        </Link>

        <div className="mx-auto hidden items-center gap-9 md:flex">
          <Link to="/products" className={`nav-link ${isActive("/products") ? "nav-link-active" : ""}`}>
            SHOP
          </Link>
          <Link to="/#about" onClick={handleAboutClick} className={`nav-link ${isActive("/#about") ? "nav-link-active" : ""}`}>
            ABOUT
          </Link>
          <Link to="/contact" className={`nav-link ${isActive("/contact") ? "nav-link-active" : ""}`}>
            CONTACT ME
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            SEARCH
          </button>

          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground">
                <ShoppingBag className="h-3.5 w-3.5" />
                CART{totalItems > 0 ? ` (${totalItems})` : ""}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-md border-l border-border bg-background p-0 sm:max-w-md">
              <div className="flex h-full flex-col">
                <SheetHeader className="border-b border-border px-6 py-5 text-left">
                  <SheetTitle className="text-sm font-semibold uppercase tracking-[0.2em]">Cart</SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                    <ShoppingBag className="mb-4 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                    <SheetClose asChild>
                      <Link to="/products" className="button-black mt-6">
                        SHOP PRODUCTS
                      </Link>
                    </SheetClose>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                      {items.map(({ product, quantity }) => (
                        <article key={product.id} className="flex gap-4">
                          <SheetClose asChild>
                            <Link to={`/products/${product.id}`} className="h-24 w-20 overflow-hidden bg-muted">
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                            </Link>
                          </SheetClose>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              £{product.price.toFixed(2)}
                            </p>
                            <div className="mt-3 flex items-center gap-3">
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
                                className="inline-flex h-7 w-7 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground"
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

                    <div className="border-t border-border px-6 py-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subtotal</span>
                        <span className="text-base font-semibold text-foreground">£{totalPrice.toFixed(2)}</span>
                      </div>
                      <SheetClose asChild>
                        <Link to="/cart" className="button-black w-full">
                          CHECKOUT
                        </Link>
                      </SheetClose>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <button
            className="inline-flex text-muted-foreground transition-colors hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background">
          <form onSubmit={handleSearch} className="container mx-auto flex items-center gap-3 px-4 py-4 md:px-8">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search beanies"
              className="h-10 flex-1 border border-border bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
            <button type="submit" className="button-black h-10 px-4 py-0">
              GO
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col gap-4 px-4 py-5">
            <Link to="/products" className={`nav-link ${isActive("/products") ? "nav-link-active" : ""}`}>
              SHOP
            </Link>
            <Link to="/#about" onClick={handleAboutClick} className={`nav-link ${isActive("/#about") ? "nav-link-active" : ""}`}>
              ABOUT
            </Link>
            <Link to="/contact" className={`nav-link ${isActive("/contact") ? "nav-link-active" : ""}`}>
              CONTACT ME
            </Link>
            <button
              onClick={() => {
                setSearchOpen(true);
                setMobileOpen(false);
              }}
              className="nav-link inline-flex w-fit"
            >
              SEARCH
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
