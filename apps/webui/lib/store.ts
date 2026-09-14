"use client";

const PROFILE_KEY = "fc.profile";
const CONN_KEY = "fc.connections";

export interface LocalProfile {
  name: string;
  context: string;
}

export function getProfile(): LocalProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as LocalProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: LocalProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function getConnections(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CONN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function saveConnections(c: Record<string, boolean>): void {
  localStorage.setItem(CONN_KEY, JSON.stringify(c));
}
