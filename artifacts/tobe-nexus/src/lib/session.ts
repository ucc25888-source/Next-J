import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  clientId?: string;
  displayName?: string;
  isAdmin?: boolean;
}

export const SESSION_OPTIONS: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'fallback-secret-change-me-in-production-32chars',
  cookieName: 'tobe-nexus-session',
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session.clientId) {
    throw new Error('Unauthorized');
  }
  return session;
}
