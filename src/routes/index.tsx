import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Fleet } from "@/components/site/Fleet";
import { Advantages } from "@/components/site/Advantages";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { ReservationProvider } from "@/components/site/ReservationProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AM Elite Drive — Location de voitures premium 2026 au Maroc" },
      {
        name: "description",
        content:
          "AM Elite Drive : location de voitures Opel Corsa 2026 automatiques et manuelles. Réservation rapide WhatsApp · 0704 957 685.",
      },
      { property: "og:title", content: "AM Elite Drive — Location de voitures premium" },
      {
        property: "og:description",
        content:
          "Flotte Opel Corsa 2026 automatique et manuelle, équipements premium. La conduite, en mieux.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ReservationProvider>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navbar />
        <main>
          <Hero />
          <Fleet />
          <Advantages />
          <Contact />
        </main>
        <Footer />
        <WhatsAppFab />
      </div>
    </ReservationProvider>
  );
}
