'use client';

import { useEffect, useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  PlugZap,
  Unplug,
  ShoppingBag,
  MessageCircle,
  Flame,
  Megaphone,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, Card, Button, Loading, ErrorState, Modal } from '@/components/ui';

type Integration = {
  key: string;
  name: string;
  description: string;
  enabled?: boolean;
  status?: string;
  last_error?: string | null;
};

const definitions = [
  { key: 'woocommerce', name: 'WooCommerce', icon: ShoppingBag, description: 'Synchronize products and orders from an existing WooCommerce store.' },
  { key: 'whatsapp', name: 'WhatsApp Business', icon: MessageCircle, description: 'Customer messaging, templates and order notifications.' },
  { key: 'fcm', name: 'Firebase Cloud Messaging', icon: Flame, description: 'Push notifications for web and native Android devices.' },
  { key: 'meta', name: 'Meta', icon: Megaphone, description: 'Connect Meta through OAuth; provider access tokens stay server-side.' },
];

const idempotency = () => crypto.randomUUID();

export default function Integrations() {
  const [rows, setRows] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [integrationResult, metaResult] = await Promise.all([
        api<any>('/admin/integrations'),
        api<any>('/admin/integrations/meta/status'),
      ]);
      const value = integrationResult.data;
      const baseRows: Integration[] = Array.isArray(value)
        ? value
        : Array.isArray(value?.data)
          ? value.data
          : [];
      const meta = metaResult.data;
      setRows([
        ...baseRows.filter((row) => row.key !== 'meta' && row.key !== 'meta_ads'),
        {
          key: 'meta',
          name: 'Meta',
          description: 'Connect Meta through OAuth; provider access tokens stay server-side.',
          enabled: Boolean(meta?.connected),
          status: meta?.connected ? 'connected' : 'disconnected',
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load integrations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const items = definitions.map((definition) => ({
    ...definition,
    ...(rows.find((row) => row.key === definition.key) || {}),
  }));

  async function connect() {
    if (!selected) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (selected === 'meta') {
        const result = await api<any>('/admin/integrations/meta/connect');
        const authorizationUrl = result.data?.authorization_url;
        if (!authorizationUrl) throw new Error('Meta authorization URL was not returned by PriyasaCore.');
        window.location.assign(authorizationUrl);
        return;
      }

      let path = '';
      let body: Record<string, unknown> = {};
      if (selected === 'woocommerce') {
        path = '/admin/integrations/woocommerce/connect';
        body = {
          store_url: form.store_url,
          consumer_key: form.consumer_key,
          consumer_secret: form.consumer_secret,
          webhook_secret: form.webhook_secret || undefined,
        };
      } else if (selected === 'whatsapp') {
        path = '/admin/integrations/whatsapp/connect';
        body = {
          phone_number_id: form.phone_number_id,
          waba_id: form.waba_id,
          access_token: form.access_token,
          catalog_id: form.catalog_id || undefined,
          webhook_verify_token: form.webhook_verify_token || undefined,
        };
      } else if (selected === 'fcm') {
        path = '/admin/integrations/fcm/connect';
        body = { service_account_json: form.service_account_json };
      }

      if (!path) throw new Error('Unsupported integration.');

      const result = await api(path, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotency() },
        body: JSON.stringify(body),
      });
      setMessage(result.message || 'Integration connected successfully.');
      await load();
      setSelected(null);
      setForm({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed.');
    } finally {
      setBusy(false);
    }
  }

  async function disconnect(key: string) {
    if (!confirm(`Disconnect ${key}?`)) return;
    setBusy(true);
    setError('');
    try {
      await api(`/admin/integrations/${encodeURIComponent(key)}/disconnect`, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotency() },
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to disconnect integration.');
    } finally {
      setBusy(false);
    }
  }

  async function sync(kind: 'products' | 'orders') {
    setBusy(true);
    setError('');
    try {
      await api(`/admin/integrations/woocommerce/sync/${kind}`, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotency() },
        body: JSON.stringify({}),
      });
      setMessage(`WooCommerce ${kind} sync completed/started.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : `WooCommerce ${kind} sync failed.`);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Integrations" description="Production connections used by PRIYASA commerce and automation." />
        <Loading />
      </>
    );
  }

  return (
    <section className="content">
      <PageHeader
        title="Integrations"
        description="Provider calls are made by PriyasaCore. Secrets are never returned by the integration status API."
        action={<Button onClick={load} disabled={busy}><RefreshCw size={15} /> Refresh</Button>}
      />
      {error && <ErrorState error={error} onRetry={load} />}
      {message && <div className="form-success" role="status">{message}</div>}

      <div className="grid-cards">
        {items.map((item) => {
          const Icon = item.icon;
          const connected = Boolean(item.enabled) || item.status === 'connected' || item.status === 'healthy';
          return (
            <Card key={item.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div className="module-icon"><Icon size={22} /></div>
                <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
                  {connected ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  {connected ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              {item.last_error && <small className="form-error">{item.last_error}</small>}
              <div className="form-actions" style={{ marginTop: 16 }}>
                {connected && item.key !== 'meta' && (
                  <Button onClick={() => disconnect(item.key)} disabled={busy}><Unplug size={14} /> Disconnect</Button>
                )}
                {!connected && (
                  <Button className="primary" onClick={() => setSelected(item.key)} disabled={busy}>
                    <PlugZap size={14} /> Connect
                  </Button>
                )}
                {item.key === 'meta' && connected && (
                  <span className="status connected">OAuth connection active</span>
                )}
                {item.key === 'woocommerce' && connected && (
                  <>
                    <Button onClick={() => sync('products')} disabled={busy}>Sync products</Button>
                    <Button onClick={() => sync('orders')} disabled={busy}>Sync orders</Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {selected && (
        <Modal title={`Connect ${definitions.find((item) => item.key === selected)?.name || selected}`} onClose={() => !busy && setSelected(null)}>
          <div className="form-grid">
            {selected === 'woocommerce' && (
              <>
                <label>Store URL<input value={form.store_url || ''} onChange={(e) => setForm({ ...form, store_url: e.target.value })} placeholder="https://store.example.com" required /></label>
                <label>Consumer key<input value={form.consumer_key || ''} onChange={(e) => setForm({ ...form, consumer_key: e.target.value })} required /></label>
                <label>Consumer secret<input type="password" value={form.consumer_secret || ''} onChange={(e) => setForm({ ...form, consumer_secret: e.target.value })} required /></label>
                <label>Webhook secret<input type="password" value={form.webhook_secret || ''} onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })} /></label>
                <p className="helper">WooCommerce REST credentials are submitted directly to PriyasaCore over HTTPS and are encrypted server-side. They are never sent to WooCommerce by browser JavaScript and are never returned by the status API.</p>
              </>
            )}
            {selected === 'whatsapp' && (
              <>
                <label>Phone number ID<input value={form.phone_number_id || ''} onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} required /></label>
                <label>WABA ID<input value={form.waba_id || ''} onChange={(e) => setForm({ ...form, waba_id: e.target.value })} required /></label>
                <label>Access token<input type="password" autoComplete="off" value={form.access_token || ''} onChange={(e) => setForm({ ...form, access_token: e.target.value })} required /></label>
                <label>Catalog ID<input value={form.catalog_id || ''} onChange={(e) => setForm({ ...form, catalog_id: e.target.value })} /></label>
                <label>Webhook verify token<input type="password" autoComplete="off" value={form.webhook_verify_token || ''} onChange={(e) => setForm({ ...form, webhook_verify_token: e.target.value })} /></label>
                <p className="helper">WhatsApp credentials are submitted only to PriyasaCore over HTTPS. Provider API calls happen server-side; the access token is never returned to the browser after connection.</p>
              </>
            )}
            {selected === 'fcm' && (
              <>
                <label>Firebase service account JSON<textarea rows={10} autoComplete="off" value={form.service_account_json || ''} onChange={(e) => setForm({ ...form, service_account_json: e.target.value })} required /></label>
                <p className="helper">The service-account private key is sent only to PriyasaCore over HTTPS and stored using encrypted credentials. It is never returned to the browser.</p>
              </>
            )}
            {selected === 'meta' && (
              <p className="helper">You will be redirected to Meta to authorize PRIYASA. No Meta access token is entered or transmitted through this form.</p>
            )}
            <div className="form-actions">
              <Button onClick={connect} disabled={busy}>{busy ? 'Connecting…' : selected === 'meta' ? 'Continue to Meta' : 'Save & test connection'}</Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
