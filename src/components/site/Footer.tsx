import logo from "@/assets/am-drive-logo.jpeg";
import { Instagram, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-10 items-start">
        <div className="flex items-center gap-3">
          <img src={logo} alt="AM Drive" className="h-14 w-14 rounded-lg ring-1 ring-primary/30" />
          <div>
            <div className="font-display text-xl text-silver">AM DRIVE</div>
            <div className="text-[10px] tracking-[0.3em] text-muted-foreground">
              LOCATION DE VOITURES
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="text-silver font-medium mb-2">Location Luxury</div>
          La conduite, en mieux. Flotte 2026 automatique, équipements premium,
          service haut de gamme.
        </div>
        <div className="flex md:justify-end items-center gap-3">
          <a
            href="https://www.instagram.com/amdr.ive"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="h-11 w-11 grid place-items-center rounded-full border border-border hover:border-primary hover:bg-primary/10 transition"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="tel:+212704957685"
            className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-sm font-medium"
          >
            <Phone className="h-4 w-4" /> 0704 957 685
          </a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} AM Drive · Signé Amine Mouktir</div>
          <div className="tracking-[0.25em] uppercase">Votre satisfaction, notre priorité</div>
        </div>
      </div>
    </footer>
  );
}