// ── Shared types for Únete page components ──
import React from 'react';

export type GroupId = 'orquesta' | 'coro' | 'flautas' | 'metales' | 'chelos' | 'bigband';

export interface Group {
  id: GroupId;
  name: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  formExtra?: React.ReactNode;
}
