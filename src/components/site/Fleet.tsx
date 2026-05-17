import { motion } from "motion/react";
import troc from "@/assets/troc.jpg";
import p208 from "@/assets/p208.jpg";
import corsa from "@/assets/corsa.jpg";
import {
  Camera,
  Fuel,
  Settings2,
  Snowflake,
  Users,
  Briefcase,
  Check,
  MessageCircle,
} from "lucide-react";
import { useReservation } from "./ReservationProvider";

type Car = {
  name: string;
  qty: string;
  img: string;
  pricePerDay: number;
  specs: { icon: typeof Fuel; label: string }[];
  features: string[];
};

const cars: Car[] = [
  {
    name: "Volkswagen T-Roc 2026",
    qty: "2x",
    img: troc,
    pricePerDay: 800,
    specs: [
      { icon: Settings2, label: "Boîte automatique" },
      { icon: Fuel, label: "Essence" },
      { icon: Users, label: "5 places" },
      { icon: Briefcase, label: "Coffre 445 L" },
      { icon: Snowflake, label: "Climatisation" },
      { icon: Camera, label: "Caméra de recul" },
    ],
    features: [
      'Écran tactile 10"',
      "Apple CarPlay & Android Auto",
      "Volant multifonction",
      "Régulateur / limiteur de vitesse",
      "Démarrage sans clé",
      "Jantes alliage",
    ],
  },
  {
    name: "Peugeot 208 2026",
    qty: "2x",
    img: p208,
    pricePerDay: 400,
    specs: [
      { icon: Settings2, label: "Boîte automatique" },
      { icon: Fuel, label: "Essence" },
      { icon: Users, label: "5 places" },
      { icon: Briefcase, label: "Coffre 309 L" },
      { icon: Snowflake, label: "Climatisation" },
      { icon: Camera, label: "Caméra de recul" },
    ],
    features: [
      'Écran tactile 10"',
      "Peugeot i-Cockpit Digital",
      "Apple CarPlay & Android Auto",
      "Régulateur / limiteur de vitesse",
      "Démarrage sans clé",
      "Jantes alliage",
    ],
  },
  {
    name: "Opel Corsa 2026",
    qty: "3x",
    img: corsa,
    pricePerDay: 400,
    specs: [
      { icon: Settings2, label: "Boîte automatique" },
      { icon: Fuel, label: "Essence" },
      { icon: Users, label: "5 places" },
      { icon: Briefcase, label: "Coffre 309 L" },
      { icon: Snowflake, label: "Climatisation auto" },
      { icon: Camera, label: "Caméra de recul" },
    ],
    features: [
      'Écran tactile 10"',
      "Apple CarPlay & Android Auto",
      "Régulateur / limiteur de vitesse",
      "Démarrage sans clé",
      "Climatisation automatique",
      "Jantes alliage",
    ],
  },
];

export function Fleet() {
  const { open } = useReservation();
  return (
    <section id="flotte" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-primary/10 blur-[140px]" />

      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 mb-6">
            <span className="text-xs tracking-[0.25em] uppercase text-silver">
              Notre flotte 2026
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black">
            <span className="text-silver">CONFORT · </span>
            <span className="text-gradient">ÉLÉGANCE</span>
            <span className="text-silver"> · PERFORMANCE</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg">
            Une sélection de véhicules récents, 100% automatiques, équipés premium.
            Réservez en un clic via WhatsApp.
          </p>
        </motion.div>

        <div className="space-y-10">
          {cars.map((car, idx) => (
            <motion.article
              key={car.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className="group relative rounded-3xl border border-border bg-card/40 backdrop-blur-xl overflow-hidden hover:border-primary/60 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="grid lg:grid-cols-12 gap-0">
                {/* Image */}
                <div className="relative lg:col-span-5 aspect-[16/10] lg:aspect-auto overflow-hidden">
                  <motion.img
                    src={car.img}
                    alt={car.name}
                    width={1280}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />
                  <div className="absolute top-5 left-5 px-3 py-1 rounded-md bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-sm font-bold shadow-lg">
                    {car.qty}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent lg:bg-gradient-to-r" />
                </div>

                {/* Info */}
                <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-display text-2xl sm:text-3xl font-black text-silver">
                        {car.name.toUpperCase()}
                      </h3>
                      <p className="text-sm text-muted-foreground tracking-widest uppercase mt-1">
                        Boîte automatique · Premium
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        À partir de
                      </div>
                      <div className="font-display text-3xl text-gradient">
                        {car.pricePerDay} DH
                        <span className="text-sm text-muted-foreground font-sans"> / jour</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-8">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">
                        Caractéristiques
                      </div>
                      <ul className="space-y-2.5">
                        {car.specs.map((s) => (
                          <li key={s.label} className="flex items-center gap-3 text-sm">
                            <s.icon className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-foreground/90">{s.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">
                        Équipements premium
                      </div>
                      <ul className="space-y-2.5">
                        {car.features.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-sm">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-foreground/90">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => open(car.name)}
                      className="group/btn inline-flex items-center gap-2 px-6 h-12 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-[0_0_30px_oklch(0.62_0.22_255_/_0.4)] hover:shadow-[0_0_50px_oklch(0.62_0.22_255_/_0.7)] hover:scale-[1.02] transition-all"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Réserver maintenant
                    </button>
                    <a
                      href="tel:+212704957685"
                      className="inline-flex items-center gap-2 px-6 h-12 rounded-full border border-border text-silver font-medium hover:border-primary hover:bg-primary/10 transition"
                    >
                      Appeler maintenant
                    </a>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}