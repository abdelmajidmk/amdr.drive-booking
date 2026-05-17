import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  return (
    <motion.a
      href="https://wa.me/212704957685?text=Bonjour%20AM%20Drive%2C%20je%20souhaite%20r%C3%A9server%20un%20v%C3%A9hicule."
      target="_blank"
      rel="noreferrer"
      aria-label="Réserver sur WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-40 h-14 w-14 grid place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[0_0_40px_oklch(0.62_0.22_255_/_0.6)] animate-glow"
    >
      <MessageCircle className="h-6 w-6" />
    </motion.a>
  );
}