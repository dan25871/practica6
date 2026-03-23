"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Esquema de validación para el formulario de reserva.
// servicioId llega como string desde el select y se convierte a número con z.coerce.
const EsquemaReserva = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio."),
  correo: z.string().email("El correo no es válido."),
  fecha: z.string().min(1, "La fecha es obligatoria."),
  servicioId: z.coerce.number({ message: "Debe seleccionar un servicio." }),
});

// Crea una nueva reserva asociada a un servicio existente.
// Ejercicio 1: Valida disponibilidad antes de crear.
export async function crearReserva(_estadoPrevio: any, formData: FormData) {
  const campos = EsquemaReserva.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    fecha: formData.get("fecha"),
    servicioId: formData.get("servicioId"),
  });

  // Si la validación falla, se retorna el objeto de errores al componente.
  if (!campos.success) {
    return {
      errores: campos.error.flatten().fieldErrors,
      mensaje: "Error de validación.",
    };
  }

  // --- Ejercicio 1: Validación de disponibilidad ---
  const fechaSolicitada = new Date(campos.data.fecha);

  // Obtener la duración del servicio solicitado
  const servicio = await prisma.servicio.findUnique({
    where: { id: campos.data.servicioId },
  });

  if (!servicio) {
    return {
      errores: { servicioId: ["El servicio seleccionado no existe."] },
      mensaje: "Error de validación.",
    };
  }

  const duracionMs = servicio.duracion * 60 * 1000; // duración en milisegundos
  const inicioSolicitado = fechaSolicitada.getTime();
  const finSolicitado = inicioSolicitado + duracionMs;

  // Buscar reservas existentes para el mismo servicio que no estén canceladas
  const reservasExistentes = await prisma.reserva.findMany({
    where: {
      servicioId: campos.data.servicioId,
      estado: { not: "cancelada" },
    },
    include: { servicio: true },
  });

  // Verificar si hay conflicto de horario
  for (const reserva of reservasExistentes) {
    const inicioExistente = new Date(reserva.fecha).getTime();
    const finExistente = inicioExistente + reserva.servicio.duracion * 60 * 1000;

    // Hay conflicto si los rangos se solapan
    if (inicioSolicitado < finExistente && finSolicitado > inicioExistente) {
      return {
        errores: {
          fecha: [
            `Ya existe una reserva para este servicio entre ${new Date(inicioExistente).toLocaleString("es-SV")} y ${new Date(finExistente).toLocaleString("es-SV")}.`,
          ],
        },
        mensaje: "Conflicto de horario.",
      };
    }
  }
  // --- Fin Ejercicio 1 ---

  await prisma.reserva.create({
    data: {
      nombre: campos.data.nombre,
      correo: campos.data.correo,
      fecha: new Date(campos.data.fecha),
      servicioId: campos.data.servicioId,
    },
  });

  revalidatePath("/reservas");
  redirect("/reservas");
}

// Elimina una reserva por ID.
export async function eliminarReserva(id: number) {
  try {
    await prisma.reserva.delete({ where: { id } });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo eliminar la reserva." };
  }
}

// --- Ejercicio 2: Cancelación de reservas ---
// Cambia el estado de una reserva a "cancelada" en lugar de eliminarla.
export async function cancelarReserva(id: number) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: { estado: "cancelada" },
    });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo cancelar la reserva." };
  }
}

// --- Ejercicio 4: Confirmación de reservas ---
// Cambia el estado de una reserva de "pendiente" a "confirmada".
export async function confirmarReserva(id: number) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: { estado: "confirmada" },
    });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo confirmar la reserva." };
  }
}