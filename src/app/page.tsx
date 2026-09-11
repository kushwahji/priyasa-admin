'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {api} from '@/lib/api';
import {Order,Paginated,Product} from '@/lib/types';
import {PageHeader,Card,Loading,ErrorState,Badge} from '@/components/ui';

type Analytics={orders:number;sales:number;aov:number;customers:number;returns:number;payment_failures:number;low_stock:number;series?:Array<{date:string;orders:number;sales:number}>};
const money=(n:number)=>`₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
export default function Dashboard(){
 const [orders,setOrders]=useState<Paginated<Order>|null>(null),[products,setProducts]=useState<Paginated<Product>|null>(null),[health,setHealth]=useState<any>(null),[analytics,setAnalytics]=useState<Analytics|null>(null),[error,setError]=useState('');
 async function load(){setError('');try{const [o,p,h,a]=await Promise.all([api<Paginated<Order>>('/admin/orders?per_page=8'),api<Paginated<Product>>('/admin/catalog/products?per_page=5'),api<any>('/health'),api<Analytics>('/admin/analytics?range=30d').catch(()=>null)]);setOrders(o.data||null);setProducts(p.data||null);setHealth(h.data);setAnalytics((a as any)?.data??null)}catch(e){setError(e instanceof Error?e.message:'Request failed')}}
 useEffect(()=>{load()},[]);
 const maxSales=useMemo(()=>Math.max(1,...(analytics?.series||[]).map(x=>Number(x.sales||0))),[analytics]);
 return <section className="content"><PageHeader title="Dashboard" description="Live commerce operations from the PRIYASA API." action={<Link href="/products" className="btn primary">Manage catalog</Link>}/>{error&&<ErrorState error={error} onRetry={load}/>} {!error&&!orders?<Loading/>:<>
 <div className="grid">
  <Card><div className="metric-label">Sales · 30 days</div><div className="metric">{analytics?money(analytics.sales):'—'}</div><div className="metric-label">Net order value</div></Card>
  <Card><div className="metric-label">Orders · 30 days</div><div className="metric">{analytics?.orders??'—'}</div><div className="metric-label">AOV {analytics?money(analytics.aov):'—'}</div></Card>
  <Card><div className="metric-label">Customers</div><div className="metric">{analytics?.customers??'—'}</div><div className="metric-label">30-day activity</div></Card>
  <Card><div className="metric-label">Attention</div><div className="metric">{analytics?(analytics.low_stock+analytics.returns+analytics.payment_failures):'—'}</div><div className="metric-label">Low stock · Returns · Payment failures</div></Card>
 </div>
 <div className="section-grid">
  <Card><div className="card-title">Sales trend · 30 days</div>{analytics?.series?.length?<div style={{display:'grid',gap:7,marginTop:16}}>{analytics.series.slice(-14).map(x=><div key={x.date} style={{display:'grid',gridTemplateColumns:'72px 1fr 90px',gap:10,alignItems:'center',fontSize:12}}><span>{x.date.slice(5)}</span><div style={{height:8,background:'var(--border,#eee)',borderRadius:8,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.max(2,Number(x.sales||0)/maxSales*100)}%`,background:'currentColor',opacity:.75}}/></div><strong style={{textAlign:'right'}}>{money(x.sales)}</strong></div>)}</div>:<div className="empty">Analytics data unavailable. Core orders remain visible below.</div>}</Card>
  <Card><div className="card-title">Operations</div><div className="quick"><Link href="/orders"><b>▣ Orders</b><span>{analytics?.orders??orders?.total??0} recent/order records</span></Link><Link href="/inventory"><b>◈ Inventory</b><span>{analytics?.low_stock??0} low-stock alerts</span></Link><Link href="/returns"><b>↩ Returns</b><span>{analytics?.returns??0} return requests</span></Link><Link href="/shipping"><b>🚚 Shipping</b><span>Fulfilment & tracking</span></Link></div></Card>
 </div>
 <div className="section-grid"><Card><div className="card-title">Recent orders</div>{orders?.data?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.data.map(o=><tr key={String(o.id)}><td><b>#{o.order_number||o.id}</b></td><td>{o.customer?.name||o.customer?.phone||'—'}</td><td>{o.currency||'₹'} {o.grand_total??o.total??'—'}</td><td><Badge>{o.status}</Badge></td></tr>)}</tbody></table></div>:<div className="empty">No orders returned by the API.</div>}<div style={{marginTop:14}}><Link href="/orders" className="btn">View all orders</Link></div></Card>
  <Card><div className="card-title">System</div><div className="quick"><div><b>API</b><span><Badge>{health?'Online':'Unknown'}</Badge></span></div><div><b>Redis</b><span><Badge>{health?.redis??'Unknown'}</Badge></span></div><div><b>Catalog</b><span>{products?.total??'—'} products</span></div></div></Card>
 </div></>}
 </section>
}