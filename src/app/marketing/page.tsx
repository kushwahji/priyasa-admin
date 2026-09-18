'use client';

import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {apiMessage} from '@/lib/format';
import {API_ROUTES} from '@/lib/api-contract';
import {Card,PageHeader,DataToolbar,Modal,Button,Badge,Loading,ErrorState,Empty} from '@/components/ui';

type Campaign={campaign_id:string;name:string;status:string;channels?:Array<{channel:string;template_key:string}>;audience?:{segment_id?:string};schedule?:{send_at?:string;timezone?:string};updated_at?:string};
type List={data:Campaign[];current_page:number;last_page:number;total:number};
type Segment={segment_id:string;name:string;logic:string;rules:any[];is_active:boolean};
const blank={name:'',channels:'push',template_key:'',segment_id:'',status:'draft'};

export default function Marketing(){
 const [list,setList]=useState<List|null>(null),[segments,setSegments]=useState<Segment[]>([]);
 const [q,setQ]=useState(''),[status,setStatus]=useState(''),[channel,setChannel]=useState('');
 const [editing,setEditing]=useState<Campaign|null>(null),[open,setOpen]=useState(false),[form,setForm]=useState({...blank});
 const [stats,setStats]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){
  setError('');
  try{const p=new URLSearchParams({per_page:'50'});if(status)p.set('status',status);if(channel)p.set('channel',channel);const r=await api<List>(API_ROUTES.marketing.campaigns+'?'+p);setList(r.data||null);}
  catch(e){setError(apiMessage(e,'Unable to load campaigns'))}
 }
 async function loadSegments(){try{const r=await api<any>(API_ROUTES.marketing.segments+'?per_page=100');const d=r.data;setSegments(Array.isArray(d)?d:(d?.data||[]));}catch{}}
 useEffect(()=>{load();loadSegments()},[status,channel]);
 function start(c?:Campaign){setEditing(c||null);const ch=c?.channels?.[0];setForm({name:c?.name||'',channels:ch?.channel||'push',template_key:ch?.template_key||'',segment_id:c?.audience?.segment_id||'',status:c?.status||'draft'});setStats(null);setOpen(true)}
 async function save(){
  setBusy(true);setError('');
  try{
   const channels=form.channels.split(',').map(x=>x.trim()).filter(Boolean).map(channel=>({channel,template_key:form.template_key||'default'}));
   if(!form.name.trim()||!channels.length)throw new Error('Campaign name and at least one channel are required.');
   const body={name:form.name.trim(),status:form.status,channels,audience:form.segment_id?{segment_id:form.segment_id}:{filters:{}},schedule:{},frequency_cap:{per_customer_per_24h:1}};
   if(editing)await api(API_ROUTES.marketing.campaign(editing.campaign_id),{method:'PUT',body:JSON.stringify(body)});
   else await api(API_ROUTES.marketing.campaigns,{method:'POST',body:JSON.stringify(body)});
   setOpen(false);await load();
  }catch(e){setError(apiMessage(e,'Unable to save campaign'))}finally{setBusy(false)}
 }
 async function lifecycle(c:Campaign,action:string){
  setBusy(true);setError('');
  try{
   const body=action==='schedule'?{send_at:new Date(Date.now()+3600000).toISOString(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone}:{};
   await api(API_ROUTES.marketing.lifecycle(c.campaign_id,action),{method:'POST',body:JSON.stringify(body)});
   await load();
  }catch(e){setError(apiMessage(e,'Campaign action failed'))}finally{setBusy(false)}
 }
 async function showStats(c:Campaign){setError('');try{const r=await api<any>(API_ROUTES.marketing.stats(c.campaign_id));setStats({name:c.name,...(r.data||{})});}catch(e){setError(apiMessage(e,'Unable to load campaign stats'))}}
 async function createSegment(){
  const name=window.prompt('Segment name');if(!name?.trim())return;
  setBusy(true);try{await api(API_ROUTES.marketing.segments,{method:'POST',body:JSON.stringify({name:name.trim(),logic:'AND',rules:[{field:'marketing_opt_in',operator:'eq',value:true}],is_active:true})});await loadSegments()}catch(e){setError(apiMessage(e,'Unable to create segment'))}finally{setBusy(false)}
 }
 const filtered=(list?.data||[]).filter(c=>!q||c.name.toLowerCase().includes(q.toLowerCase())||c.campaign_id.toLowerCase().includes(q.toLowerCase()));
 return <section className="content">
  <PageHeader title="Marketing" description="Create, schedule and operate lifecycle campaigns across push, email and WhatsApp." action={<div className="form-actions"><Button onClick={load}>Refresh</Button><Button className="primary" onClick={()=>start()}>+ Campaign</Button></div>}/>
  {error&&<ErrorState error={error} onRetry={load}/>}
  <Card><DataToolbar value={q} onChange={setQ} placeholder="Search campaigns…"><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{['draft','scheduled','running','paused','completed','failed'].map(x=><option key={x}>{x}</option>)}</select><select value={channel} onChange={e=>setChannel(e.target.value)}><option value="">All channels</option>{['push','email','whatsapp','rcs'].map(x=><option key={x}>{x}</option>)}</select></DataToolbar>
   {!list&&!error?<Loading/>:filtered.length?<div className="table-wrap"><table className="table"><thead><tr><th>Campaign</th><th>Channels</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{filtered.map(c=><tr key={c.campaign_id}><td><b>{c.name}</b><div className="muted">{c.campaign_id}</div></td><td>{(c.channels||[]).map(x=>x.channel).join(', ')||'—'}</td><td><Badge>{c.status}</Badge></td><td>{c.updated_at?new Date(c.updated_at).toLocaleString('en-IN'):'—'}</td><td><div className="form-actions"><Button onClick={()=>start(c)}>Edit</Button><Button onClick={()=>showStats(c)}>Stats</Button>{c.status==='draft'&&<Button disabled={busy} onClick={()=>lifecycle(c,'schedule')}>Schedule</Button>}{c.status==='scheduled'||c.status==='running'?<Button disabled={busy} onClick={()=>lifecycle(c,'pause')}>Pause</Button>:null}{c.status==='paused'&&<Button disabled={busy} onClick={()=>lifecycle(c,'resume')}>Resume</Button>}</div></td></tr>)}</tbody></table></div>:<Empty title="No campaigns" text="Create a campaign to start controlled lifecycle messaging."/>}
  </Card>
  <div className="section-grid"><Card><div className="card-title">Audience segments</div><div className="form-actions"><Button onClick={createSegment} disabled={busy}>+ Create segment</Button></div>{segments.length?<div className="quick">{segments.map(s=><div key={s.segment_id}><b>{s.name}</b><span>{s.logic} · {s.is_active?'Active':'Inactive'} · <Button onClick={async()=>{try{const r=await api<any>(API_ROUTES.marketing.segmentPreview(s.segment_id));window.alert('Matching customers: '+(r.data?.count??0))}catch(e){setError(apiMessage(e))}}}>Preview</Button></span></div>)}</div>:<div className="empty">No segments yet.</div>}</Card>
  <Card><div className="card-title">Campaign performance</div>{stats?<div className="quick">{Object.entries(stats).map(([k,v])=><div key={k}><b>{k.replaceAll('_',' ')}</b><span>{typeof v==='object'?JSON.stringify(v):String(v??'—')}</span></div>)}</div>:<div className="empty">Select Stats on a campaign to inspect delivery and conversion events.</div>}</Card></div>
  {open&&<Modal title={editing?'Edit campaign':'Create campaign'} onClose={()=>setOpen(false)}><div className="form-grid">
   <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Navratri launch"/></label>
   <label>Channels<input value={form.channels} onChange={e=>setForm({...form,channels:e.target.value})} placeholder="push,email,whatsapp"/></label>
   <label>Template key<input value={form.template_key} onChange={e=>setForm({...form,template_key:e.target.value})} placeholder="navratri_offer"/></label>
   <label>Audience<select value={form.segment_id} onChange={e=>setForm({...form,segment_id:e.target.value})}><option value="">All eligible customers</option>{segments.map(s=><option key={s.segment_id} value={s.segment_id}>{s.name}</option>)}</select></label>
   <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{['draft','scheduled'].map(x=><option key={x}>{x}</option>)}</select></label>
  </div><div className="form-actions"><Button onClick={()=>setOpen(false)}>Cancel</Button><Button className="primary" disabled={busy} onClick={save}>{busy?'Saving…':'Save campaign'}</Button></div></Modal>}
 </section>
}
