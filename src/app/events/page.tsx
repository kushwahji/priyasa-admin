'use client';

import {useEffect,useState} from 'react';
import {Activity,RefreshCw,Send,Zap} from 'lucide-react';
import {api} from '@/lib/api';
import {apiMessage,dateTime} from '@/lib/format';
import {Badge,Button,Card,ErrorState,Loading,PageHeader} from '@/components/ui';

type EventRow={event_id:string;event:string;entity_type:string;entity_id:string|null;customer_id:number|string|null;status:string;occurred_at:string;created_at:string};
const eventTypes=['order.created','order.paid','cart.updated','cart.abandoned','shipment.created','shipment.delivered','return.created','customer.created','customer.updated'];

export default function EventsPage(){
 const [rows,setRows]=useState<EventRow[]>([]); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 const [form,setForm]=useState({event:'order.created',entity_type:'order',entity_id:'',customer_id:'',payload:'{}'});
 async function load(){setLoading(true);setError('');try{const r=await api<any>('/admin/events?per_page=100');setRows(r.data?.data||[])}catch(e){setError(apiMessage(e,'Unable to load commerce events'))}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function publish(){setBusy(true);setError('');try{let payload={};try{payload=JSON.parse(form.payload||'{}')}catch{setError('Payload must be valid JSON.');setBusy(false);return}
  await api('/admin/events',{method:'POST',body:JSON.stringify({event:form.event,entity_type:form.entity_type,entity_id:form.entity_id||null,customer_id:form.customer_id?Number(form.customer_id):null,payload})});
  setForm({...form,entity_id:'',customer_id:'',payload:'{}'});await load();
 }catch(e){setError(apiMessage(e,'Event was rejected; nothing was published.'))}finally{setBusy(false)}}
 return <section className="content">
  <PageHeader title="Commerce Event Bus" description="Publish and inspect canonical commerce events that feed automation, notifications, attribution and customer journeys." action={<Button onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</Button>}/>
  {error&&<ErrorState error={error} onRetry={load}/>} 
  <div className="stats-grid"><Card><div className="metric-label">Events loaded</div><div className="metric">{rows.length}</div><div className="muted">Recent event ledger</div></Card><Card><div className="metric-label">Event-driven</div><div className="metric">{rows.filter(r=>r.status==='accepted').length}</div><div className="muted">Accepted by Core</div></Card><Card><div className="metric-label">Automation source</div><div className="metric"><Zap size={22}/></div><div className="muted">Ready for orchestration</div></Card></div>
  <Card><h2 style={{marginTop:0}}>Publish event</h2><p className="muted">Use this for controlled admin testing. Production services should publish domain events server-side.</p><div className="form-grid"><label>Event<select value={form.event} onChange={e=>setForm({...form,event:e.target.value})}>{eventTypes.map(x=><option key={x}>{x}</option>)}</select></label><label>Entity type<input value={form.entity_type} onChange={e=>setForm({...form,entity_type:e.target.value})}/></label><label>Entity ID<input value={form.entity_id} onChange={e=>setForm({...form,entity_id:e.target.value})} placeholder="ORD-10025"/></label><label>Customer ID<input value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})}/></label></div><label>Payload JSON<textarea rows={7} value={form.payload} onChange={e=>setForm({...form,payload:e.target.value})}/></label><div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}><Button className="primary" onClick={publish} disabled={busy}><Send size={15}/>{busy?'Publishing…':'Publish event'}</Button></div></Card>
  <Card><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}><Activity size={19}/><div><h2 style={{margin:0}}>Recent events</h2><p className="muted" style={{margin:'4px 0 0'}}>Accepted events available for downstream automation.</p></div></div><div className="table-wrap"><table className="table"><thead><tr><th>Event</th><th>Entity</th><th>Customer</th><th>Status</th><th>Occurred</th></tr></thead><tbody>{rows.map(r=><tr key={r.event_id}><td><b>{r.event}</b><div className="muted"><code>{r.event_id}</code></div></td><td>{r.entity_type}{r.entity_id?` · ${r.entity_id}`:''}</td><td>{r.customer_id??'—'}</td><td><Badge>{r.status}</Badge></td><td>{dateTime(r.occurred_at||r.created_at)}</td></tr>)}</tbody></table></div>{!rows.length&&!loading&&<div className="empty">No commerce events have been recorded yet.</div>}</Card>
  {loading&&!error&&<Loading/>}
 </section>
}
