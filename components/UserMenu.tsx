"use client";

import { useSupabaseUser } from "@/lib/supabase-auth-context";
import { LogOut } from "lucide-react";

export default function UserMenu() {
  const { user, signOut } = useSupabaseUser();

  if (!user) return null;

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0];

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-white">Hola, {firstName}</span>
      <button
        onClick={() => signOut()}
        className="p-2 text-gray-300 hover:text-white transition-colors"
        title="Cerrar sesión"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
