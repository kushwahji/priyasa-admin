'use client';

import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {PageHeader,Card,Button,Loading,ErrorState} from '@/components/ui';

type Template={key:string;name:string;type:string;festival?:string|null;description:string;tokens:{colors:Record<string,string>};decorations:{enabled:boolean;type:string;intensity:string};};
type Response={templates?:unknown};
function normalizeTemplates(value:unknown):Template[]{
 if(Array.isArray(value)) return value.filter((item):item is Template=>!!item&&typeof item==='object') as Template[];
 if(value&&typeof value==='object'){
  const v=value as Record<string,unknown>;
  if(Array.isArray(v.templates)) return v.templates.filter((item):item is Template=>!!item&&typeof item==='object') as Template[];
  if(Array.isArray(v.data)) return v.data.filter((item):item is Template=>!!item&&typeof item==='object') as Template[];
 }
 return [];
}

export default function StorefrontThemesPage(){
 const [templates,setTemplates]=useState<Template[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState('');
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 async function load(){
  setLoading(true);setError('');
  try{const r=await api<Response>('/admin/cms/theme-templates');setTemplates(normalizeTemplates(r.data))}
  catch(e){setError(e instanceof Error?e.message:'Unable to load theme templates')}
  finally{setLoading(false)}
 }
 useEffect(()=>{load()},[]);
 async function apply(key:string){
  setBusy(key);setError('');setMessage('');
  try{const r=await api('/admin/cms/theme-templates/apply',{method:'POST',body:JSON.stringify({key})});setMessage(r.data?.message||'Template applied.');}
  catch(e){setError(e instanceof Error?e.message:'Unable to apply template')}
  finally{setBusy('')}
 }
 async function automatic(){
  setBusy('automatic');setError('');setMessage('');
  try{const r=await api('/admin/cms/theme-templates/automatic',{method:'POST'});setMessage(r.data?.message||'Automatic themes restored.');}
  catch(e){setError(e instanceof Error?e.message:'Unable to restore automatic themes')}
  finally{setBusy('')}
 }
 return <section className="content">
  <PageHeader title="Storefront Theme Templates" description="Prefilled PRIYASA home experiences. Apply one and the customer Home API changes immediately without frontend code changes." action={<Button onClick={automatic} disabled={!!busy}>Automatic scheduled themes</Button>}/>
  {error&&<ErrorState error={error} onRetry={load}/>}
  {message&&<div className="form-success" role="status">{message}</div>}
  {loading?<Loading/>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
   {templates.map(t=><Card key={t.key}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
     <div><div className="card-title">{t.name}</div><div className="muted">{t.festival||'Everyday'} · {t.type}</div></div>
     <span style={{display:'inline-flex',gap:4}}>{Object.values(t.tokens?.colors||{}).slice(0,4).map((c,i)=><span key={i} title={c} style={{width:18,height:18,borderRadius:'50%',background:c,border:'1px solid #ddd'}}/>)}</span>
    </div>
    <p className="muted" style={{minHeight:54}}>{t.description}</p>
    <div className="muted" style={{marginBottom:12}}>Home layout, merchandising defaults and {t.decorations?.enabled?'festive':'premium'} motion are preconfigured.</div>
    <Button className="primary" onClick={()=>apply(t.key)} disabled={!!busy}>{busy===t.key?'Applying…':'Apply template'}</Button>
   </Card>)}
  </div>}
 </section>;
}
