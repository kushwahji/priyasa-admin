'use client';

import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {PageHeader,Card,Button,Loading,ErrorState} from '@/components/ui';

type Config={announcement?:Record<string,unknown>;header?:Record<string,unknown>;navigation?:Record<string,unknown>;footer?:Record<string,unknown>};

export default function StorefrontConfig(){
 const [config,setConfig]=useState<Config>({});
 const [raw,setRaw]=useState('{}');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [saved,setSaved]=useState('');
 async function load(){
  setLoading(true);setError('');setSaved('');
  try{const r=await api<Config>('/admin/storefront-config');const value=r.data||{};setConfig(value);setRaw(JSON.stringify(value,null,2));}
  catch(e){setError(e instanceof Error?e.message:'Unable to load storefront configuration')}
  finally{setLoading(false)}
 }
 useEffect(()=>{load()},[]);
 async function save(){
  setError('');setSaved('');
  let value:Config;
  try{value=JSON.parse(raw);if(!value||Array.isArray(value)||typeof value!=='object')throw new Error('Configuration must be a JSON object.')}
  catch(e){setError(e instanceof Error?e.message:'Invalid JSON');return}
  setBusy(true);
  try{const r=await api<Config>('/admin/storefront-config',{method:'PUT',body:JSON.stringify(value)});setConfig(r.data||value);setRaw(JSON.stringify(r.data||value,null,2));setSaved('Storefront configuration saved.');}
  catch(e){setError(e instanceof Error?e.message:'Unable to save storefront configuration')}
  finally{setBusy(false)}
 }
 return <section className="content"><PageHeader title="Storefront Config" description="Control announcement bar, header, navigation and footer configuration used by the customer storefront." action={<Button onClick={load} disabled={loading||busy}>Refresh</Button>}/>
 {error&&<ErrorState error={error} onRetry={load}/>}
 {loading?<Loading/>:<Card><div className="card-title">Live storefront chrome</div><p className="muted">Changes are written to PriyasaCore and are public to the storefront. Use valid JSON matching the announcement, header, navigation and footer sections.</p><textarea aria-label="Storefront configuration JSON" rows={24} value={raw} onChange={e=>setRaw(e.target.value)} style={{width:'100%',fontFamily:'monospace'}}/><div className="form-actions"><Button onClick={()=>setRaw(JSON.stringify(config,null,2))} disabled={busy}>Reset</Button><Button className="primary" onClick={save} disabled={busy}>{busy?'Saving…':'Save configuration'}</Button></div>{saved&&<div className="form-success" role="status">{saved}</div>}</Card>}</section>;
}
