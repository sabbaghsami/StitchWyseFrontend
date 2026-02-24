import { Instagram, Mail, MessageCircle } from "lucide-react";

const socials = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/stitchwyse",
    handle: "@stitchwyse",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    href: "https://wa.me/447000000000",
    handle: "+44 7000 000000",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hello@stitchwyse.com",
    handle: "hello@stitchwyse.com",
  },
];

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Get in Touch</h1>
      <p className="text-muted-foreground mb-10">
        Got a question, want to place a custom order, or just want to say hi? Reach out through any of the channels below!
      </p>

      <div className="space-y-4">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 bg-card border border-border rounded-lg hover-lift group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <social.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{social.label}</p>
              <p className="text-sm text-muted-foreground">{social.handle}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Contact;
