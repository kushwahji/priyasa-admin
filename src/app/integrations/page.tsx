'use client';
import {useEffect,useState} from 'react';
import {CheckCircle2,ExternalLink,MessageCircle,Megaphone,ShoppingBag,Truck,CreditCard,Mail,RefreshCw,PlugZap} from 'lucide-react';
import {api} from '@/lib/api';
import {PageHeader,Card,Button,Loading,ErrorState,Modal} from '@/components/ui';

type Integration={id:string;name:string;description:string;status:'connected'|'disconnected'|'attention';icon:string;connect_path?:string;manage_path?:string};
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
 const [items,setItems]=useState<Integration[]>(defaults),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<Integration|null>(null),[busy,setBusy]=useState(false);
 async function load(){setLoading(true);setError('');try{const r=await api<any>('/admin/integrations');const data=r.data?.integrations||r.data||[];if(Array.isArray(data)&&data.length)setItems(defaults.map(d=>({...d,...(data.find((x:any)=>x.id===d.id)||{})})));}catch(e){setError(e instanceof Error?e.message:'Unable to load integration status.');}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function connect(item:Integration){if(!item.connect_path){setSelected(item);return} setBusy(true);try{const r=await api<any>(item.connect_path);const url=r.data?.authorization_url||r.data?.url;if(url)window.location.assign(url);else await load();}catch(e){setError(e instanceof Error?e.message:'Unable to start connection.')}finally{setBusy(false)}}
 if(loading)return <><PageHeader title="Integrations" description="Connect the services that power Priyasa commerce and automation."/><Loading/></>;
 return <div><PageHeader title="Integrations" description="Connect the services that power Priyasa commerce and automation." action={<Button onClick={load}><RefreshCw size={15}/> Refresh</Button>}/>{error&&<ErrorState error={error} onRetry={load}/>}<div className="grid-cards">{items.map(item=>{const Icon=icons[item.icon]||PlugZap;return <Card key={item.id}><div style={{display:'flex',justifyContent:'space-between',gap:16}}><div className="module-icon"><Icon size={22}/></div><span className={`status ${item.status}`}>{item.status==='connected'?<CheckCircle2 size={14}/>:null}{item.status}</span></div><h2>{item.name}</h2><p>{item.description}</p><div style={{display:'flex',gap:8,marginTop:18}}><Button disabled={busy} onClick={()=>connect(item)}>{item.status==='connected'?'Manage':'Connect'} <ExternalLink size={14}/></Button>{item.status==='connected'&&<Button className="secondary" onClick={()=>setSelected(item)}>Details</Button>}</div></Card>})}</div>{selected&&<Modal title={selected.name} onClose={()=>setSelected(null)}><p>{selected.description}</p><p style={{marginTop:12}}>Connection credentials are handled by the backend integration flow. Secrets are never entered into or stored by this browser UI.</p><Button onClick={()=>setSelected(null)}>Close</Button></Modal>}</div>;
}
