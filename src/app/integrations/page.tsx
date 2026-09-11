'use client';
import {useEffect,useState} from 'react';
import {RefreshCw,CheckCircle2,AlertTriangle,PlugZap,Unplug,ShoppingBag,MessageCircle,Flame,Megaphone} from 'lucide-react';
import {api} from '@/lib/api';
import {PageHeader,Card,Button,Loading,ErrorState,Modal} from '@/components/ui';

type Integration={key:string;name:string;description:string;enabled?:boolean;status?:string;last_error?:string|null};
const definitions=[
 {key:'woocommerce',name:'WooCommerce',icon:ShoppingBag,description:'Synchronize products and orders from an existing WooCommerce store.'},
 {key:'whatsapp',name:'WhatsApp Business',icon:MessageCircle,description:'Customer messaging, templates and order notifications.'},
 {key:'fcm',name:'Firebase Cloud Messaging',icon:Flame,description:'Push notifications for web and native Android devices.'},
 {key:'meta',name:'Meta',icon:Megaphone,description:'Meta connection status and commerce/ads integrations.'},
];
const idempotency=()=>crypto.randomUUID();

export default function Integrations(){
 const [rows,setRows]=useState<Integration[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<string|null>(null),[form,setForm]=useState<Record<string,string>>({}),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function load(){setLoading(true);setError('');try{const r=await api<any>('/admin/integrations');const value=r.data;setRows(Array.isArray(value)?value:Array.isArray(value?.data)?value.data:[])}catch(e){setError(e instanceof Error?e.message:'Unable to load integrations.')}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const items=definitions.map(d=>({...d,...(rows.find(r=>r.key===d.key)||rows.find(r=>r.key===d.key.replace('meta','meta_ads'))||{})}));
 async function connect(){
  if(!selected)return;
  setBusy(true);setError('');setMessage('');
  try{
   let path='';let body:Record<string,unknown>={};
   if(selected==='woocommerce'){path='/admin/integrations/woocommerce/connect';body={store_url:form.store_url,consumer_key:form.consumer_key,consumer_secret:form.consumer_secret,webhook_secret:form.webhook_secret||undefined};}
   else if(selected==='whatsapp'){path='/admin/integrations/whatsapp/connect';body={phone_number_id:form.phone_number_id,waba_id:form.waba_id,access_token:form.access_token,catalog_id:form.catalog_id||undefined,webhook_verify_token:form.webhook_verify_token||undefined};}
   else if(selected==='fcm'){path='/admin/integrations/fcm/connect';body={service_account_json:form.service_account_json};}
   else {throw new Error('Meta is managed through the Meta connection flow; use the Meta integration controls when enabled on the backend.');}
   const r=await api(path,{method:'POST',headers:{'Idempotency-Key':idempotency()},body:JSON.stringify(body)});
   setMessage(r.message||'Integration connected successfully.');await load();setSelected(null);setForm({});
  }catch(e){setError(e instanceof Error?e.message:'Connection failed.')}finally{setBusy(false)}
 }
 async function disconnect(key:string){if(!confirm(`Disconnect ${key}?`))return;setBusy(true);setError('');try{await api(`/admin/integrations/${encodeURIComponent(key)}/disconnect`,{method:'POST',headers:{'Idempotency-Key':idempotency()}});await load()}catch(e){setError(e instanceof Error?e.message:'Unable to disconnect integration.')}finally{setBusy(false)}}
 async function sync(kind:'products'|'orders'){setBusy(true);setError('');try{await api(`/admin/integrations/woocommerce/sync/${kind}`,{method:'POST',headers:{'Idempotency-Key':idempotency()},body:JSON.stringify({})});setMessage(`WooCommerce ${kind} sync started.`);await load()}catch(e){setError(e instanceof Error?e.message:`WooCommerce ${kind} sync failed.`)}finally{setBusy(false)}}
 if(loading)return <><PageHeader title="Integrations" description="Production connections used by PRIYASA commerce and automation."/><Loading/></>;
 return <section className="content">
  <PageHeader title="Integrations" description="Production connections used by PRIYASA commerce and automation." action={<Button onClick={load} disabled={busy}><RefreshCw size={15}/> Refresh</Button>}/>
  {error&&<ErrorState error={error} onRetry={load}/>} {message&&<div className="form-success" role="status">{message}</div>}
  <div className="grid-cards">
   {items.map(item=>{const Icon=item.icon;const connected=Boolean(item.enabled)||item.status==='connected'||item.status==='healthy';return <Card key={item.key}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12}}><div className="module-icon"><Icon size={22}/></div><span className={`status ${connected?'connected':'disconnected'}`}>{connected?<CheckCircle2 size={14}/>:<AlertTriangle size={14}/>} {connected?'Connected':'Not connected'}</span></div>
    <h2>{item.name}</h2><p>{item.description}</p>{item.last_error&&<small className="form-error">{item.last_error}</small>}
    <div className="form-actions" style={{marginTop:16}}>
     {connected&&item.key!=='meta'&&<Button onClick={()=>disconnect(item.key)} disabled={busy}><Unplug size={14}/> Disconnect</Button>}
     {!connected&&item.key!=='meta'&&<Button className="primary" onClick={()=>setSelected(item.key)} disabled={busy}>Connect</Button>}
     {item.key==='woocommerce'&&connected&&<><Button onClick={()=>sync('products')} disabled={busy}>Sync products</Button><Button onClick={()=>sync('orders')} disabled={busy}>Sync orders</Button></>}
    </div>
   </Card>})}
  </div>
  {selected&&<Modal title={`Connect ${definitions.find(x=>x.key===selected)?.name||selected}`} onClose={()=>!busy&&setSelected(null)}>
   <div className="form-grid">
    {selected==='woocommerce'&&<><label>Store URL<input value={form.store_url||''} onChange={e=>setForm({...form,store_url:e.target.value})} placeholder="https://store.example.com" required/></label><label>Consumer key<input value={form.consumer_key||''} onChange={e=>setForm({...form,consumer_key:e.target.value})} required/></label><label>Consumer secret<input type="password" value={form.consumer_secret||''} onChange={e=>setForm({...form,consumer_secret:e.target.value})} required/></label><label>Webhook secret<input value={form.webhook_secret||''} onChange={e=>setForm({...form,webhook_secret:e.target.value})}/></label></>}
    {selected==='whatsapp'&&<><label>Phone number ID<input value={form.phone_number_id||''} onChange={e=>setForm({...form,phone_number_id:e.target.value})} required/></label><label>WABA ID<input value={form.waba_id||''} onChange={e=>setForm({...form,waba_id:e.target.value})} required/></label><label>Access token<input type="password" value={form.access_token||''} onChange={e=>setForm({...form,access_token:e.target.value})} required/></label><label>Catalog ID<input value={form.catalog_id||''} onChange={e=>setForm({...form,catalog_id:e.target.value})}/></label><label>Webhook verify token<input value={form.webhook_verify_token||''} onChange={e=>setForm({...form,webhook_verify_token:e.target.value})}/></label></>}
    {selected==='fcm'&&<label>Firebase service account JSON<textarea rows={10} value={form.service_account_json||''} onChange={e=>setForm({...form,service_account_json:e.target.value})} required/></label>}
    <div className="form-actions"><Button onClick={connect} disabled={busy}>{busy?'Connecting…':'Save & test connection'}</Button></div>
   </div>
  </Modal>}
 </section>;
}
