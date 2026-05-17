import { motion } from "motion/react";
import heroImg from "@/assets/hero.jpg";
import { ArrowRight, Sparkles } from "lucide-react";
import { useReservation } from "./ReservationProvider";

export function Hero() {
  const { open } = useReservation();
  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={heroImg}
          alt="Voiture de luxe la nuit — AM Drive"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </motion.div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent-red/20 blur-[120px]"
      />

      <div className="relative container mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs tracking-[0.25em] uppercase text-silver">
            Flotte 2026 · Automatique
          </span>
        </motion.div>

        <h1 className="max-w-4xl font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight">
          {["LA", "CONDUITE,", "EN MIEUX."].map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.8, ease: "easeOut" }}
              className={`block ${i === 1 ? "text-gradient" : "text-silver"}`}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed"
        >
          Confort, élégance et performance. Louez nos véhicules 2026 entièrement
          automatiques — équipés des dernières technologies pour une expérience
          de conduite haut de gamme.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#flotte"
            className="group inline-flex items-center gap-3 px-8 h-14 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-[0_0_40px_oklch(0.62_0.22_255_/_0.5)] hover:shadow-[0_0_60px_oklch(0.62_0.22_255_/_0.8)] transition-all"
          >
            Découvrir la flotte
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </a>
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex items-center gap-3 px-8 h-14 rounded-full border border-border bg-card/40 backdrop-blur-md text-silver font-medium hover:border-primary hover:bg-primary/10 transition-all"
          >
            Réserver maintenant
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-20 grid grid-cols-3 gap-6 max-w-2xl"
        >
          {[
            { v: "7", l: "Véhicules 2026" },
            { v: "100%", l: "Automatique" },
            { v: "24/7", l: "Disponibilité" },
          ].map((s) => (
            <div
              key={s.l}
              className="border-l border-primary/40 pl-4"
            >
              <div className="font-display text-3xl sm:text-4xl text-silver">{s.v}</div>
              <div className="text-xs tracking-widest uppercase text-muted-foreground mt-1">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] text-muted-foreground"
      >
        SCROLL
      </motion.div>
    </section>
  );
}