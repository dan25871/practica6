import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BotonEliminarReserva } from "./boton-eliminar";
import { BotonCancelarReserva } from "./boton-cancelar";
import { BotonConfirmarReserva } from "./boton-confirmar";
import { FiltroEstado } from "./filtro-estado";
import { tarjeta } from "@/app/lib/estilos";

const etiquetaEstado: Record<string, string> = {
  pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmada: "bg-green-50 text-green-700 border-green-200",
  cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

// Ejercicio 3: searchParams permite leer los parámetros de la URL
export default async function PaginaReservas({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const params = await searchParams;
  const estadoFiltro = params.estado;

  // Si hay un filtro de estado, se aplica en la consulta de Prisma
  const reservas = await prisma.reserva.findMany({
    orderBy: { fecha: "asc" },
    include: { servicio: true },
    ...(estadoFiltro && estadoFiltro !== "todos"
      ? { where: { estado: estadoFiltro } }
      : {}),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Reservas</h1>
        <Link
          href="/reservas/nueva"
          className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
        >
          Nueva reserva
        </Link>
      </div>

      {/* Ejercicio 3: Filtro por estado */}
      <FiltroEstado estadoActual={estadoFiltro} />

      {reservas.length === 0 ? (
        <p className="text-sm text-gray-400">No hay reservas registradas.</p>
      ) : (
        <ul className="space-y-3">
          {reservas.map((reserva) => (
            <li
              key={reserva.id}
              className={`${tarjeta} flex items-start justify-between`}
            >
              <div>
                <p className="font-medium text-sm">{reserva.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">{reserva.correo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {reserva.servicio.nombre} —{" "}
                  {new Date(reserva.fecha).toLocaleString("es-SV")}
                </p>
                <span
                  className={`inline-block mt-2 text-xs px-2 py-0.5 rounded border ${
                    etiquetaEstado[reserva.estado] ?? etiquetaEstado.pendiente
                  }`}
                >
                  {reserva.estado}
                </span>
              </div>
              <div className="text-right shrink-0 ml-4 flex flex-col gap-1">
                {/* Ejercicio 4: Botón confirmar solo si está pendiente */}
                {reserva.estado === "pendiente" && (
                  <BotonConfirmarReserva id={reserva.id} />
                )}
                {/* Ejercicio 2: Botón cancelar solo si no está cancelada */}
                {reserva.estado !== "cancelada" && (
                  <BotonCancelarReserva id={reserva.id} />
                )}
                <BotonEliminarReserva id={reserva.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}