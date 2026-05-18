import { motion } from "motion/react";
import { Phone, MessageCircle, Instagram, Calendar } from "lucide-react";
import { useReservation } from "./ReservationProvider";

export function Contact() {
  const { open } = useReservation();
  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-primary/20 blur-[140px]"
      />

      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto rounded-3xl border border-primary/30 bg-card/60 backdrop-blur-2xl overflow-hidden shadow-[var(--shadow-elegant)]"
        >
          <div className="p-10 sm:p-16 text-center">
            <div className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
              Réservez maintenant
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black text-silver">
              PRÊT À PRENDRE
              <br />
              <span className="text-gradient">LA ROUTE ?</span>
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-muted-foreground">
              Réservation facile à la journée, week-end ou longue durée.
              Contactez Amine Mouktir directement — réponse rapide garantie.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => open()}
                className="inline-flex items-center gap-3 px-8 h-14 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-[0_0_40px_oklch(0.62_0.22_255_/_0.5)] hover:shadow-[0_0_60px_oklch(0.62_0.22_255_/_0.8)] hover:scale-105 transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                Réserver maintenant
              </button>
              <a
                href="tel:+212704957685"
                className="inline-flex items-center gap-3 px-8 h-14 rounded-full border border-border text-silver font-medium hover:border-primary hover:bg-primary/10 transition"
              >
                <Phone className="h-5 w-5" /> Appeler
              </a>
              <a
                href="https://www.instagram.com/amdr.ive"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 h-14 rounded-full border border-border text-silver font-medium hover:border-primary hover:bg-primary/10 transition"
              >
                <Instagram className="h-5 w-5" /> @amdr.ive
              </a>
            </div>

            <div className="mt-12 grid sm:grid-cols-3 gap-6 pt-10 border-t border-border">
              {[
                { icon: Phone, t: "Téléphone", v: "0704 957 685" },
                { icon: Calendar, t: "Durée", v: "Jour · Week-end · Long terme" },
                { icon: MessageCircle, t: "Réservation", v: "Instantanée via WhatsApp" },
              ].map((c) => (
                <div key={c.t} className="text-left">
                  <c.icon className="h-5 w-5 text-primary mb-3" />
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {c.t}
                  </div>
                  <div className="text-silver font-medium mt-1">{c.v}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}