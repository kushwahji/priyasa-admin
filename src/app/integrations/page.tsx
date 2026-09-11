'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, PlugZap, Unplug, ShoppingBag, MessageCircle, Flame, Megaphone, ShieldCheck, LockKeyhole, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, Card, Button, Loading, ErrorState, Modal } from '@/components/ui';

type Integration = { key:string; name:string; description:string; enabled?:boolean; status?:string; last_error?:string|null; connected_at?:string|null; last_tested_at?:string|null };
type Definition = { key:string; name:string; icon:any; description:string; capabilities:string[]; authorization:string };

const definitions:Definition[] = [
  {key:'woocommerce',name:'WooCommerce',icon:ShoppingBag,description:'Connect the WooCommerce store used as an external catalog/order source.',capabilities:['Products','Categories','Orders','Inventory events'],authorization:'Server-managed WooCommerce REST credentials'},
  {key:'meta',name:'Meta / Facebook & Instagram',icon:Megaphone,description:'Authorize Meta Business assets for Facebook, Instagram and marketing automation.',capabilities:['Facebook','Instagram','Ads','Catalog'],authorization:'Meta OAuth — no access token is entered here'},
  {key:'whatsapp',name:'WhatsApp Business',icon:MessageCircle,description:'Connect WhatsApp Cloud API for customer messaging and order notifications.',capabilities:['Messages','Templates','Order updates','Webhooks'],authorization:'Server-managed Meta/WhatsApp credentials'},
  {key:'fcm',name:'Firebase Cloud Messaging',icon:Flame,description:'Enable push notifications for web, Android and future native clients.',capabilities:['Web push','Android push','Order alerts'],authorization:'Server-managed Firebase service account'},
];

const idempotency=()=>crypto.randomUUID();

