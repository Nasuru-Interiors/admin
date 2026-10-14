'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  Clock,
  RotateCcw,
  Send,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Settings,
} from 'lucide-react';
import { api } from '@/lib/api';
import type {
  WebhookEndpoint,
  WebhookEndpointListItem,
  WebhookDelivery,
  WebhookDeliveryStats,
  WebhookEvent,
  WebhookTestRequest,
} from '@/lib/types';

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto my-20 max-w-lg w-full px-4">
        <div className="bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={20} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

const EVENT_LABELS: Record<WebhookEvent, string> = {
  'article.created': 'Article Created',
  'article.updated': 'Article Updated',
  'article.published': 'Article Published',
  'article.unpublished': 'Article Unpublished',
  'article.deleted': 'Article Deleted',
  'article.*': 'All Article Events',
  '*': 'All Events',
};

const EVENT_COLORS: Record<string, string> = {
  'article.created': 'bg-blue-100 text-blue-800',
  'article.updated': 'bg-yellow-100 text-yellow-800',
  'article.published': 'bg-green-100 text-green-800',
  'article.unpublished': 'bg-orange-100 text-orange-800',
  'article.deleted': 'bg-red-100 text-red-800',
  'article.*': 'bg-purple-100 text-purple-800',
  '*': 'bg-gray-100 text-gray-800',
};

