import { ArrowUpRight, Instagram, Mail, MessageCircle } from "lucide-react";

const socials = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/stitchwyse",
    handle: "@stitchwyse",
    description: "Product drops and styling updates",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    href: "https://wa.me/447000000000",
    handle: "+44 7000 000000",
    description: "Fast replies for orders and sizing",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hello@stitchwyse.com",
    handle: "hello@stitchwyse.com",
    description: "Partnership and wholesale inquiries",
  },
];

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <div className="max-w-3xl">
        <p className="editorial-tag">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold uppercase tracking-[0.05em] text-foreground md:text-6xl">
          Contact Me
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.1em] text-muted-foreground md:text-base">
          Questions, custom requests, or collaborations. Reach out through any channel below.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {socials.map((social, index) => (
          <a
            key={social.label}
            href={social.href}
            target={social.href.startsWith("http") ? "_blank" : undefined}
            rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="reveal-up border border-border bg-card p-6 transition-colors duration-200 hover:border-accent"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="flex items-center justify-between">
              <social.icon className="h-5 w-5 text-accent" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">{social.label}</p>
            <p className="mt-2 text-sm font-medium text-foreground">{social.handle}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">{social.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Contact;
