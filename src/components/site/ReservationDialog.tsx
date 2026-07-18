import { useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import { X, MessageCircle, Calendar as CalIcon, User, Phone, MapPin, Car as CarIcon, Clock, IdCard, FileText, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const CARS = [
  { name: "Opel Corsa 2026 Automatique", price: 350, fuel: "Diesel", model: "Opel Corsa Automatique" },
  { name: "Opel Corsa 2026 Manuelle", price: 300, fuel: "Diesel", model: "Opel Corsa Manuelle" },
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(80, "Nom trop long"),
  phone: z
    .string()
    .trim()
    .min(8, "Numéro invalide")
    .max(20, "Numéro invalide")
    .regex(/^[0-9+\s()-]+$/, "Numéro invalide"),
  cin: z
    .string()
    .trim()
    .min(4, "CIN invalide")
    .max(20, "CIN invalide")
    .regex(/^[A-Za-z0-9-]+$/, "CIN invalide"),
  permis: z
    .string()
    .trim()
    .min(4, "N° de permis invalide")
    .max(30, "N° de permis invalide")
    .regex(/^[A-Za-z0-9\/-]+$/, "N° de permis invalide"),
  car: z.string().min(1, "Choisissez un véhicule"),
  pickup: z.string().trim().min(2, "Lieu requis").max(100),
  startDate: z.string().min(1, "Date requise"),
  endDate: z.string().min(1, "Date requise"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Heure requise"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Heure requise"),
  notes: z.string().trim().max(400, "Message trop long").optional(),
})
  .refine(
    (v) => new Date(`${v.endDate}T00:00`) >= new Date(`${v.startDate}T00:00`),
    { message: "La date de fin doit être identique ou postérieure à la date de début.", path: ["endDate"] }
  )
  .refine(
    (v) =>
      v.startDate !== v.endDate ||
      (v.startTime && v.endTime && v.endTime > v.startTime),
    {
      message:
        "Pour une même journée, l'heure de restitution doit être postérieure à l'heure de prise en charge.",
      path: ["endTime"],
    }
  );

type FormValues = z.infer<typeof schema>;

function priceOf(name: string) {
  return CARS.find((c) => c.name === name)?.price ?? 0;
}

function carInfo(name: string) {
  return CARS.find((c) => c.name === name);
}

function daysBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return d > 0 ? Math.ceil(d) : d === 0 ? 1 : 0;
}