const STATUS_COLORS = {
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  exhausted: 'bg-gray-100 text-gray-800',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getDeliveryStatus(delivery: WebhookDelivery): 'delivered' | 'failed' | 'pending' | 'exhausted' {
  if (delivery.delivered_at) return 'delivered';
  if (delivery.failed_at) return delivery.attempt >= delivery.max_attempts ? 'exhausted' : 'failed';
  return 'pending';
}

function SecretDisplay({ secret, onCopy }: { secret: string; onCopy: () => void }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secret);
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type={visible ? 'text' : 'password'}
        value={secret}
        readOnly
        className="flex-1 font-mono text-sm bg-white/50 px-3 py-2 rounded border border-gray-200"
      />
      <button
        onClick={handleCopy}
        className="px-3 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary/90 transition text-sm"
        aria-label="Copy secret"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <button
        onClick={() => setVisible(!visible)}
        className="p-2 text-gray-500 hover:text-gray-700"
        aria-label={visible ? 'Hide secret' : 'Show secret'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function EventBadge({ event }: { event: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[event] || 'bg-gray-100 text-gray-800'}`}>
      {EVENT_LABELS[event as WebhookEvent] || event}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800';
  const icons: Record<string, React.ReactNode> = {
    delivered: <Check size={12} className="mr-1" />,
    failed: <X size={12} className="mr-1" />,
    pending: <Clock size={12} className="mr-1" />,
    exhausted: <AlertTriangle size={12} className="mr-1" />,
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {icons[status] || null}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpointListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<WebhookEndpoint | null>(null);
  const [viewingDeliveries, setViewingDeliveries] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [stats, setStats] = useState<WebhookDeliveryStats | null>(null);
  const [testModal, setTestModal] = useState<{ endpoint: WebhookEndpointListItem; event: WebhookEvent } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [showSecret, setShowSecret] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<WebhookEndpoint>>({
    name: '',
    url: '',
    events: ['article.*'] as WebhookEvent[],
    active: true,
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const availableEvents: WebhookEvent[] = [
    'article.created',
    'article.updated',
    'article.published',
    'article.unpublished',
    'article.deleted',
    'article.*',
    '*',
  ];

  async function loadEndpoints() {
    setLoading(true);
    try {
      const data = await api.webhooks.list();
      setEndpoints(data);
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDeliveries(endpointId: string) {
    setDeliveriesLoading(true);
    try {
      const [deliveriesData, statsData] = await Promise.all([
        api.webhooks.deliveries(endpointId),
        api.webhooks.stats(endpointId),
      ]);
      setDeliveries(deliveriesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setDeliveriesLoading(false);
    }
  }

  useEffect(() => {
    loadEndpoints();
  }, []);

  useEffect(() => {
    if (viewingDeliveries) {
      loadDeliveries(viewingDeliveries);
    }
  }, [viewingDeliveries]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});

    if (!formData.name?.trim()) setFormErrors({ name: 'Name is required' });
    if (!formData.url?.trim()) setFormErrors({ url: 'URL is required' });
    else {
      try { new URL(formData.url); } catch { setFormErrors({ url: 'Invalid URL' }); }
    }
    if (!formData.events?.length) setFormErrors({ events: 'Select at least one event' });

    if (Object.keys(formErrors).length) return;

    const submit = editingEndpoint
      ? api.webhooks.update(editingEndpoint.id, formData)
      : api.webhooks.create(formData);

    submit
      .then(() => {
        setShowCreateModal(false);
        setEditingEndpoint(null);
        resetForm();
        loadEndpoints();
      })
      .catch((err) => {
        setFormErrors({ submit: err.message });
      });
  }

  function resetForm() {
    setFormData({ name: '', url: '', events: ['article.*'], active: true, description: '' });
    setFormErrors({});
  }

  function handleEdit(endpoint: WebhookEndpointListItem) {
    api.webhooks.get(endpoint.id).then((full) => {
      setEditingEndpoint(full);
      setFormData({
        name: full.name,
        url: full.url,
        events: full.events,
        active: full.active,
        description: full.description || '',
      });
      setShowCreateModal(true);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this webhook endpoint? This cannot be undone.')) return;
    try {
      await api.webhooks.delete(id);
      loadEndpoints();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function handleRegenerateSecret(id: string) {
    if (!confirm('Regenerate secret? This will invalidate the current secret immediately.')) return;
    try {
      const { secret } = await api.webhooks.regenerateSecret(id);
      setShowSecret(secret);
      loadEndpoints();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to regenerate secret');
    }
  }

  function handleTest(endpoint: WebhookEndpointListItem, event: WebhookEvent) {
    setTestModal({ endpoint, event });
    setTestResult(null);
  }

  async function handleTestSubmit() {
    if (!testModal) return;
    setTesting(true);
    try {
      const result = await api.webhooks.test({
        endpoint_id: testModal.endpoint.id,
        event_type: testModal.event,
      });
      setTestResult({ success: result.success, message: result.success ? 'Test delivered successfully!' : `Failed: ${result.error || result.response}` });
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Test failed' });
    } finally {
      setTesting(false);
    }
  }

  async function handleRetry(deliveryId: string) {
    try {
      await api.webhooks.retryDelivery(deliveryId);
      loadDeliveries(viewingDeliveries!);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to retry');
    }
  }

  function toggleEvent(event: WebhookEvent) {
    const events = formData.events || [];
    setFormData({
      ...formData,
      events: events.includes(event) ? events.filter((e) => e !== event) : [...events, event],
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Webhooks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure webhook endpoints to receive real-time article events
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingEndpoint(null); setShowCreateModal(true); }}
          className="btn btn-primary"
        >
          <Plus size={18} className="mr-2" /> Add Webhook
        </button>
      </div>

      {/* Endpoints List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm font-medium text-gray-500">
                <th className="pb-3 px-4">Name / URL</th>
                <th className="pb-3 px-4">Events</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Deliveries</th>
                <th className="pb-3 px-4">Secret</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {endpoints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No webhook endpoints configured. Click "Add Webhook" to create one.
                  </td>
                </tr>
              ) : (
                endpoints.map((endpoint) => (
                  <tr key={endpoint.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{endpoint.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{endpoint.url}</p>
                        {endpoint.description && (
                          <p className="text-xs text-gray-400 mt-1">{endpoint.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {endpoint.events.map((e) => (
                          <EventBadge key={e} event={e} />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        endpoint.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {endpoint.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setViewingDeliveries(viewingDeliveries === endpoint.id ? null : endpoint.id)}
                        className="text-sm text-brand-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={14} /> View
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <SecretDisplay
                        secret={endpoint.id === showSecret ? '••••••••••••••••' : 'Click to reveal'}
                        onCopy={() => {}}
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTest(endpoint, 'article.created')}
                          className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded transition"
                          title="Test webhook"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={() => handleRegenerateSecret(endpoint.id)}
                          className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-gray-100 rounded transition"
                          title="Regenerate secret"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(endpoint)}
                          className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(endpoint.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Deliveries Drawer */}
        {viewingDeliveries && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delivery History</h3>
              <button
                onClick={() => setViewingDeliveries(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                  <p className="text-xs text-gray-500">Delivered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-500">{stats.exhausted}</p>
                  <p className="text-xs text-gray-500">Exhausted</p>
                </div>
              </div>
            )}

            {/* Deliveries Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-sm font-medium text-gray-500">
                    <th className="pb-3 px-4">Event</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Attempt</th>
                    <th className="pb-3 px-4">Response</th>
                    <th className="pb-3 px-4">Time</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deliveriesLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-primary mx-auto" />
                      </td>
                    </tr>
                  ) : deliveries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">No deliveries yet</td>
                    </tr>
                  ) : (
                    deliveries.map((delivery) => {
                      const status = getDeliveryStatus(delivery);
                      return (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <EventBadge event={delivery.event_type} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={status} />
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {delivery.attempt} / {delivery.max_attempts}
                          </td>
                          <td className="py-3 px-4">
                            {delivery.response_status ? (
                              <span className={`text-sm font-mono ${
                                delivery.response_status >= 200 && delivery.response_status < 300
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                HTTP {delivery.response_status}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatRelativeTime(delivery.created_at)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {status === 'failed' && delivery.attempt < delivery.max_attempts && (
                                <button
                                  onClick={() => handleRetry(delivery.id)}
                                  className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition"
                                  title="Retry"
                                >
                                  <RotateCcw size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const payload = JSON.stringify(delivery.payload, null, 2);
                                  navigator.clipboard.writeText(payload);
                                }}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                                title="Copy payload"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Create/Edit Webhook Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); setEditingEndpoint(null); }}
        title={editingEndpoint ? 'Edit Webhook' : 'Add Webhook'}
      >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder="e.g. My CMS"
            required
          />
          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
        </div>
        <div>
          <label className="label">URL</label>
          <input
            type="url"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="input"
            placeholder="https://example.com/webhook"
            required
          />
          {formErrors.url && <p className="mt-1 text-sm text-red-600">{formErrors.url}</p>}
        </div>
        <div>
          <label className="label">Events</label>
          <div className="flex flex-wrap gap-2">
            {availableEvents.map((event) => (
              <label
                key={event}
                className={`inline-flex items-center px-3 py-1.5 rounded border text-sm cursor-pointer transition ${
                  formData.events?.includes(event)
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.events?.includes(event) || false}
                  onChange={() => toggleEvent(event)}
                  className="mr-2 h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                />
                {EVENT_LABELS[event]}
              </label>
            ))}
          </div>
          {formErrors.events && <p className="mt-1 text-sm text-red-600">{formErrors.events}</p>}
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active ?? true}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
        <div>
          <label className="label">Description (optional)</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows={3}
            placeholder="Optional description for this webhook"
          />
        </div>
        {formErrors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {formErrors.submit}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => { setShowCreateModal(false); resetForm(); setEditingEndpoint(null); }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={Object.keys(formErrors).length > 0}>
            {editingEndpoint ? 'Save Changes' : 'Create Webhook'}
          </button>
        </div>
      </form>
    </Modal>

    {/* Test Webhook Modal */}
    <Modal isOpen={!!testModal} onClose={() => setTestModal(null)} title="Test Webhook">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Send a test payload to <strong>{testModal?.endpoint.url}</strong> for event <strong>{EVENT_LABELS[testModal?.event || 'article.created']}</strong>
        </p>
        {testResult && (
          <div className={`p-3 rounded text-sm ${testResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {testResult.message}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={() => setTestModal(null)} className="btn btn-secondary">Close</button>
          <button
            onClick={handleTestSubmit}
            disabled={testing}
            className="btn btn-primary"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Test'}
          </button>
        </div>
      </div>
    </Modal>

    {/* Secret Copied Toast */}
    {showSecret && (
      <div className="fixed bottom-4 right-4 z-50 animate-slide-in p-3 bg-green-600 text-white rounded-lg shadow-lg">
        Secret copied to clipboard!
      </div>
    )}
  </div>
  );
}