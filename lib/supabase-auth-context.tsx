"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthProfile {
  id: number;
  roles: string[];
  permissions: string[];
  isMaster: boolean;
  isArchiver: boolean;
  isSeller: boolean;
  isSectionLeader: boolean;
  name: string;
  surname: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null; // Datos extendidos del perfil (Verdad Absoluta)
  isLoading: boolean;
  isMaster: boolean;   // Cacheado en app_metadata (Fast UI)
  isArchiver: boolean; // Cacheado en app_metadata (Fast UI)
  isSeller: boolean;   // Cacheado en app_metadata (Fast UI)
  isSectionLeader: boolean; // Cacheado en app_metadata (Fast UI)
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Función para obtener el perfil real de la DB (Verdad Absoluta)
  const fetchProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setProfile(null);
      return;
    }
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching db profile:", err);
    }
  }, []);

  const refreshProfile = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    await fetchProfile(currentSession);
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession) await fetchProfile(initialSession);
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === "SIGNED_IN") {
        await fetchProfile(newSession);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/sign-in';
  };

  /**
   * 🛡️ Lógica de Permisos: 
   * Primero revisamos el perfil cargado de la DB (Verdad).
   * Si no está listo, usamos app_metadata como respaldo (Cache).
   */
  const hasPermission = (permission: string): boolean => {
    // 1. Usar Perfil de DB si está disponible
    if (profile) return profile.permissions.includes(permission) || profile.isMaster;
    
    // 2. Usar app_metadata como Caché (Rápido)
    const appData = user?.app_metadata;
    if (appData) {
      const perms = (appData.permissions as string[]) || [];
      return perms.includes(permission) || !!appData.isMaster;
    }
    return false;
  };

  // UI Flags desde app_metadata (Caché rápida para el renderizado inicial)
  const isMaster = !!(profile?.isMaster ?? user?.app_metadata?.isMaster);
  const isArchiver = !!(profile?.isArchiver ?? user?.app_metadata?.isArchiver);
  const isSeller = !!(profile?.isSeller ?? user?.app_metadata?.isSeller);
  const isSectionLeader = !!(profile?.isSectionLeader ?? user?.app_metadata?.isSectionLeader);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      isLoading, 
      isMaster, 
      isArchiver, 
      isSeller,
      isSectionLeader,
      signOut, 
      hasPermission,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
};
