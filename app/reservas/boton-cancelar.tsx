"use client";

import { cancelarReserva } from "@/app/actions/reservas";
import { useState } from "react";

export function BotonCancelarReserva({ id }: { id: number }) {
  const [error, setError] = useState<string | null>(null);

  async function manejarClick() {
    const resultado = await cancelarReserva(id);
    if (!resultado.exito) {
      setError(resultado.mensaje ?? "Error desconocido.");
    }
  }

  return (
    <div>
      <button
        onClick={manejarClick}
        className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors"
      >
        Cancelar
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}