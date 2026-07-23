import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Star, Loader2, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/avis/$token")({
  component: ReviewPage,
  head: () => ({
    meta: [
      { title: "Laisser un avis — AM Elite Drive" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-2xl text-silver mb-2">Une erreur est survenue</h1>
        <p className="text-sm text-muted-foreground">{String(error?.message ?? error)}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <p className="text-muted-foreground">Lien introuvable.</p>
    </div>
  ),
});

type Info = {
  reservation_id: string;
  car: string;
  end_date: string;
  name: string;
  already_reviewed: boolean;
  can_review: boolean;
};

function ReviewPage() {
  const { token } = useParams({ from: "/avis/$token" });
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const res = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "get", token }),
      });
      const payload = await res.json().catch(() => ({}));
      if (cancel) return;
      if (!res.ok || payload.error) setError(payload.error || "Erreur");
      else {
        const row = payload.data;
        if (!row) setError("Lien invalide ou expiré.");
        else {
          setInfo(row as Info);
          setAuthor(((row as Info).name ?? "").split(" ")[0] ?? "");
        }
      }
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return setError("Choisissez une note.");
    if (comment.trim().length < 5) return setError("Votre commentaire est trop court.");
    if (author.trim().length < 2) return setError("Indiquez votre prénom / nom.");
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/public/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "submit",
        token,
        rating,
        comment: comment.trim(),
        author_name: author.trim(),
        city: city.trim(),
      }),
    });
    const payload = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok || payload.error) return setError(payload.error || "Erreur");
    setDone(true);
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="hidden md:block absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/10 blur-[140px]" />

      <div className="relative container mx-auto px-6 py-16 max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au site
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-primary/30 bg-card/70 md:backdrop-blur-xl p-8 sm:p-10 shadow-[var(--shadow-elegant)]"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-xs uppercase tracking-widest text-silver mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Avis vérifié
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-silver">
            LAISSEZ VOTRE <span className="text-gradient">AVIS</span>
          </h1>

          {loading && (
            <div className="mt-8 flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Vérification du lien…
            </div>
          )}

          {!loading && error && !info && (
            <p className="mt-6 text-sm text-destructive">{error}</p>
          )}

          {!loading && info && done && (
            <div className="mt-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
              <h2 className="mt-4 font-display text-2xl text-silver">Merci pour votre avis !</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Votre témoignage aide d'autres clients à choisir en toute confiance.
              </p>
              <Link
                to="/"
                className="inline-flex mt-6 items-center gap-2 px-6 h-11 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold"
              >
                Retour à l'accueil
              </Link>
            </div>
          )}

          {!loading && info && !done && info.already_reviewed && (
            <p className="mt-6 text-sm text-muted-foreground">
              Un avis a déjà été laissé pour cette réservation. Merci !
            </p>
          )}

          {!loading && info && !done && !info.already_reviewed && !info.can_review && (
            <p className="mt-6 text-sm text-muted-foreground">
              Vous pourrez laisser votre avis à partir du{" "}
              <span className="text-silver font-medium">
                {new Date(info.end_date).toLocaleDateString("fr-FR")}
              </span>{" "}
              (fin de votre location).
            </p>
          )}

          {!loading && info && !done && !info.already_reviewed && info.can_review && (
            <>
              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30 text-sm">
                <div className="text-xs uppercase tracking-widest text-primary mb-1">
                  Réservation vérifiée
                </div>
                <div className="text-silver font-medium">{info.car}</div>
                <div className="text-xs text-muted-foreground">
                  Location terminée le{" "}
                  {new Date(info.end_date).toLocaleDateString("fr-FR")}
                </div>
              </div>

              <form onSubmit={submit} className="mt-7 space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-widest text-primary mb-3 block">
                    Votre note
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i)}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(0)}
                        aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
                        className="p-1"
                      >
                        <Star
                          className={`h-8 w-8 transition ${
                            (hover || rating) >= i
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-primary mb-2 block">
                      Prénom / Nom
                    </label>
                    <input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      maxLength={40}
                      className="w-full h-11 px-4 rounded-xl bg-background/60 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-primary mb-2 block">
                      Ville (optionnel)
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      maxLength={40}
                      placeholder="Casablanca…"
                      className="w-full h-11 px-4 rounded-xl bg-background/60 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-primary mb-2 block">
                    Votre commentaire
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={600}
                    rows={5}
                    placeholder="Partagez votre expérience avec AM Elite Drive…"
                    className="w-full px-4 py-3 rounded-xl bg-background/60 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                  />
                  <div className="text-[11px] text-muted-foreground mt-1 text-right">
                    {comment.length}/600
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-7 h-12 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-[0_0_40px_oklch(0.62_0.22_255_/_0.5)] hover:scale-[1.02] transition disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
                    </>
                  ) : (
                    <>Publier mon avis</>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}