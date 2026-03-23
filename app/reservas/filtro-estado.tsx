"use client";

import { useRouter } from "next/navigation";

const estados = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "confirmada", etiqueta: "Confirmada" },
  { valor: "cancelada", etiqueta: "Cancelada" },
];

export function FiltroEstado({ estadoActual }: { estadoActual?: string }) {
  const router = useRouter();

  function manejarCambio(valor: string) {
    if (valor === "todos") {
      router.push("/reservas");
    } else {
      router.push(`/reservas?estado=${valor}`);
    }
  }

  return (
    <div className="flex gap-2 mb-6">
      {estados.map(({ valor, etiqueta }) => (
        <button
          key={valor}
          onClick={() => manejarCambio(valor)}
          className={`text-xs px-3 py-1.5 rounded border transition-colors ${
            (estadoActual === valor) || (!estadoActual && valor === "todos")
              ? "bg-black text-white border-black"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          {etiqueta}
        </button>
      ))}
    </div>
  );
}