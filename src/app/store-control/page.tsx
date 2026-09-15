'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Activity,ArrowUpRight,Boxes,Globe,LayoutTemplate,Megaphone,MessageCircle,Package,Palette,RefreshCw,Settings,ShieldCheck,ShoppingBag,Truck,Users,Workflow} from 'lucide-react';
import {api} from '@/lib/api';
import {apiMessage} from '@/lib/format';
import {Badge,Button,Card,ErrorState,Loading,PageHeader} from '@/components/ui';

type Tile={title:string;text:string;href:string;icon:any};
const tiles:Tile[]=[
 {title:'Storefront Home Builder',text:'Hero, categories, product rails, offers, brands and reviews.',href:'/cms/home-builder',icon:LayoutTemplate},
 {title:'Themes',text:'Visual tokens, assets, feature flags and active theme.',href:'/cms/themes',icon:Palette},
 {title:'Catalog',text:'Products, variants, media, categories and collections.',href:'/products',icon:Package},
 {title:'Merchandising',text:'Ranking, featured products, scores and badges.',href:'/merchandising',icon:Boxes},
 {title:'Orders',text:'Order lifecycle, payments, fulfillment, refunds and invoices.',href:'/orders',icon:ShoppingBag},
 {title:'Inventory',text:'Stock, warehouses, movements and bulk adjustments.',href:'/inventory',icon:Boxes},
 {title:'Customers',text:'Customer accounts, segments, tags, notes and consent.',href:'/customers',icon:Users},
 {title:'Shipping',text:'Shipments, labels, pickup, tracking and exceptions.',href:'/shipping',icon:Truck},
 {title:'WhatsApp',text:'Templates, conversations and transactional messaging.',href:'/whatsapp',icon:MessageCircle},
 {title:'Marketing & Ads',text:'Promotions, Meta connection, campaigns and attribution.',href:'/marketing',icon:Megaphone},
 {title:'Automation',text:'Commerce events and operational automation controls.',href:'/automation',icon:Workflow},
 {title:'Security',text:'Admins, roles, permissions and audit trails.',href:'/admins',icon:ShieldCheck},
];

export default function StoreControl(){
 const[health,setHealth]=useState<any>(null),[themes,setThemes]=useState<any[]>([]),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[error,setError]=useState(''),[updated,setUpdated]=useState('');
 async function load(){setRefreshing(true);setError('');try{const[h,t]=await Promise.all([api<any>('/health'),api<any>('/admin/cms/themes')]);const raw=t.data;setThemes(Array.isArray(raw)?raw:Array.isArray(raw?.data)?raw.data:[]);setHealth(h.data||null);setUpdated(new Date().toISOString())}catch(e){setError(apiMessage(e,'Unable to load Priyasa Store control status.'))}finally{setLoading(false);setRefreshing(false)}}
 useEffect(()=>{void load()},[]);
 const active=themes.find(t=>t.is_active);
 return <section className="content"><PageHeader title="Priyasa Store Control Center" description="Independent operational control for the Priyasa Store. PriyasaCore remains the API and data source; this Admin is the command surface." action={<Button onClick={load} disabled={refreshing}><RefreshCw size={14}/>{refreshing?'Refreshing…':'Refresh'}</Button>}/>{error&&<ErrorState error={error} onRetry={load}/>} {loading?<Loading/>:<><div className="grid"><Card><div className="metric-label">API status</div><div className="metric">{health?'Online':'Unknown'}</div><div className="metric-label">PriyasaCore production API</div></Card><Card><div className="metric-label">Active theme</div><div className="metric">{active?.name||'Not set'}</div><div className="metric-label">{active?.key||'Create a storefront theme'}</div></Card><Card><div className="metric-label">Admin model</div><div className="metric">API-first</div><div className="metric-label">No direct database access from Next.js</div></Card><Card><div className="metric-label">Control domains</div><div className="metric">12</div><div className="metric-label">Commerce · operations · growth · security</div></Card></div><div className="section-grid"><Card><div className="card-title">Store operations</div><div className="quick" style={{marginTop:14}}><Link href="/orders"><b><ShoppingBag size={14}/> Orders</b><span>Process the full order lifecycle</span></Link><Link href="/inventory"><b><Boxes size={14}/> Inventory</b><span>Stock and warehouse controls</span></Link><Link href="/shipping"><b><Truck size={14}/> Shipping</b><span>Shipment and carrier operations</span></Link><Link href="/customers"><b><Users size={14}/> Customers</b><span>Customer 360 and support data</span></Link></div></Card><Card><div className="card-title">Storefront & growth</div><div className="quick" style={{marginTop:14}}><Link href="/cms/home-builder"><b><LayoutTemplate size={14}/> Home Builder</b><span>Change homepage without deployment</span></Link><Link href="/cms/themes"><b><Palette size={14}/> Themes</b><span>Activate the production visual system</span></Link><Link href="/marketing"><b><Megaphone size={14}/> Marketing</b><span>Promotions and Meta growth controls</span></Link><Link href="/whatsapp"><b><MessageCircle size={14}/> WhatsApp</b><span>Messaging and template operations</span></Link></div></Card></div><div className="grid-cards">{tiles.map(({title,text,href,icon:Icon})=><Link href={href} key={href}><Card><div className="module-icon"><Icon size={20}/></div><h2>{title}</h2><p>{text}</p><div className="form-actions"><span className="btn">Open control <ArrowUpRight size={14}/></span></div></Card></Link>)}</div><Card><div className="quick"><div><b><Globe size={14}/> Storefront</b><span>Public site configuration is served by PriyasaCore CMS/theme APIs.</span></div><div><b><Activity size={14}/> Health</b><span>Database: {health?.database??'Unknown'} · Redis: {health?.redis??'Unknown'}</span></div><div><b><Settings size={14}/> Configuration</b><span>Provider secrets remain server-side and are not editable in this browser.</span></div></div><div className="muted" style={{marginTop:12}}>Last refreshed {updated?new Date(updated).toLocaleString('en-IN'):'—'}</div></Card></>}</section>;
}
