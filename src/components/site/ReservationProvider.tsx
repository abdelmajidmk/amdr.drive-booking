import { createContext, useContext, useState, type ReactNode } from "react";
import { ReservationDialog } from "./ReservationDialog";

type Ctx = {
  open: (car?: string) => void;
};

const ReservationCtx = createContext<Ctx | null>(null);

export function useReservation() {
  const ctx = useContext(ReservationCtx);
  if (!ctx) throw new Error("useReservation must be inside ReservationProvider");
  return ctx;
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [car, setCar] = useState<string | undefined>(undefined);

  const open = (c?: string) => {
    setCar(c);
    setIsOpen(true);
  };

  return (
    <ReservationCtx.Provider value={{ open }}>
      {children}
      <ReservationDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        defaultCar={car}
      />
    </ReservationCtx.Provider>
  );
}