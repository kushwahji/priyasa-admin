'use client';

import {Headphones, MessageSquare, PackageSearch, RotateCcw, Users, Workflow} from 'lucide-react';
import Link from 'next/link';
import AdminWorkspace from '@/components/admin-workspace';
import {Card} from '@/components/ui';

const playbooks = [
  {title:'Customer 360',text:'Review profile, addresses, lifetime value and order history before responding.',href:'/customers',icon:Users},
  {title:'Order resolution',text:'Inspect order status, payment, shipment, items and the status timeline.',href:'/orders',icon:PackageSearch},
  {title:'Returns & refunds',text:'Review return requests and move eligible cases through the controlled workflow.',href:'/returns',icon:RotateCcw},
];

export default function Support(){
  return <section className="content">
    <div className="section-head" style={{alignItems:'flex-start',marginBottom:16}}>
      <div><h1 style={{marginBottom:6}}>Support Command Center</h1><p className="muted">Production support workspace for customer, order, return and backend-operation resolution.</p></div>
      <div className="toolbar"><span className="button primary"><Headphones size={14}/> Resolution desk</span><span className="button"><Workflow size={14}/> Core operations</span></div>
    </div>
    <div className="grid" style={{marginBottom:16}}>
      <Card><div className="metric-label">Resolution workflow</div><div className="metric">360°</div><div className="metric-label">Customer → order → return context</div></Card>
      <Card><div className="metric-label">Customer context</div><div className="metric"><Users size={24}/></div><div className="metric-label">Profile, addresses and lifetime value</div></Card>
      <Card><div className="metric-label">Conversation handoff</div><div className="metric"><MessageSquare size={24}/></div><div className="metric-label">Operational actions stay in PriyasaCore</div></Card>
    </div>
    <div className="grid">
      {playbooks.map(({title,text,href,icon:Icon})=><Card key={href}><div className="section-head"><div><h2>{title}</h2><p className="muted">{text}</p></div><Icon size={22}/></div><Link className="button primary" href={href}>Open workspace</Link></Card>)}
    </div>
    <Card>
      <div className="section-head"><div><h2>Agent workflow</h2><p className="muted">Evidence-first sequence for every support case.</p></div></div>
      <ol className="muted" style={{lineHeight:1.9,paddingLeft:22,marginBottom:0}}><li>Find the customer and confirm account context.</li><li>Open the related order and verify payment, fulfillment and delivery state.</li><li>Check return/refund state before promising an outcome.</li><li>Execute only supported PriyasaCore operations and preserve the audit trail.</li></ol>
    </Card>
    <div style={{marginTop:16}}><AdminWorkspace capabilityKey="support"/></div>
  </section>
}
