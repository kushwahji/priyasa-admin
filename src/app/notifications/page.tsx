'use client';

import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {API_ROUTES} from '@/lib/api-contract';
import {apiMessage,dateTime,titleCase} from '@/lib/format';
import {PageHeader,Card,DataToolbar,Button,Badge,Loading,ErrorState,Empty,Modal} from '@/components/ui';

type Template={id:number|string;key:string;channel:string;locale?:string|null;subject?:string|null;body:string;is_active?:boolean;created_at?:string};
type Outbox={id:number|string;customer_id?:number|string|null;channel:string;event_key?:string|null;recipient?:string|null;template_key?:string|null;status:string;attempts?:number;last_error?:string|null;created_at?:string};
type Page<T>={data:T[];current_page:number;last_page:number;total:number};
const channels=['','whatsapp','push','email','sms'];

export default function Notifications(){
 const [tab,setTab]=useState<'templates'|'outbox'|'test'>('templates');
 const [templates,setTemplates]=useState<Template[]>([]),[outbox,setOutbox]=useState<Page<Outbox>|null>(null);
 const [channel,setChannel]=useState(''),[status,setStatus]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState('');
 const [modal,setModal]=useState(false);
 const [form,setForm]=useState({key:'',channel:'whatsapp',locale:'en-IN',subject:'',body:'',is_active:true});
 const [test,setTest]=useState({customer_id:'',channel:'whatsapp',recipient:'',template_key:'',event_key:'admin.test',payload:'{}'});

 async function load(){
  setLoading(true);setError('');setSaved('');
  try{
   const qs=new URLSearchParams({per_page:'50'}); if(channel)qs.set('channel',channel); if(status)qs.set('status',status);
   const [t,o]=await Promise.all([api<Template[]|{data:Template[]}>(API_ROUTES.notifications.templates),api<Page<Outbox>>(API_ROUTES.notifications.outbox+'?'+qs)]);
   const td=t.data;setTemplates(Array.isArray(td)?td:(td?.data||[]));setOutbox(o.data||null);
  }catch(e){setError(apiMessage(e,'Unable to load notification operations'))}finally{setLoading(false)}
 }
 useEffect(()=>{load()},[channel,status]);

 async function saveTemplate(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');setSaved('');
  try{await api(API_ROUTES.notifications.templates,{method:'POST',body:JSON.stringify(form)});setModal(false);setSaved('Notification template created.');await load()}
  catch(e){setError(apiMessage(e,'Unable to create template'))}finally{setBusy(false)}
 }
 async function sendTest(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');setSaved('');
  try{
   let payload:any={};try{payload=JSON.parse(test.payload||'{}')}catch{throw new Error('Payload must be valid JSON.')}
   await api(API_ROUTES.notifications.test,{method:'POST',headers:{'Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({...test,customer_id:Number(test.customer_id),payload})});
   setSaved('Test notification queued. Check the outbox for delivery status.');setTab('outbox');await load();
  }catch(e){setError(apiMessage(e,'Unable to queue test notification'))}finally{setBusy(false)}
 }

 return <section className="content">
  <PageHeader title="Notifications" description="Manage customer notification templates, delivery outbox and controlled test messages." action={<div className="form-actions"><Button onClick={load} disabled={loading}>Refresh</Button>{tab==='templates'&&<Button className="primary" onClick={()=>setModal(true)}>New template</Button>}</div>}/>
  {error&&<ErrorState error={error} onRetry={load}/>} {saved&&<div className="form-success" role="status">{saved}</div>}
  <div className="toolbar"><Button className={tab==='templates'?'primary':''} onClick={()=>setTab('templates')}>Templates</Button><Button className={tab==='outbox'?'primary':''} onClick={()=>setTab('outbox')}>Delivery outbox</Button><Button className={tab==='test'?'primary':''} onClick={()=>setTab('test')}>Send test</Button></div>

  {tab==='templates'&&<Card>{loading?<Loading/>:templates.length?<div className="table-wrap"><table className="table"><thead><tr><th>Template</th><th>Channel</th><th>Locale</th><th>Status</th><th>Created</th></tr></thead><tbody>{templates.map(t=><tr key={String(t.id)}><td><b>{t.key}</b><div className="muted">{(t.body||'').slice(0,90)}</div></td><td>{titleCase(t.channel)}</td><td>{t.locale||'en-IN'}</td><td><Badge>{t.is_active===false?'Inactive':'Active'}</Badge></td><td>{dateTime(t.created_at)}</td></tr>)}</tbody></table></div>:<Empty title="No templates" text="Create the first order, marketing or service notification template."/>}</Card>}

  {tab==='outbox'&&<Card><DataToolbar value="" onChange={()=>{}} placeholder="Delivery filters"><select value={channel} onChange={e=>setChannel(e.target.value)}>{channels.map(c=><option key={c} value={c}>{c?titleCase(c):'All channels'}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="queued">Queued</option><option value="processing">Processing</option><option value="sent">Sent</option><option value="failed">Failed</option></select></DataToolbar>{loading?<Loading/>:outbox?.data?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Message</th><th>Recipient</th><th>Channel</th><th>Status</th><th>Attempts</th><th>Error</th><th>Created</th></tr></thead><tbody>{outbox.data.map(x=><tr key={String(x.id)}><td><b>#{x.id}</b><div className="muted">{x.event_key||'—'}{x.template_key?' · '+x.template_key:''}</div></td><td>{x.recipient||'—'}</td><td>{titleCase(x.channel)}</td><td><Badge>{titleCase(x.status)}</Badge></td><td>{x.attempts??0}</td><td>{x.last_error||'—'}</td><td>{dateTime(x.created_at)}</td></tr>)}</tbody></table></div>:<Empty title="No delivery records" text="Notification jobs will appear here when messages are queued."/>}</Card>}

  {tab==='test'&&<Card><form className="form" onSubmit={sendTest}><div className="form-grid"><label>Customer ID<input required inputMode="numeric" value={test.customer_id} onChange={e=>setTest({...test,customer_id:e.target.value.replace(/\D/g,'')})}/></label><label>Channel<select value={test.channel} onChange={e=>setTest({...test,channel:e.target.value})}>{channels.filter(Boolean).map(c=><option key={c} value={c}>{titleCase(c)}</option>)}</select></label><label>Recipient<input required value={test.recipient} onChange={e=>setTest({...test,recipient:e.target.value})} placeholder="+9198… / email / device token"/></label><label>Template key<input value={test.template_key} onChange={e=>setTest({...test,template_key:e.target.value})} placeholder="optional"/></label></div><label>Event key<input required value={test.event_key} onChange={e=>setTest({...test,event_key:e.target.value})}/></label><label>Payload JSON<textarea rows={8} value={test.payload} onChange={e=>setTest({...test,payload:e.target.value})}/></label><div className="form-actions"><Button className="primary" disabled={busy||!test.customer_id||!test.recipient}>{busy?'Queueing…':'Queue test notification'}</Button></div></form></Card>}

  {modal&&<Modal title="New notification template" onClose={()=>setModal(false)}><form className="form" onSubmit={saveTemplate}><div className="form-grid"><label>Template key<input required value={form.key} onChange={e=>setForm({...form,key:e.target.value})} placeholder="order_confirmed"/></label><label>Channel<select value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})}>{channels.filter(Boolean).map(c=><option key={c} value={c}>{titleCase(c)}</option>)}</select></label><label>Locale<input value={form.locale} onChange={e=>setForm({...form,locale:e.target.value})}/></label><label>Subject<input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label></div><label>Body<textarea required rows={10} value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label><label style={{display:'flex',gap:8,alignItems:'center'}}><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> Active</label><div className="form-actions"><Button type="button" onClick={()=>setModal(false)}>Cancel</Button><Button className="primary" disabled={busy}>{busy?'Creating…':'Create template'}</Button></div></form></Modal>}
 </section>
}