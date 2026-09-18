'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {RefreshCw,PackageSearch,RotateCcw,CreditCard,Users,ShoppingBag,Boxes,MonitorCog,ArrowRight,Layers,Tag,Truck,MessageSquare,ShieldCheck} from 'lucide-react';
import {api} from '@/lib/api';
import {Order,Paginated,Product} from '@/lib/types';
import {PageHeader,Card,Loading,ErrorState,Badge,Button} from '@/components/ui';

type Analytics={orders:number;sales:number;aov:number;customers:number;returns:number;payment_failures:number;low_stock:number;series?:Array<{date:string;orders:number;sales:number}>};
const money=(n:number)=>`₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2})`;
const workspaces=[
 ['Catalog','Products, variants, media, categories and collections','/products',PackageSearch],
 ['Orders & Fulfilment','Orders, payments, refunds, shipping and returns','/orders',ShoppingBag],
 ['Inventory','Stock, warehouses, adjustments and movements','/inventory',Boxes],
 ['Customers','Customer records and Customer 360','/customers',Users],
 ['Growth','Promotions, marketing, ads and merchandising','/marketing',Tag],
 ['Storefront','CMS, themes and storefront configuration','/cms',MonitorCog],
 ['Operations','Shipping, WhatsApp, automation and support','/shipping',Truck],
 ['System','Settings, RBAC, integrations and audit','/settings',ShieldCheck],
] as const;

export default function Dashboard(){
 const [orders,setOrders]=useState<Paginated<Order>|null>(null),[products,setProducts]=useState<Paginated<Product>|null>(null),[health,setHealth]=useState<any>(null),[analytics,setAnalytics]=useState<Analytics|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const [o,p,h,a]=await Promise.all([api<Paginated<Order>>('/admin/orders?per_page=8'),api<Paginated<Product>>('/admin/catalog/products?per_page=5'),api<any>('/health'),api<Analytics>('/admin/analytics?range=30d').catch(()=>null)]);setOrders(o.data||null);setProducts(p.data||null);setHealth(h.data);setAnalytics((a as any)?.data??null)}catch(e){setError(e instanceof Error?e.message:'Request failed')}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const maxSales=useMemo(()=>Math.max(1,...(analytics?.series||[]).map(x=>Number(x.sales||0))),[analytics]);
 const attention=analytics?(analytics.low_stock+analytics.returns+analytics.payment_failures):0;
 return <section className="content">
  <PageHeader title="Commerce Dashboard" description="Live operating view of the PRIYASA commerce platform." action={<Button onClick={load} disabled={loading}><RefreshCw size={14}/> {loading?'Refreshing…':'Refresh'}</Button>}/>
  {error&&<ErrorState error={error} onRetry={load}/>}
  {loading&&!orders?<Loading/>:<>
   <div className="grid">
    <Card><div className="metric-label">Sales · 30 days</div><div className="metric">{analytics?money(analytics.sales):'—'}</div><div className="metric-label">Core-reported order value</div></Card>
    <Card><div className="metric-label">Orders · 30 days</div><div className="metric">{analytics?.orders??'—'}</div><div className="metric-label">AOV {analytics?money(analytics.aov):'—'}</div></Card>
    <Card><div className="metric-label">Customers</div><div className="metric">{analytics?.customers??'—'}</div><div className="metric-label">Customer activity</div></Card>
    <Card><div className="metric-label">Attention</div><div className="metric">{analytics?attention:'—'}</div><div className="metric-label">Low stock · Returns · Payment failures</div></Card>
   </div>
   <Card><div className="card-title">Commerce control areas</div><div className="quick">{workspaces.map(([name,desc,href,Icon])=><Link key={href} href={href}><b><Icon size={15}/> {name}</b><span>{desc}<ArrowRight size={14}/></span></Link>)}</div></Card>
   <div className="section-grid">
    <Card><div className="card-title">Sales trend · 30 days</div>{analytics?.series?.length?<div style={{display:'grid',gap:7,marginTop:16}}>{analytics.series.slice(-14).map(x=><div key={x.date} style={{display:'grid',gridTemplateColumns:'72px 1fr 90px',gap:10,alignItems:'center',fontSize:12}}><span>{x.date.slice(5)}</span><div role="meter" aria-label={`${x.date}: ${money(x.sales)} sales`} aria-valuemin={0} aria-valuemax={maxSales} aria-valuenow={Number(x.sales||0)} style={{height:8,background:'var(--border,#eee)',borderRadius:8,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.max(2,Number(x.sales||0)/maxSales*100)}%`,background:'currentColor',opacity:.75}}/></div><strong style={{textAlign:'right'}}>{money(x.sales)}</strong></div>)}</div>:<div className="empty">Analytics data unavailable. Operational data remains available below.</div>}</Card>
    <Card><div className="card-title">Attention queue</div><div className="quick">
      <Link href="/inventory"><b><PackageSearch size={14}/> Low stock</b><span>{analytics?.low_stock??0} alerts</span></Link>
      <Link href="/returns"><b><RotateCcw size={14}/> Returns</b><span>{analytics?.returns??0} requests</span></Link>
      <Link href="/orders"><b><CreditCard size={14}/> Payment failures</b><span>{analytics?.payment_failures??0} failures</span></Link>
      <Link href="/customers"><b><Users size={14}/> Customers</b><span>Customer 360 and account controls</span></Link>
    </div>{attention>0&&<div style={{marginTop:14}}><Badge>{attention} items require review</Badge></div>}</Card>
   </div>
   <div className="section-grid">
    <Card><div className="card-title">Recent orders</div>{orders?.data?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.data.map(o=><tr key={String(o.id)}><td><b>#{o.order_number||o.id}</b></td><td>{o.customer?.name||o.customer?.phone||'—'}</td><td>{o.currency||'₹'} {o.grand_total??o.total??'—'}</td><td><Badge>{o.status}</Badge></td></tr>)}</tbody></table></div>:<div className="empty">No orders returned by the API.</div>}<div style={{marginTop:14}}><Link href="/orders" className="btn">View all orders</Link></div></Card>
    <Card><div className="card-title">Platform health</div><div className="quick"><div><b>API</b><span><Badge>{health?'Online':'Unknown'}</Badge></span></div><div><b>Redis</b><span><Badge>{health?.redis??'Unknown'}</Badge></span></div><div><b>Catalog</b><span>{products?.total??'—'} products</span></div><div><b>Admin control plane</b><span>Core API is authoritative for commerce state</span></div></div></Card>
   </div>
  </>}
 </section>
}