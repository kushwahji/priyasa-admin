'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Mail,
  MessageCircle,
  RefreshCw,
  Save,
  Smartphone,
} from 'lucide-react';
import { api } from '@/lib/api';
import { apiMessage, dateTime } from '@/lib/format';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Loading,
  PageHeader,
} from '@/components/ui';

type Rule = {
  id: number | string;
  name: string;
  event_key: string;
  enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  fcm_enabled: boolean;
  email_template?: string | null;
  whatsapp_template?: string | null;
  fcm_template?: string | null;
  delay_seconds?: number;
  conditions?: Record<string, unknown> | null;
  updated_at?: string;
};

const EVENTS = [
  'order.created',
  'order.pending',
  'order.failed',
  'payment.success',
  'order.confirmed',
  'order.processing',
  'order.packed',
  'order.shipped',
  'order.in_transit',
  'order.out_for_delivery',
  'order.delivered',
  'order.cancelled',
  'order.refunded',
];

const LABELS: Record<string, string> = {
  'order.created': 'Order created',
  'order.pending': 'Payment pending',
  'order.failed': 'Payment failed',
  'payment.success': 'Payment successful',
  'order.confirmed': 'Order confirmed',
  'order.processing': 'Processing',
  'order.packed': 'Packed',
  'order.shipped': 'Shipped',
  'order.in_transit': 'In transit',
  'order.out_for_delivery': 'Out for delivery',
  'order.delivered': 'Delivered',
  'order.cancelled': 'Cancelled',
  'order.refunded': 'Refunded',
};

export default function OrderStatusNotifications() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api<any>('/admin/automations?per_page=200');
      const raw = response.data;
      const rows = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : [];
      setRules(
        rows.filter((item: any) => EVENTS.includes(String(item.event_key))),
      );
    } catch (e) {
      setError(apiMessage(e, 'Unable to load order notification rules.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const enabled = useMemo(
    () => rules.filter((rule) => rule.enabled).length,
    [rules],
  );

  async function save(rule: Rule) {
    setBusy(String(rule.id));
    setError('');
    setMessage('');

    try {
      await api(`/admin/automations/${encodeURIComponent(String(rule.id))}`, {
        method: 'PUT',
        body: JSON.stringify({
          enabled: rule.enabled,
          email_enabled: rule.email_enabled,
          whatsapp_enabled: rule.whatsapp_enabled,
          fcm_enabled: rule.fcm_enabled,
          email_template: rule.email_template || null,
          whatsapp_template: rule.whatsapp_template || null,
          fcm_template: rule.fcm_template || null,
          delay_seconds: Math.max(0, Number(rule.delay_seconds || 0)),
          conditions: rule.conditions || null,
        }),
      });
      setMessage(
        `${LABELS[rule.event_key] || rule.event_key} notification rule saved.`,
      );
      await load();
    } catch (e) {
      setError(apiMessage(e, 'Unable to save notification rule.'));
    } finally {
      setBusy(null);
    }
  }

  function patch(id: Rule['id'], patchValue: Partial<Rule>) {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id ? { ...rule, ...patchValue } : rule,
      ),
    );
  }

  return (
    <section className="content">
      <PageHeader
        title="Order Status Notifications"
        description="Priyasa Store customer notification control. Every order lifecycle transition can fan out to WhatsApp, email and push without provider credentials in the Admin."
        action={
          <div className="form-actions">
            <Link href="/whatsapp/automation" className="btn">
              WhatsApp templates
            </Link>
            <Button onClick={load} disabled={loading || !!busy}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        }
      />

      {error && <ErrorState error={error} onRetry={load} />}
      {message && (
        <div className="form-success" role="status">
          {message}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid">
            <Card>
              <div className="metric-label">Lifecycle rules</div>
              <div className="metric">{EVENTS.length}</div>
              <div className="metric-label">Canonical Priyasa order events</div>
            </Card>
            <Card>
              <div className="metric-label">Enabled rules</div>
              <div className="metric">{enabled}</div>
              <div className="metric-label">
                Events currently allowed to notify
              </div>
            </Card>
            <Card>
              <div className="metric-label">Delivery model</div>
              <div className="metric">Queued</div>
              <div className="metric-label">
                Retries + provider reconciliation in Core
              </div>
            </Card>
          </div>

          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order event</th>
                    <th>Status</th>
                    <th>Channels</th>
                    <th>Templates</th>
                    <th>Delay</th>
                    <th>Last update</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {EVENTS.map((event) => {
                    const rule = rules.find((item) => item.event_key === event);

                    if (!rule) {
                      return (
                        <tr key={event}>
                          <td>
                            <b>{LABELS[event]}</b>
                            <div className="muted">
                              <code>{event}</code>
                            </div>
                          </td>
                          <td>
                            <Badge>Not configured</Badge>
                          </td>
                          <td colSpan={4}>
                            Create this lifecycle automation in PriyasaCore.
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={event}>
                        <td>
                          <b>{LABELS[event]}</b>
                          <div className="muted">
                            <code>{event}</code>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`status ${rule.enabled ? 'connected' : 'disconnected'}`}
                            onClick={() =>
                              patch(rule.id, { enabled: !rule.enabled })
                            }
                          >
                            {rule.enabled ? <CheckCircle2 size={13} /> : null}
                            {rule.enabled ? 'Enabled' : 'Paused'}
                          </button>
                        </td>
                        <td>
                          <div className="chips">
                            <label className="check">
                              <input
                                type="checkbox"
                                checked={rule.whatsapp_enabled}
                                onChange={(event) =>
                                  patch(rule.id, {
                                    whatsapp_enabled: event.target.checked,
                                  })
                                }
                              />
                              <MessageCircle size={13} /> WhatsApp
                            </label>
                            <label className="check">
                              <input
                                type="checkbox"
                                checked={rule.email_enabled}
                                onChange={(event) =>
                                  patch(rule.id, {
                                    email_enabled: event.target.checked,
                                  })
                                }
                              />
                              <Mail size={13} /> Email
                            </label>
                            <label className="check">
                              <input
                                type="checkbox"
                                checked={rule.fcm_enabled}
                                onChange={(event) =>
                                  patch(rule.id, {
                                    fcm_enabled: event.target.checked,
                                  })
                                }
                              />
                              <Smartphone size={13} /> Push
                            </label>
                          </div>
                        </td>
                        <td>
                          <div className="quick">
                            <span>{rule.whatsapp_template || 'WhatsApp —'}</span>
                            <span>{rule.email_template || 'Email —'}</span>
                            <span>{rule.fcm_template || 'Push —'}</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="43200"
                            value={Math.round((rule.delay_seconds || 0) / 60)}
                            onChange={(event) =>
                              patch(rule.id, {
                                delay_seconds:
                                  Math.max(0, Number(event.target.value) || 0) *
                                  60,
                              })
                            }
                            style={{ width: 80 }}
                          />{' '}
                          min
                        </td>
                        <td>{dateTime(rule.updated_at)}</td>
                        <td>
                          <Button
                            className="primary"
                            disabled={busy === String(rule.id)}
                            onClick={() => void save(rule)}
                          >
                            <Save size={13} />
                            {busy === String(rule.id) ? 'Saving…' : 'Save'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="muted" style={{ marginTop: 14 }}>
              <Bell size={13} /> Status changes are generated from the PriyasaCore
              order lifecycle. This screen controls notification policy; it does
              not bypass the backend event/queue/idempotency layer.
            </div>
          </Card>
        </>
      )}
    </section>
  );
}
