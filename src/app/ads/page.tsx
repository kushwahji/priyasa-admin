'use client';

import { useMemo } from 'react';
import { ArrowUpRight, BarChart3, Megaphone, RefreshCw, Target } from 'lucide-react';
import { Card, PageHeader, Button, Badge } from '@/components/ui';

export default function AdsBridge() {
  const base = process.env.NEXT_PUBLIC_COMMERCE_AUTOMATION_URL || '/admin/commerce';
  const links = useMemo(() => [
    ['Ads Command Center', base + '/ads', 'Create, draft, publish and pause campaigns.'],
    ['Audiences', base + '/ads/audiences', 'Sync and manage reusable acquisition audiences.'],
    ['Product Catalogs', base + '/ads/catalogs', 'Build and sync product catalogs for Meta commerce.'],
  ], [base]);
  return <section className="content">
    <PageHeader title="Ads & Acquisition" description="PriyasaCore supplies the canonical product/order data; CommerceAutomation owns Meta Ads execution and attribution." action={<Button className="primary" onClick={() => window.location.assign(base + '/ads')}><Megaphone size={14}/> Open Ads Center</Button>} />
    <div className="grid">
      <Card><div className="metric-label">Source of truth</div><div className="metric" style={{ fontSize: 28 }}>PriyasaCore</div><div className="metric-label">Catalog, price, inventory and order events</div></Card>
      <Card><div className="metric-label">Execution</div><div className="metric" style={{ fontSize: 28 }}>CommerceAutomation</div><div className="metric-label">Meta Ads, audiences, catalogs and insights</div></Card>
      <Card><div className="metric-label">Tracking</div><div className="metric" style={{ fontSize: 28 }}>E2E</div><div className="metric-label">Store events → attribution → growth workflows</div></Card>
    </div>
    <div className="section-grid" style={{ marginTop: 18 }}>
      {links.map(([title, href, text], i) => <Card key={href}><div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}><span className="avatar">{i === 0 ? <Megaphone size={17}/> : i === 1 ? <Target size={17}/> : <BarChart3 size={17}/>}</span><div style={{ flex: 1 }}><h3 style={{ margin: 0 }}>{title}</h3><p className="muted" style={{ marginTop: 7 }}>{text}</p><a className="btn" href={href} style={{ display: 'inline-flex', marginTop: 12 }}>Open <ArrowUpRight size={14}/></a></div></div></Card>)}
    </div>
    <Card style={{ marginTop: 18 } as any}><Badge>Shared mapping</Badge> <span className="muted" style={{ marginLeft: 8 }}>Do not duplicate product or order business logic in the ads UI. Keep CommerceAutomation as the growth/integration layer.</span><div style={{ marginTop: 14 }}><Button onClick={() => window.location.assign(base + '/integrations')}><RefreshCw size={14}/> Open integrations</Button></div></Card>
  </section>;
}