export function ReservationDialog({
  open,
  onClose,
  defaultCar,
}: {
  open: boolean;
  onClose: () => void;
  defaultCar?: string;
}) {
  const [values, setValues] = useState<FormValues>({
    name: "",
    phone: "",
    cin: "",
    permis: "",
    car: defaultCar ?? CARS[0].name,
    pickup: "",
    startDate: "",
    endDate: "",
    startTime: "10:00",
    endTime: "10:00",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [cinFile, setCinFile] = useState<File | null>(null);
  const [permisFile, setPermisFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // sync default car when opened
  if (open && defaultCar && values.car !== defaultCar && !errors.car) {
    // only update once when defaultCar provided
  }

  const days = daysBetween(values.startDate, values.endDate);
  const total = days * priceOf(values.car);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }
    if (!cinFile || !permisFile) {
      setFileError("Veuillez joindre la photo du CIN et celle du permis.");
      return;
    }
    const MAX = 8 * 1024 * 1024;
    if (cinFile.size > MAX || permisFile.size > MAX) {
      setFileError("Chaque fichier doit faire moins de 8 Mo.");
      return;
    }
    setFileError(undefined);
    const v = parsed.data;
    const d = daysBetween(v.startDate, v.endDate);
    const t = d * priceOf(v.car);
    const info = carInfo(v.car);
    setSubmitting(true);
    let cinUrl = "";
    let permisUrl = "";
    try {
      const stamp = Date.now();
      const safe = v.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 24) || "client";
      const cinPath = `${stamp}-${safe}/cin-${cinFile.name}`;
      const permisPath = `${stamp}-${safe}/permis-${permisFile.name}`;
      const [cinUp, permisUp] = await Promise.all([
        supabase.storage.from("reservation-docs").upload(cinPath, cinFile, { upsert: false }),
        supabase.storage.from("reservation-docs").upload(permisPath, permisFile, { upsert: false }),
      ]);
      if (cinUp.error) throw cinUp.error;
      if (permisUp.error) throw permisUp.error;
      const expiresIn = 60 * 60 * 24 * 30; // 30 days
      const [cinSigned, permisSigned] = await Promise.all([
        supabase.storage.from("reservation-docs").createSignedUrl(cinPath, expiresIn),
        supabase.storage.from("reservation-docs").createSignedUrl(permisPath, expiresIn),
      ]);
      cinUrl = cinSigned.data?.signedUrl ?? cinPath;
      permisUrl = permisSigned.data?.signedUrl ?? permisPath;

      await supabase.from("reservations").insert({
        name: v.name,
        phone: v.phone,
        cin: v.cin,
        permis: v.permis,
        car: v.car,
        pickup: v.pickup,
        start_date: v.startDate,
        end_date: v.endDate,
        start_time: v.startTime,
        end_time: v.endTime,
        days: d,
        total_dh: t,
        notes: v.notes || null,
        cin_url: cinUrl,
        permis_url: permisUrl,
      });
    } catch (err) {
      console.error(err);
      setFileError("L'envoi des fichiers a échoué, réessayez.");
      setSubmitting(false);
      return;
    }

    const msg =
      `Bonjour AM Elite Drive 👋\n\n` +
      `Je souhaite réserver un véhicule :\n\n` +
      `👤 Nom : ${v.name}\n` +
      `📞 Téléphone : ${v.phone}\n` +
      `🪪 CIN : ${v.cin}\n` +
      `📄 Permis : ${v.permis}\n` +
      `🚗 Véhicule : ${v.car}\n` +
      `🏷 Modèle : ${info?.model ?? v.car}\n` +
      `⛽ Carburant : ${info?.fuel ?? "—"}\n` +
      `📍 Lieu de prise en charge : ${v.pickup}\n` +
      `📅 Du : ${v.startDate}\n` +
      `📅 Au : ${v.endDate}\n` +
      `🕒 Prise en charge : ${v.startTime}\n` +
      `🕒 Restitution : ${v.endTime}\n` +
      `⏱ Durée : ${d} jour(s)\n` +
      `💰 Tarif estimé : ${t} DH (${priceOf(v.car)} DH/jour)\n` +
      `\n🖼 Photo CIN : ${cinUrl}\n` +
      `🖼 Photo Permis : ${permisUrl}\n` +
      (v.notes ? `\n📝 Notes : ${v.notes}\n` : "") +
      `\nMerci de me confirmer la disponibilité.`;
    const url = `https://wa.me/212704957685?text=${encodeURIComponent(msg)}`;
    // Use a synchronous anchor click — works reliably on desktop (no popup blocker
    // issues since this runs in the submit handler call stack).
    const newTab = window.open(url, "_blank", "noopener,noreferrer");
    if (!newTab) {
      // Popup blocked → navigate current tab as fallback.
      window.location.href = url;
      return;
    }
    setSubmitting(false);
    onClose();
  };

  const inputCls =
    "w-full h-11 px-4 rounded-xl bg-background/60 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition text-sm";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-primary/30 bg-card shadow-[var(--shadow-elegant)]"
          >
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full border border-border hover:border-primary hover:bg-primary/10 transition z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8 sm:p-10">
              <div className="text-xs tracking-[0.3em] uppercase text-primary mb-2">
                Réservation
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-silver">
                RÉSERVEZ VOTRE <span className="text-gradient">VÉHICULE</span>
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Remplissez le formulaire — votre demande sera envoyée directement sur
                WhatsApp à AM Elite Drive.
              </p>

              <form onSubmit={submit} className="mt-7 grid sm:grid-cols-2 gap-5">
                <Field label="Nom complet" icon={User} error={errors.name}>
                  <input
                    className={inputCls}
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Votre nom"
                    maxLength={80}
                  />
                </Field>

                <Field label="Téléphone" icon={Phone} error={errors.phone}>
                  <input
                    className={inputCls}
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="06 12 34 56 78"
                    inputMode="tel"
                    maxLength={20}
                  />
                </Field>

                <Field label="N° CIN" icon={IdCard} error={errors.cin}>
                  <input
                    className={inputCls}
                    value={values.cin}
                    onChange={(e) => set("cin", e.target.value.toUpperCase())}
                    placeholder="AB123456"
                    maxLength={20}
                  />
                </Field>

                <Field label="N° Permis de conduire" icon={FileText} error={errors.permis}>
                  <input
                    className={inputCls}
                    value={values.permis}
                    onChange={(e) => set("permis", e.target.value.toUpperCase())}
                    placeholder="123456/AB"
                    maxLength={30}
                  />
                </Field>

                <Field label="Photo du CIN" icon={Upload} className="sm:col-span-1">
                  <FileInput
                    file={cinFile}
                    onChange={setCinFile}
                    accept="image/*,application/pdf"
                  />
                </Field>

                <Field label="Photo du Permis" icon={Upload} className="sm:col-span-1">
                  <FileInput
                    file={permisFile}
                    onChange={setPermisFile}
                    accept="image/*,application/pdf"
                  />
                </Field>

                {fileError && (
                  <div className="sm:col-span-2 text-xs text-destructive">{fileError}</div>
                )}

                <Field label="Véhicule" icon={CarIcon} error={errors.car} className="sm:col-span-2">
                  <select
                    className={inputCls}
                    value={values.car}
                    onChange={(e) => set("car", e.target.value)}
                  >
                    {CARS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} — {c.price} DH / jour
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Lieu de prise en charge" icon={MapPin} error={errors.pickup} className="sm:col-span-2">
                  <input
                    className={inputCls}
                    value={values.pickup}
                    onChange={(e) => set("pickup", e.target.value)}
                    placeholder="Ville, aéroport, adresse…"
                    maxLength={100}
                  />
                </Field>

                <Field label="Date de début" icon={CalIcon} error={errors.startDate}>
                  <DateField
                    value={values.startDate}
                    onChange={(v) => set("startDate", v)}
                    minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </Field>

                <Field label="Date de fin" icon={CalIcon} error={errors.endDate}>
                  <DateField
                    value={values.endDate}
                    onChange={(v) => set("endDate", v)}
                    minDate={
                      values.startDate
                        ? new Date(values.startDate)
                        : new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </Field>

                <Field label="Heure de prise en charge" icon={Clock} error={errors.startTime}>
                  <input
                    type="time"
                    className={inputCls}
                    value={values.startTime}
                    onChange={(e) => set("startTime", e.target.value)}
                  />
                </Field>

                <Field label="Heure de restitution" icon={Clock} error={errors.endTime}>
                  <input
                    type="time"
                    className={inputCls}
                    value={values.endTime}
                    onChange={(e) => set("endTime", e.target.value)}
                  />
                </Field>

                <Field label="Notes (optionnel)" error={errors.notes} className="sm:col-span-2">
                  <textarea
                    className={`${inputCls} h-24 py-3 resize-none`}
                    value={values.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Détails supplémentaires…"
                    maxLength={400}
                  />
                </Field>

                {/* Summary — recalcul en temps réel */}
                <div className="sm:col-span-2 p-5 rounded-xl bg-primary/10 border border-primary/30 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prix par jour</span>
                    <span className="text-silver font-medium">{priceOf(values.car)} DH</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Nombre de jours</span>
                    <span className="text-silver font-medium">{days > 0 ? `${days} jour(s)` : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Calcul</span>
                    <span className="text-silver font-medium">
                      {days > 0 ? `${priceOf(values.car)} × ${days}` : "—"}
                    </span>
                  </div>
                  <div className="border-t border-primary/30 pt-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Total estimé
                    </span>
                    <span className="font-display text-2xl text-gradient">
                      {total > 0 ? `${total} DH` : "—"}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex items-center gap-3 px-7 h-13 py-3 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-[0_0_40px_oklch(0.62_0.22_255_/_0.5)] hover:shadow-[0_0_60px_oklch(0.62_0.22_255_/_0.8)] hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Envoyer sur WhatsApp
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-full border border-border text-silver hover:border-primary hover:bg-primary/10 transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  className,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        {label}
      </span>
      {children}
      {error && <span className="block mt-1.5 text-xs text-destructive">{error}</span>}
    </label>
  );
}

function DateField({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (v: string) => void;
  minDate?: Date;
}) {
  // existing date field
  const date = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-11 px-4 rounded-xl bg-background/60 border border-border text-left text-sm flex items-center justify-between hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "PPP", { locale: fr }) : "Choisir une date"}
          <CalIcon className="h-4 w-4 text-primary opacity-80" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[200] bg-popover border-border"
        align="start"
      >
        <Calendar
          mode="single"
          locale={fr}
          selected={date}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          disabled={(d) => (minDate ? d < minDate : false)}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function FileInput({
  file,
  onChange,
  accept,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  accept?: string;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3 w-full h-11 px-4 rounded-xl bg-background/60 border border-border cursor-pointer hover:border-primary/60 transition text-sm"
      )}
    >
      <span className={cn("truncate", !file && "text-muted-foreground")}>
        {file ? file.name : "Choisir un fichier (image ou PDF)"}
      </span>
      <Upload className="h-4 w-4 text-primary opacity-80 shrink-0" />
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}