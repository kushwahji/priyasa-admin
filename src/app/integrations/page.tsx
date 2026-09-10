'use client';
import {useEffect,useState} from 'react';
import {CheckCircle2,ExternalLink,MessageCircle,Megaphone,ShoppingBag,Truck,CreditCard,Mail,RefreshCw,PlugZap,Unplug} from 'lucide-react';
import {api} from '@/lib/api';
import {PageHeader,Card,Button,Loading,ErrorState,Modal} from '@/components/ui';

type Integration={id:string;name:string;description:string;status:'connected'|'disconnected'|'attention'|'error'|'pending';icon:string;connectionId?:number};
const defaults:Integration[]=[
{id:'whatsapp',name:'WhatsApp Business',description:'Customer messaging, templates, inbox and order notifications.',status:'disconnected',icon:'whatsapp'},
{id:'meta_ads',name:'Meta Ads & Commerce',description:'Facebook/Instagram ads, catalog sync, audiences and campaign insights.',status:'disconnected',icon:'meta'},
{id:'razorpay',name:'Razorpay',description:'Payments, captures, refunds and payment webhooks.',status:'disconnected',icon:'razorpay'},
{id:'shiprocket',name:'Shiprocket',description:'Shipment creation, AWB, serviceability and tracking.',status:'disconnected',icon:'shipping'},
{id:'woocommerce',name:'WooCommerce',description:'Optional product, inventory and order synchronization.',status:'disconnected',icon:'store'},
{id:'email',name:'Email Provider',description:'Transactional email and customer communication.',status:'disconnected',icon:'mail'},
];
const icons:Record<string,any>={whatsapp:MessageCircle,meta:Megaphone,razorpay:CreditCard,shipping:Truck,store:ShoppingBag,mail:Mail};
export default function Integrations(){
 const [items,setItems]=useState<Integration[]>(defaults),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<Integration|null>(null),[busy,setBusy]=useState<string|null>(null);
 async function load(){setLoading(true);setError('');try{const r=await api<any>('/admin/integrations?per_page=100');const rows=r.data?.data||r.data||[];if(Array.isArray(rows))setItems(defaults.map(d=>{const x=rows.find((v:any)=>v.provider===d.id);return x?{...d,status:x.status||'disconnected',connectionId:x.id}:d;}));}catch(e){setError(e instanceof Error?e.message:'Unable to load integration status.');}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function connect(item:Integration){setBusy(item.id);try{if(item.id==='whatsapp'||item.id==='meta_ads'){const r=await api<any>(`/admin/integrations/${item.id}/oauth/start`);const url=r.data?.authorization_url;if(!url)throw new Error('OAuth authorization URL was not returned.');window.location.assign(url);return;}setSelected(item);}catch(e){setError(e instanceof Error?e.message:'Unable to start connection.');}finally{setBusy(null)}}
 async function disconnect(item:Integration){if(!item.connectionId||!confirm(`Disconnect ${item.name}?`))return;setBusy(item.id);try{await api(`/admin/integrations/${item.connectionId}`,{method:'DELETE'});await load();setSelected(null)}catch(e){setError(e instanceof Error?e.message:'Unable to disconnect integration.')}finally{setBusy(null)}}
 if(loading)return <><PageHeader title="Integrations" description="Connect the services that power Priyasa commerce and automation."/><Loading/></>;
 return <div><PageHeader title="Integrations" description="Connect the services that power Priyasa commerce and automation." action={<Button onClick={load}><RefreshCw size={15}/> Refresh</Button>}/>{error&&<ErrorState error={error} onRetry={load}/>}<div className="grid-cards">{items.map(item=>{const Icon=icons[item.icon]||PlugZap;return <Card key={item.id}><div style={{display:'flex',justifyContent:'space-between',gap:16}}><div className="module-icon"><Icon size={22}/></div><span className={`status ${item.status}`}>{item.status==='connected'?<CheckCircle2 size={14}/>:null}{item.status}</span></div><h2>{item.name}</h2><p>{item.description}</p><div style={{display:'flex',gap:8,marginTop:18}}><Button disabled={!!busy} onClick={()=>item.status==='connected'?setSelected(item):connect(item)}>{item.status==='connected'?'Manage':'Connect'} <ExternalLink size={14}/></Button></div></Card>})}</div>{selected&&<Modal title={selected.name} onClose={()=>setSelected(null)}><p>{selected.description}</p><p style={{marginTop:12}}>Credentials remain server-side and are never exposed to this browser.</p>{selected.status==='connected'&&<Button className="secondary" disabled={!!busy} onClick={()=>disconnect(selected)}><Unplug size={15}/> Disconnect</Button>}</Modal>}</div>;
}
