import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {currentYear} StitchWyse. All rights reserved.</p>
        <nav className="flex flex-wrap items-center gap-4">
          <Link to="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <Link to="/custom-orders" className="hover:text-foreground transition-colors">
            Custom Orders
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
