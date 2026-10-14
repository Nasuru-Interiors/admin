'use client';

import { getToken, clearToken } from './auth';
import type {
  WebhookEndpoint,
  WebhookEndpointListItem,
  WebhookDelivery,
  WebhookDeliveryStats,
  WebhookTestRequest,
  WebhookTestResponse,
} from './types';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE}/api/admin${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Session expired / invalid — drop the token and bounce to login.
  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),

  // Webhooks
  webhooks: {
    list: () => request<WebhookEndpointListItem[]>('GET', '/webhooks'),
    get: (id: string) => request<WebhookEndpoint>('GET', `/webhooks/${id}`),
    create: (data: Partial<WebhookEndpoint>) => request<WebhookEndpoint>('POST', '/webhooks', data),
    update: (id: string, data: Partial<WebhookEndpoint>) => request<WebhookEndpoint>('PUT', `/webhooks/${id}`, data),
    regenerateSecret: (id: string) => request<{ secret: string }>('POST', `/webhooks/${id}/regenerate-secret`),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/webhooks/${id}`),
    deliveries: (id: string, params?: { event_type?: string; status?: string; limit?: number; offset?: number }) => {
      const search = new URLSearchParams();
      if (params?.event_type) search.set('event_type', params.event_type);
      if (params?.status) search.set('status', params.status);
      if (params?.limit) search.set('limit', String(params.limit));
      if (params?.offset) search.set('offset', String(params.offset));
      const query = search.toString() ? `?${search.toString()}` : '';
      return request<WebhookDelivery[]>('GET', `/webhooks/${id}/deliveries${query}`);
    },
    stats: (id: string) => request<WebhookDeliveryStats>('GET', `/webhooks/${id}/stats`),
    test: (data: WebhookTestRequest) => request<WebhookTestResponse>('POST', '/webhooks/test', data),
    retryDelivery: (deliveryId: string) => request<{ ok: boolean; message: string }>('POST', `/webhooks/deliveries/${deliveryId}/retry`),
  },
};
