import { motion } from "motion/react";
import { useEffect, useState } from "react";
import logo from "@/assets/am-elite-drive-logo.png";
import { Instagram, Phone } from "lucide-react";

const links = [
  { href: "#flotte", label: "Notre flotte" },
  { href: "#avantages", label: "Avantages" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="AM Elite Drive — Location de voitures"
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-primary/30 group-hover:ring-primary transition"
          />
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-lg text-silver">AM ELITE DRIVE</div>
            <div className="text-[10px] tracking-[0.3em] text-muted-foreground">
              LOCATION DE VOITURES
            </div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/am.elite_drive"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="h-10 w-10 grid place-items-center rounded-full border border-border hover:border-primary hover:bg-primary/10 transition"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="tel:+212704957685"
            className="hidden sm:inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm font-medium bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[0_0_30px_oklch(0.62_0.22_255_/_0.4)] hover:scale-105 transition"
          >
            <Phone className="h-4 w-4" /> 0704 957 685
          </a>
        </div>
      </div>
    </motion.header>
  );
}