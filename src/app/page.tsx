'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {Activity,AlertTriangle,ArrowUpRight,Boxes,CheckCircle2,CreditCard,PackageSearch,RefreshCw,RotateCcw,ShoppingBag,Truck,Users,WalletCards} from 'lucide-react';
import {api} from '@/lib/api';
import {apiMessage,dateTime} from '@/lib/format';
import {Order,Paginated,Product} from '@/lib/types';
import {PageHeader,Card,Loading,ErrorState,Badge,Button} from '@/components/ui';

type Analytics={revenue?:number;sales?:number;orders?:number;aov?:number;customers?:number;new_customers?:number;returning_customers?:number;cancelled_orders?:number;discounts?:number;returns?:number;payment_failures?:number;low_stock?:number;series?:Array<{date:string;orders:number;sales?:number;revenue?:number}>;top_products?:Array<{name?:string;product_name?:string;orders?:number;quantity?:number;revenue?:number;sales?:number}>;channels?:Array<{channel?:string;orders?:number;revenue?:number;sales?:number}>};
type Snapshot={label:string;value:string;hint:string;href:string;icon:any};
const money=(n:number)=>`₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
const iso=(d:Date)=>d.toISOString().slice(0,10);
const rangeDates=(days:number)=>{const end=new Date();const start=new Date();start.setDate(end.getDate()-days+1);return {from:iso(start),to:iso(end)}};

export default function Dashboard(){
 const [analytics,setAnalytics]=useState<Analytics|null>(null),[orders,setOrders]=useState<Paginated<Order>|null>(null),[products,setProducts]=useState<Paginated<Product>|null>(null),[health,setHealth]=useState<any>(null),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[error,setError]=useState(''),[updated,setUpdated]=useState('');
 const [days,setDays]=useState(30);
 async function load(nextDays=days){setLoading(true);setRefreshing(true);setError('');try{const {from,to}=rangeDates(nextDays);const [a,o,p,h]=await Promise.allSettled([api<Analytics>(`/admin/analytics?from=${from}&to=${to}`),api<Paginated<Order>>('/admin/orders?per_page=8'),api<Paginated<Product>>('/admin/catalog/products?per_page=1'),api<any>('/health')]);
   const failures=[a,o,p,h].filter(x=>x.status==='rejected').length;
   setAnalytics(a.status==='fulfilled'?(a.value.data||null):null);setOrders(o.status==='fulfilled'?(o.value.data||null):null);setProducts(p.status==='fulfilled'?(p.value.data||null):null);setHealth(h.status==='fulfilled'?(h.value.data||null):null);setUpdated(new Date().toISOString());
   if(failures===4)throw new Error('Commerce dashboard APIs are unavailable');
 }catch(e){setError(apiMessage(e,'Unable to load commerce dashboard'))}finally{setLoading(false);setRefreshing(false)}}
 useEffect(()=>{load()},[]);
 const sales=Number(analytics?.revenue??analytics?.sales??0), ordersCount=Number(analytics?.orders??0), customers=Number(analytics?.customers??0);
 const attention=Number(analytics?.low_stock??0)+Number(analytics?.returns??0)+Number(analytics?.payment_failures??0);
 const series=analytics?.series||[];const maxSales=Math.max(1,...series.map(x=>Number(x.sales??x.revenue??0)));
 const top=analytics?.top_products||[];const channels=analytics?.channels||[];
 const snapshots:Snapshot[]=useMemo(()=>[
  {label:'Revenue',value:money(sales),hint:`${days}-day period`,href:'/analytics',icon:WalletCards},
  {label:'Orders',value:ordersCount.toLocaleString('en-IN'),hint:`AOV ${money(Number(analytics?.aov??0))}`,href:'/orders',icon:ShoppingBag},
  {label:'Customers',value:customers.toLocaleString('en-IN'),hint:`${Number(analytics?.new_customers??0)} new`,href:'/customers',icon:Users},
  {label:'Attention',value:attention.toLocaleString('en-IN'),hint:'Stock · returns · payments',href:'/operations',icon:AlertTriangle}
 ],[sales,ordersCount,customers,attention,days,analytics]);
 return <section className="content"><PageHeader title="Commerce Command Center" description="Executive view of sales, orders, customers, inventory and operational risk." action={<div className="form-actions"><select aria-label="Analytics period" value={days} onChange={e=>{const n=Number(e.target.value);setDays(n);load(n)}}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select><Button onClick={()=>load()} disabled={refreshing}><RefreshCw size={14}/> {refreshing?'Refreshing…':'Refresh'}</Button></div>}/>
 {error&&<ErrorState error={error} onRetry={()=>load()}/>} 
 {loading&&!analytics&&!orders?<Loading/>:<>
  <div className="grid">{snapshots.map(({label,value,hint,href,icon:Icon})=><Link href={href} key={label}><Card><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}><div><div className="metric-label">{label}</div><div className="metric">{value}</div><div className="metric-label">{hint}</div></div><Icon size={19} aria-hidden="true"/></div></Card></Link>)}</div>
  <div className="section-grid">
   <Card><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><div><div className="card-title">Revenue trend</div><span className="muted">Daily performance · last {days} days</span></div><Link href="/analytics"><ArrowUpRight size={16}/></Link></div>{series.length?<div style={{display:'grid',gap:7,marginTop:18}}>{series.slice(-14).map(x=>{const value=Number(x.sales??x.revenue??0);return <div key={x.date} style={{display:'grid',gridTemplateColumns:'52px 1fr 92px',gap:10,alignItems:'center',fontSize:12}}><span>{x.date.slice(5)}</span><div role="meter" aria-label={`${x.date}: ${money(value)}`} aria-valuemin={0} aria-valuemax={maxSales} aria-valuenow={value} style={{height:8,background:'var(--border,#eee)',borderRadius:8,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.max(value?2:0,value/maxSales*100)}%`,background:'currentColor',opacity:.72}}/></div><strong style={{textAlign:'right'}}>{money(value)}</strong></div>})}</div>:<div className="empty">No daily revenue series returned for this period.</div>}</Card>
   <Card><div className="card-title">Operational risk</div><div className="quick" style={{marginTop:14}}><Link href="/inventory"><b><PackageSearch size={14}/> Low stock</b><span>{Number(analytics?.low_stock??0)} items requiring review</span></Link><Link href="/returns"><b><RotateCcw size={14}/> Returns</b><span>{Number(analytics?.returns??0)} return requests</span></Link><Link href="/finance/transactions"><b><CreditCard size={14}/> Payment failures</b><span>{Number(analytics?.payment_failures??0)} failures in period</span></Link><Link href="/shipping"><b><Truck size={14}/> Fulfillment</b><span>Open shipment controls and tracking</span></Link><Link href="/operations"><b><Activity size={14}/> Operations</b><span>Audit events and exceptions</span></Link></div>{attention>0?<div style={{marginTop:14}}><Badge><AlertTriangle size={13}/> {attention} attention items</Badge></div>:<div style={{marginTop:14}}><Badge><CheckCircle2 size={13}/> No reported attention items</Badge></div>}</Card>
  </div>
  <div className="section-grid">
   <Card><div className="card-title">Top products</div>{top.length?<div className="table-wrap" style={{marginTop:14}}><table className="table"><thead><tr><th>Product</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>{top.slice(0,8).map((p,i)=><tr key={`${p.product_name||p.name||'product'}-${i}`}><td><b>{p.product_name||p.name||'—'}</b></td><td>{p.orders??p.quantity??0}</td><td>{money(Number(p.revenue??p.sales??0))}</td></tr>)}</tbody></table></div>:<div className="empty" style={{marginTop:14}}>Top-product data is not available for this period.</div>}<div style={{marginTop:14}}><Link href="/analytics" className="btn">Open analytics</Link></div></Card>
   <Card><div className="card-title">Sales channels</div>{channels.length?<div className="quick" style={{marginTop:14}}>{channels.slice(0,6).map((c,i)=><div key={`${c.channel||'channel'}-${i}`}><b>{c.channel||'Unknown'}</b><span>{c.orders??0} orders · {money(Number(c.revenue??c.sales??0))}</span></div>)}</div>:<div className="empty" style={{marginTop:14}}>Channel performance is not available for this period.</div>}</Card>
  </div>
  <div className="section-grid">
   <Card><div className="card-title">Recent orders</div>{orders?.data?.length?<div className="table-wrap" style={{marginTop:14}}><table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.data.map(o=><tr key={String(o.id)}><td><Link href={`/orders/${o.id}`}><b>#{o.order_number||o.id}</b></Link></td><td>{o.customer?.name||o.customer?.phone||'—'}</td><td>{money(Number(o.grand_total??o.total??0))}</td><td><Badge>{o.status}</Badge></td></tr>)}</tbody></table></div>:<div className="empty" style={{marginTop:14}}>No recent orders returned by the API.</div>}<div style={{marginTop:14}}><Link href="/orders" className="btn">View all orders</Link></div></Card>
   <Card><div className="card-title">Platform status</div><div className="quick" style={{marginTop:14}}><div><b>API</b><span><Badge>{health?'Online':'Unknown'}</Badge></span></div><div><b>Redis</b><span><Badge>{health?.redis??'Unknown'}</Badge></span></div><div><b>Database</b><span><Badge>{health?.database??'Unknown'}</Badge></span></div><div><b>Catalog</b><span>{products?.total??'—'} products</span></div></div><div style={{marginTop:14}} className="muted">Last refreshed: {dateTime(updated)}</div><div style={{marginTop:12}}><Link href="/readiness" className="btn"><Boxes size={14}/> Production readiness</Link></div></Card>
  </div>
 </>}
 </section>
}
