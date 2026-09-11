'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Boxes, Megaphone, MessageCircle, Package, RefreshCw, Settings2, ShoppingBag, Sparkles, Users, Workflow } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, Button, Card, ErrorState, Loading, PageHeader } from '@/components/ui';

type Analytics = { orders: number; sales: number; aov: number; customers: number; returns: number; payment_failures: number; low_stock: number };
type PageData = { analytics: Analytics | null; products: number; categories: number; cms: number; integrations: number };
const money = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const actions = [
  { title: 'Build storefront', text: 'Compose home-page banners, carousels, collections and merchandising blocks.', href: '/cms', icon: Sparkles },
  { title: 'Manage catalog', text: 'Products, variants, media, pricing, publishing and collections.', href: '/products', icon: Package },
  { title: 'Inventory control', text: 'Stock, reservations, adjustments, low-stock thresholds and movement ledger.', href: '/inventory', icon: Boxes },
  { title: 'Order operations', text: 'Review orders, payment state, fulfillment and lifecycle status.', href: '/orders', icon: ShoppingBag },
  { title: 'Growth automation', text: 'Connect WhatsApp, FCM, AI journeys and existing automation mappings.', href: '/automation', icon: Workflow },
  { title: 'Ads & acquisition', text: 'Open the existing CommerceAutomation ads workspace and catalog sync.', href: '/ads', icon: Megaphone },
];

export default function CommerceCommandCenter() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const [a, p, c, cms, i] = await Promise.all([
        api<Analytics>('/admin/analytics?range=30d').catch(() => ({ data: null })),
        api<any>('/admin/catalog/products?per_page=1'),
        api<any>('/admin/catalog/categories?per_page=1'),
        api<any>('/admin/cms?per_page=1'),
        api<any>('/admin/integrations'),
      ]);
      setData({ analytics: (a as any)?.data ?? null, products: p.data?.total ?? 0, categories: c.data?.total ?? 0, cms: cms.data?.total ?? cms.data?.data?.length ?? 0, integrations: Array.isArray(i.data) ? i.data.length : (i.data?.integrations?.length ?? 0) });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load commerce control center'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  const attention = useMemo(() => data?.analytics ? data.analytics.low_stock + data.analytics.returns + data.analytics.payment_failures : 0, [data]);
  const automationUrl = process.env.NEXT_PUBLIC_COMMERCE_AUTOMATION_URL || '/admin/commerce';

  return <section className="content">
    <PageHeader title="Commerce Command Center" description="One control plane for the PriyasaCore commerce API, storefront CMS and CommerceAutomation growth stack." action={<Button onClick={load} disabled={loading}><RefreshCw size={14}/> {loading ? 'Refreshing…' : 'Refresh'}</Button>} />
    {error && <ErrorState error={error} onRetry={load} />}
    {loading && !data ? <Loading /> : <>
      <div className="grid">
        <Card><div className="metric-label">Sales · 30 days</div><div className="metric">{data?.analytics ? money(data.analytics.sales) : '—'}</div><div className="metric-label">Order value</div></Card>
        <Card><div className="metric-label">Orders · 30 days</div><div className="metric">{data?.analytics?.orders ?? '—'}</div><div className="metric-label">AOV {data?.analytics ? money(data.analytics.aov) : '—'}</div></Card>
        <Card><div className="metric-label">Catalog</div><div className="metric">{data?.products ?? '—'}</div><div className="metric-label">Products · {data?.categories ?? 0} categories</div></Card>
        <Card><div className="metric-label">Attention queue</div><div className="metric">{attention}</div><div className="metric-label">Low stock · returns · payment failures</div></Card>
      </div>

      <div className="section-grid">
        <Card>
          <div className="card-title">Store management</div>
          <p className="muted" style={{ marginTop: 6 }}>Every operational surface is backed by PriyasaCore. No fake local state or duplicate commerce rules.</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            {actions.slice(0, 4).map(({ title, text, href, icon: Icon }) => <Link key={href} href={href} className="quick" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}><span className="avatar"><Icon size={17}/></span><span style={{ flex: 1 }}><b>{title}</b><small style={{ display: 'block', opacity: .65, marginTop: 3 }}>{text}</small></span><ArrowRight size={15}/></Link>)}
          </div>
        </Card>
        <Card>
          <div className="card-title">Growth & automation</div>
          <p className="muted" style={{ marginTop: 6 }}>Reuse the existing WhatsApp, FCM, AI, Meta Ads and commerce automation mappings instead of rebuilding integrations in the core admin.</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            <Link href="/automation" className="quick" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}><MessageCircle size={17}/><span style={{ flex: 1 }}><b>Automation mappings</b><small style={{ display: 'block', opacity: .65 }}>Events → templates → channels → delivery</small></span><ArrowRight size={15}/></Link>
            <a href={automationUrl + '/ads'} className="quick" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}><Megaphone size={17}/><span style={{ flex: 1 }}><b>Ads command center</b><small style={{ display: 'block', opacity: .65 }}>Meta campaigns, audiences, catalogs and insights</small></span><ArrowRight size={15}/></a>
            <Link href="/integrations" className="quick" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}><Settings2 size={17}/><span style={{ flex: 1 }}><b>Integration health</b><small style={{ display: 'block', opacity: .65 }}>{data?.integrations ?? 0} configured connections</small></span><ArrowRight size={15}/></Link>
            <Link href="/analytics" className="quick" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}><BarChart3 size={17}/><span style={{ flex: 1 }}><b>Commerce analytics</b><small style={{ display: 'block', opacity: .65 }}>{data?.analytics?.customers ?? 0} active customers in the selected period</small></span><ArrowRight size={15}/></Link>
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-title">Control map</div>
        <div className="grid" style={{ marginTop: 16 }}>
          {[['Catalog','Products, variants, media, categories, collections'],['Merchandising','Dynamic home page, banners, carousels, sections'],['Inventory','Available stock, reservations, adjustments, ledger'],['Orders','Checkout, payment, shipment, returns and refunds'],['Customers','Customer 360, addresses, reviews and lifecycle'],['Growth','WhatsApp, FCM, AI, automations, Meta Ads'],['Analytics','Sales, AOV, customer and operational KPIs'],['Governance','Admins, roles, settings and audit logs']].map(([title,text]) => <div key={title} className="card" style={{ padding: 16 }}><b>{title}</b><p className="muted" style={{ margin: '7px 0 0', fontSize: 13 }}>{text}</p></div>)}
        </div>
        <div style={{ marginTop: 18 }}><Badge>PriyasaCore API · /api/v1</Badge> <Badge>CommerceAutomation bridge</Badge> <Badge>{data?.cms ?? 0} CMS sections</Badge></div>
      </Card>
    </>}
  </section>;
}
