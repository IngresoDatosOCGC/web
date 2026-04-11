import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (!user.user_metadata?.isMaster) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const header = "ID,Fecha,Acción,UsuarioAuthID,Detalles(Estructurado)\n";
    const csvContent = logs.map(l => {
      // Extraemos la info resumida si el details es JSON
      const d = l.details as any;
      const detailsStr = typeof d === 'object' 
        ? JSON.stringify(d).replace(/"/g, '""') 
        : String(l.details || '').replace(/"/g, '""');
      return `${l.id},"${new Date(l.createdAt).toLocaleString()}","${l.action}","${l.userAuthId}","${detailsStr}"`;
    }).join('\n');

    return new NextResponse(header + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=logs_auditoria_ocgc_${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error) {
    console.error("Error exporting logs:", error);
    return new NextResponse("Error en el servidor", { status: 500 });
  }
}
