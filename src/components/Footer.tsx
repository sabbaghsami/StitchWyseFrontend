import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-10 text-xs uppercase tracking-[0.18em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>© {currentYear} StitchWyse. Handmade in small batches.</p>
        <nav className="flex flex-wrap items-center gap-5">
          <Link to="/products" className="transition-colors hover:text-foreground">
            Shop
          </Link>
          <Link to="/#about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link to="/contact" className="transition-colors hover:text-foreground">
            Contact Me
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
