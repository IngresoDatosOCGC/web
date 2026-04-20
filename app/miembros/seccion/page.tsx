import { getSessionUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import SeccionPageClient from "./SeccionPageClient";

export default async function Page() {
  const user = await getSessionUser();

  if (!user || (!user.isMaster && !user.isSectionLeader)) {
    redirect("/miembros/tablon");
  }

  return <SeccionPageClient />;
}
