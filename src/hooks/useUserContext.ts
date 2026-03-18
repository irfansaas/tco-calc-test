'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

export type UserRole = 'SDR' | 'AE' | 'SE' | 'VE';

export interface UserContext {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId?: string;
}

const VALID_ROLES: UserRole[] = ['SDR', 'AE', 'SE', 'VE'];

function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

function parseUrlContext(): UserContext | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const role = params.get('role');

  if (userId && role && isValidRole(role)) {
    return {
      userId,
      email: params.get('email') || '',
      displayName: params.get('displayName') || '',
      role,
      organizationId: params.get('organizationId') || undefined,
    };
  }
  return null;
}

// URL params don't change — static snapshot
function getUrlContextSnapshot(): UserContext | null {
  return parseUrlContext();
}

function getUrlContextServerSnapshot(): UserContext | null {
  return null;
}

// No-op subscribe — URL params are read once and don't change
function subscribeToUrlContext(): () => void {
  return () => {};
}

/**
 * Reads user context provided by the ve-tools portal.
 *
 * Supports two mechanisms (checked in order):
 * 1. URL search params (for direct linking / iframe src)
 * 2. window.postMessage (for iframe communication)
 * Falls back to null (app works without auth — ve-tools handles gating)
 */
export function useUserContext(): UserContext | null {
  // Option 1: Read from URL search params (static, read once)
  const urlContext = useSyncExternalStore(
    subscribeToUrlContext,
    getUrlContextSnapshot,
    getUrlContextServerSnapshot
  );

  // Option 2: Listen for postMessage from ve-tools portal
  const [messageContext, setMessageContext] = useState<UserContext | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // If URL params already provided context, skip postMessage listener
    if (urlContext) return;

    const veToolsOrigin = process.env.NEXT_PUBLIC_VE_TOOLS_ORIGIN;

    function handleMessage(event: MessageEvent) {
      if (veToolsOrigin && event.origin !== veToolsOrigin) return;

      const data = event.data;
      if (
        data &&
        typeof data === 'object' &&
        data.type === 'USER_CONTEXT' &&
        data.userId &&
        data.role &&
        isValidRole(data.role)
      ) {
        setMessageContext({
          userId: data.userId,
          email: data.email || '',
          displayName: data.displayName || '',
          role: data.role,
          organizationId: data.organizationId || undefined,
        });
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [urlContext]);

  return urlContext || messageContext;
}
