import { motion } from "motion/react";
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
  Star,
  ShieldCheck,
} from "lucide-react";
import { useReservation } from "./ReservationProvider";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Car = {
  name: string;
  qty: string;
  img: string;
  pricePerDay: number;
  transmission: "Automatique" | "Manuelle";
  specs: { icon: typeof Fuel; label: string }[];
  features: string[];
};

const corsaFeatures = [
  'Écran tactile 10"',
  "Apple CarPlay & Android Auto",
  "Régulateur / limiteur de vitesse",
  "Démarrage sans clé",
  "Climatisation automatique",
  "Jantes alliage",
];

const baseSpecs = (transmission: "Automatique" | "Manuelle", fuel: string, coffre: string) => [
  { icon: Settings2, label: `Boîte ${transmission.toLowerCase()}` },
  { icon: Fuel, label: fuel },
  { icon: Users, label: "5 places" },
  { icon: Briefcase, label: `Coffre ${coffre}` },
  { icon: Snowflake, label: "Climatisation" },
  { icon: Camera, label: "Caméra de recul" },
];

const automatiques: Car[] = [
  {
    name: "Opel Corsa 2026 Automatique",
    qty: "2x",
    img: corsa,
    pricePerDay: 350,
    transmission: "Automatique",
    specs: baseSpecs("Automatique", "Essence", "309 L"),
    features: corsaFeatures,
  },
];

const manuelles: Car[] = [
  {
    name: "Opel Corsa 2026 Manuelle",
    qty: "4x",
    img: corsa,
    pricePerDay: 300,
    transmission: "Manuelle",
    specs: baseSpecs("Manuelle", "Diesel", "309 L"),
    features: corsaFeatures,
  },
];

type DbReview = {
  id: string;
  car: string;
  author_name: string;
  city: string | null;
  rating: number;
  comment: string;
  created_at: string;
};

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Note ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i;
        const half = !filled && value >= i - 0.5;
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${size} text-muted-foreground/40`} />
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star className={`${size} text-amber-400 fill-amber-400`} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function CarCard({
  car,
  idx,
  onReserve,
  reviews,
}: {
  car: Car;
  idx: number;
  onReserve: (name: string) => void;
  reviews: DbReview[];
}) {
  const avg =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;
  const shown = reviews.slice(0, 3);
  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: idx * 0.1 }}
      className="group relative rounded-3xl border border-border bg-card/60 md:backdrop-blur-xl overflow-hidden hover:border-primary/60 transition-all duration-500"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="grid lg:grid-cols-12 gap-0">
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent lg:bg-gradient-to-r" />
        </div>

        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-silver">
                {car.name.toUpperCase()}
              </h3>
              <p className="text-sm text-muted-foreground tracking-widest uppercase mt-1">
                Boîte {car.transmission.toLowerCase()} · Premium
              </p>
              {avg !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <Stars value={avg} />
                  <span className="text-sm font-semibold text-silver">{avg.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({reviews.length} avis vérifié{reviews.length > 1 ? "s" : ""})
                  </span>
                </div>
              )}
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

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs uppercase tracking-[0.25em] text-primary inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Avis clients vérifiés
              </div>
              {avg !== null && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Stars value={avg} size="h-3 w-3" />
                  <span>{avg.toFixed(1)} / 5</span>
                </div>
              )}
            </div>
            {shown.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background/30 p-5 text-sm text-muted-foreground">
                Aucun avis pour l'instant. Soyez le premier à laisser votre témoignage
                après votre location — un lien de dépôt d'avis vous sera envoyé.
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {shown.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-border bg-background/40 p-4 hover:border-primary/40 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-silver flex items-center gap-1.5">
                          {r.author_name}
                          <ShieldCheck
                            className="h-3 w-3 text-primary"
                            aria-label="Vérifié"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.city ? `${r.city} · ` : ""}
                          {new Date(r.created_at).toLocaleDateString("fr-FR", {
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <Stars value={r.rating} size="h-3 w-3" />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-border flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onReserve(car.name)}
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
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex items-center gap-4 mb-8"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <h3 className="font-display text-xl sm:text-2xl font-black text-gradient whitespace-nowrap">
        {title}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </motion.div>
  );
}

export function Fleet() {
  const { open } = useReservation();
  const [reviews, setReviews] = useState<DbReview[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, car, author_name, city, rating, comment, created_at")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(60);
      if (!cancel && data) setReviews(data as DbReview[]);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const byCar = useMemo(() => {
    const m = new Map<string, DbReview[]>();
    for (const r of reviews) {
      const list = m.get(r.car) ?? [];
      list.push(r);
      m.set(r.car, list);
    }
    return m;
  }, [reviews]);

  return (
    <section id="flotte" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-primary/10 blur-[140px]" />

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
            Une sélection de véhicules récents, équipés premium.
            Réservez en un clic via WhatsApp.
          </p>
        </motion.div>

        <div className="mb-20">
          <SectionHeader title="BOÎTE AUTOMATIQUE" />
          <div className="space-y-10">
            {automatiques.map((car, idx) => (
              <CarCard
                key={car.name}
                car={car}
                idx={idx}
                onReserve={open}
                reviews={byCar.get(car.name) ?? []}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="BOÎTE MANUELLE" />
          <div className="space-y-10">
            {manuelles.map((car, idx) => (
              <CarCard
                key={car.name}
                car={car}
                idx={idx}
                onReserve={open}
                reviews={byCar.get(car.name) ?? []}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
