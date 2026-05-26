import { motion } from "motion/react";
import {
  ShieldCheck,
  Wrench,
  Armchair,
  MapPin,
  Star,
  Clock,
} from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Véhicules récents 2026", desc: "Une flotte renouvelée, contrôlée et impeccable." },
  { icon: Wrench, title: "Entretien régulier", desc: "Maintenance suivie pour votre sécurité totale." },
  { icon: Armchair, title: "Confort premium", desc: "Intérieurs soignés, équipements haut de gamme." },
  { icon: MapPin, title: "Disponibles partout", desc: "Livraison sur demande à l'endroit qui vous arrange." },
  { icon: Star, title: "Service haut de gamme", desc: "Une expérience client à la hauteur de votre exigence." },
  { icon: Clock, title: "Réservation rapide", desc: "Un message WhatsApp suffit. Réponse immédiate." },
];

export function Advantages() {
  return (
    <section id="avantages" className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mb-16"
        >
          <div className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Pourquoi AM Elite Drive
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-silver">
            VOTRE SATISFACTION,
            <br />
            <span className="text-gradient">NOTRE PRIORITÉ.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative p-7 rounded-2xl border border-border bg-card/40 backdrop-blur-xl hover:border-primary/60 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center shadow-[0_0_20px_oklch(0.62_0.22_255_/_0.4)] mb-5">
                  <it.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg text-silver mb-2">
                  {it.title.toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}