export default function Integrations(){
  const[rows,setRows]=useState<Integration[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState('');const[selected,setSelected]=useState<string|null>(null);const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');const[confirmOpen,setConfirmOpen]=useState(false);const[syncing,setSyncing]=useState<string|null>(null);

  async function load(){setLoading(true);setError('');try{const[integrationResult,metaResult]=await Promise.all([api<any>('/admin/integrations'),api<any>('/admin/integrations/meta/status').catch(()=>({data:null}))]);const value=integrationResult.data;const base:Integration[]=Array.isArray(value)?value:Array.isArray(value?.data)?value.data:[];const meta=metaResult.data;setRows([...base.filter(r=>r.key!=='meta'&&r.key!=='meta_ads'),{key:'meta',name:'Meta / Facebook & Instagram',description:'Authorize Meta Business assets through OAuth.',enabled:Boolean(meta?.connected),status:meta?.connected?'connected':'disconnected',connected_at:meta?.connected_at||null,last_tested_at:meta?.expires_at||null}]);}catch(e){setError(e instanceof Error?e.message:'Unable to load integrations.')}finally{setLoading(false)}}
  useEffect(()=>{void load()},[]);
  const items=useMemo(()=>definitions.map(d=>({...d,...(rows.find(r=>r.key===d.key)||{})})),[rows]);

  function beginConnect(key:string){setSelected(key);setConfirmOpen(true);setMessage('');setError('')}

  async function authorize(){if(!selected)return;setBusy(true);setError('');setMessage('');try{
    if(selected==='meta'){const result=await api<any>('/admin/integrations/meta/connect');const url=result.data?.authorization_url;if(!url)throw new Error('Meta authorization URL was not returned by PriyasaCore.');window.location.assign(url);return}
    const path=`/admin/integrations/${encodeURIComponent(selected)}/connect`;
    const result=await api(path,{method:'POST',headers:{'Idempotency-Key':idempotency(),'Content-Type':'application/json','X-Integration-Credential-Source':'server'},body:JSON.stringify({credential_source:'server'})});
    setMessage(result.message||`${selected} connected successfully using secure server-side credentials.`);setConfirmOpen(false);setSelected(null);await load();
  }catch(e){setError(e instanceof Error?e.message:'Connection failed. Configure the provider on PriyasaCore, then retry.')}finally{setBusy(false)}}

  async function disconnect(key:string){if(!window.confirm(`Disconnect ${key}? This stops provider calls and automation.`))return;setBusy(true);setError('');try{await api(`/admin/integrations/${encodeURIComponent(key)}/disconnect`,{method:'POST',headers:{'Idempotency-Key':idempotency()}});setMessage(`${key} disconnected.`);await load()}catch(e){setError(e instanceof Error?e.message:'Unable to disconnect integration.')}finally{setBusy(false)}}

  async function sync(kind:'products'|'categories'|'orders'){setSyncing(kind);setError('');setMessage('');try{const result=await api(`/admin/integrations/woocommerce/sync/${kind}`,{method:'POST',headers:{'Idempotency-Key':idempotency(),'Content-Type':'application/json'},body:'{}'});setMessage(result.message||`WooCommerce ${kind} synchronization completed or was queued.`);await load()}catch(e){setError(e instanceof Error?e.message:`WooCommerce ${kind} synchronization failed.`)}finally{setSyncing(null)}}

  if(loading)return <><PageHeader title="Integrations" description="Secure provider connections controlled by PriyasaCore."/><Loading/></>;

  return <section className="content integrations-v2"><PageHeader title="Integrations" description="Connect external commerce and communication providers without exposing provider secrets to the Admin UI." action={<Button onClick={load} disabled={busy||Boolean(syncing)}><RefreshCw size={15}/> Refresh</Button>}/>{error&&<ErrorState error={error} onRetry={load}/>} {message&&<div className="form-success" role="status">{message}</div>}
    <div className="integration-security-banner"><ShieldCheck size={21}/><div><strong>Security-first connections</strong><span>Secrets stay in PriyasaCore. The browser receives connection status only; it never stores provider credentials.</span></div><LockKeyhole size={18}/></div>
    <div className="grid-cards">{items.map(item=>{const Icon=item.icon;const connected=Boolean(item.enabled)||item.status==='connected'||item.status==='healthy';return <Card key={item.key}><div className="integration-card-head"><div className="module-icon"><Icon size={22}/></div><span className={`status ${connected?'connected':'disconnected'}`}>{connected?<CheckCircle2 size={14}/>:<AlertTriangle size={14}/>} {connected?'Connected':'Not connected'}</span></div><h2>{item.name}</h2><p>{item.description}</p><div className="integration-capabilities">{item.capabilities.map(c=><span key={c}>{c}</span>)}</div><small className="integration-auth"><LockKeyhole size={12}/> {item.authorization}</small>{item.last_error&&<small className="form-error">{item.last_error}</small>}
      <div className="form-actions integration-actions">{connected&&item.key!=='meta'&&<Button onClick={()=>disconnect(item.key)} disabled={busy||Boolean(syncing)}><Unplug size={14}/> Disconnect</Button>}{!connected&&<Button className="primary" onClick={()=>beginConnect(item.key)} disabled={busy||Boolean(syncing)}><PlugZap size={14}/> Connect securely</Button>}{item.key==='meta'&&connected&&<span className="status connected"><CheckCircle2 size={14}/> OAuth active</span>}{item.key==='woocommerce'&&connected&&<div className="integration-sync-actions"><Button onClick={()=>sync('products')} disabled={Boolean(syncing)}> {syncing==='products'?<RefreshCw className="spin" size={14}/>:null} Products</Button><Button onClick={()=>sync('categories')} disabled={Boolean(syncing)}>{syncing==='categories'?<RefreshCw className="spin" size={14}/>:null} Categories</Button><Button onClick={()=>sync('orders')} disabled={Boolean(syncing)}>{syncing==='orders'?<RefreshCw className="spin" size={14}/>:null} Orders</Button></div>}</div>
    </Card>})}</div>
    {selected&&confirmOpen&&<Modal title={`Connect ${definitions.find(d=>d.key===selected)?.name||selected}`} onClose={()=>!busy&&(setConfirmOpen(false),setSelected(null))}><div className="integration-consent"><div className="integration-consent-icon"><ShieldCheck size={28}/></div><h3>Allow PRIYASA to connect?</h3><p>This action authorizes PriyasaCore to use the provider credentials configured securely on the backend. No secret will be typed into, stored in, or returned to this browser.</p><div className="integration-consent-list"><div><CheckCircle2 size={15}/> Credentials remain server-side</div><div><CheckCircle2 size={15}/> Provider calls run through PriyasaCore</div><div><CheckCircle2 size={15}/> Connection can be revoked from this page</div><div><CheckCircle2 size={15}/> Actions are protected with idempotency</div></div>{error&&<div className="form-error" role="alert">{error}</div>}<div className="form-actions"><Button onClick={authorize} disabled={busy}>{busy?'Connecting securely…':'Allow & Connect'}</Button><Button onClick={()=>{setConfirmOpen(false);setSelected(null)}} disabled={busy}>Cancel</Button></div>{selected!=='meta'&&<p className="helper"><ExternalLink size={13}/> If this connection is not configured on PriyasaCore yet, add its credentials to the backend environment/secret store first. The Admin UI intentionally does not collect them.</p>}</div></Modal>}
  </section>;
}
