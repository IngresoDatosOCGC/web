import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default async function MiembrosPage() {
  const { userId } = await auth();
  
  // If not logged in, Clerk middleware should catch it, but double check
  if (!userId) {
    redirect("/sign-in");
  }

  // Get user profile details
  const user = await currentUser();
  
  // Read our custom roles from Clerk's publicMetadata
  // You would set this in the Clerk Dashboard -> User -> Public Metadata
  // Example: { "roles": ["Violín I", "Archivero"] }
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];
  const isMaster = user?.publicMetadata?.isMaster as boolean;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Panel de Miembros OCGC</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>Hola, {user?.firstName}</span>
          <UserButton />
        </div>
      </header>

      <section>
        <h2>Mis Permisos Actuales</h2>
        <ul>
          {userRoles.length > 0 ? (
            userRoles.map(role => <li key={role}>Asignado a: <strong>{role}</strong></li>)
          ) : (
            <li>No tienes secciones asignadas. Eres público.</li>
          )}
          {isMaster && <li>👑 Eres Master (Director/Admin)</li>}
        </ul>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Siguiente paso</h2>
        <p>Aquí conectaríamos con la base de datos Neon (Drizzle) para buscar en la tabla <code>scores</code> las partituras donde <code>allowedRoles</code> coincida con tus roles actuales.</p>
      </section>
    </div>
  );
}
