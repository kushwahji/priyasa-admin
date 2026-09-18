'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {RefreshCw,ShoppingBag,PackageSearch,Activity,AlertTriangle} from 'lucide-react';
import {api} from '@/lib/api';
import {API_ROUTES} from '@/lib/api-contract';
import {Card,PageHeader,Button,Badge,Loading,ErrorState} from '@/components/ui';

type Overview={orders?:number;sales?:number;customers?:number;low_stock?:number;returns?:number;payment_failures?:number};
type Ops={status?:string;checks?:Array<{name:string;status:string;message?:string}>};
type Inventory={low_stock?:unknown[];out_of_stock?:unknown[]};
type Orders={data?:unknown[]};

export default function ControlCenter(){
 const [overview,setOverview]=useState<Overview|null>(null);
 const [orders,setOrders]=useState<Orders|null>(null);
 const [inventory,setInventory]=useState<Inventory|null>(null);
 const [ops,setOps]=useState<Ops|null>(null);
 const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 async function load(){
  setLoading(true);setError('');
  try{
   const [o,ord,inv,op]=await Promise.all([
    api<Overview>(API_ROUTES.controlCenter.overview),
    api<Orders>(API_ROUTES.controlCenter.orders+'?per_page=12'),
    api<Inventory>(API_ROUTES.controlCenter.inventory),
    api<Ops>(API_ROUTES.controlCenter.operations),
   ]);
   setOverview(o.data||null);setOrders(ord.data||null);setInventory(inv.data||null);setOps(op.data||null);
  }catch(e){setError(e instanceof Error?e.message:'Unable to load control center')}
  finally{setLoading(false)}
 }
 useEffect(()=>{load()},[]);
 const attention=(overview?.low_stock||0)+(overview?.returns||0)+(overview?.payment_failures||0);
 return <section className="content">
  <PageHeader title="Commerce Control Center" description="Operational cockpit for catalog, orders, inventory and fulfilment." action={<Button onClick={load} disabled={loading}><RefreshCw size={14}/> {loading?'Refreshing…':'Refresh'}</Button>}/>
  {error&&<ErrorState error={error} onRetry={load}/>}
  {loading&&!overview?<Loading/>:<>
   <div className="grid">
    <Card><div className="metric-label">Orders</div><div className="metric">{overview?.orders??'—'}</div><div className="metric-label">Current operational view</div></Card>
    <Card><div className="metric-label">Sales</div><div className="metric">₹ {Number(overview?.sales||0).toLocaleString('en-IN')}</div><div className="metric-label">Core-reported period</div></Card>
    <Card><div className="metric-label">Customers</div><div className="metric">{overview?.customers??'—'}</div><div className="metric-label">Customer base</div></Card>
    <Card><div className="metric-label">Attention</div><div className="metric">{attention}</div><div className="metric-label">Stock · Returns · Payments</div></Card>
   </div>
   <div className="section-grid">
    <Card><div className="card-title"><ShoppingBag size={16}/> Order operations</div><div className="quick"><Link href="/orders"><b>Order queue</b><span>{Array.isArray(orders?.data)?orders.data.length:0} recent records</span></Link><Link href="/orders"><b>Payment / COD / Refund</b><span>Core-enforced payment and order actions</span></Link><Link href="/shipping"><b>Fulfilment & shipping</b><span>Allocation, AWB and tracking controls</span></Link></div></Card>
    <Card><div className="card-title"><PackageSearch size={16}/> Inventory operations</div><div className="quick"><Link href="/inventory"><b>Low stock</b><span>{Array.isArray(inventory?.low_stock)?inventory.low_stock.length:(overview?.low_stock??0)} alerts</span></Link><Link href="/inventory"><b>Out of stock</b><span>{Array.isArray(inventory?.out_of_stock)?inventory.out_of_stock.length:0} variants</span></Link><Link href="/products"><b>Catalog pricing</b><span>Bulk price and variant controls</span></Link></div></Card>
   </div>
   <Card><div className="card-title"><Activity size={16}/> Platform operations</div>{ops?.status&&<p className="muted">Overall status: <Badge>{ops.status}</Badge></p>}{ops?.checks?.length?<div className="quick">{ops.checks.map((c,i)=><div key={i}><b>{c.name}</b><span><Badge>{c.status}</Badge>{c.message?(' · '+c.message):''}</span></div>)}</div>:<div className="empty">No detailed operation checks were returned.</div>}</Card>
   {attention>0&&<div className="error-state"><AlertTriangle size={17}/><strong>Operational attention required</strong><span>{attention} Core-reported items require review.</span></div>}
  </>}
 </section>
}
