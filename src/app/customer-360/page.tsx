'use client';
import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {API_ROUTES} from '@/lib/api-contract';
import {apiMessage,dateTime} from '@/lib/format';
import {Card,PageHeader,DataToolbar,Modal,Button,Badge,Loading,ErrorState,Empty} from '@/components/ui';

type Customer={id:number|string;name?:string;phone?:string;email?:string;status?:string;orders_count?:number;total_spend?:number;tags?:Array<{id:number|string;name?:string}>;notes?:Array<{id:number|string;note?:string;created_at?:string}>;consents?:Record<string,unknown>;segments?:unknown[]};
type List={data:Customer[];current_page:number;last_page:number;total:number};

export default function Customer360(){
 const [list,setList]=useState<List|null>(null),[q,setQ]=useState(''),[detail,setDetail]=useState<Customer|null>(null);
 const [note,setNote]=useState(''),[tag,setTag]=useState(''),[segment,setSegment]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const p=new URLSearchParams({per_page:'50'});if(q)p.set('search',q);const r=await api<List>(API_ROUTES.customer360.dashboard+'?'+p);setList(r.data||null)}catch(e){setError(apiMessage(e,'Unable to load customer 360'))}finally{setLoading(false)}}
 async function open(id:Customer['id']){setError('');try{const r=await api<Customer>(API_ROUTES.customer360.profile(id));setDetail(r.data||null)}catch(e){setError(apiMessage(e,'Unable to load customer profile'))}}
 async function mutate(path:string,method:string,body:unknown){if(!detail)return;setBusy(true);setError('');try{const r=await api<Customer>(path,{method,body:JSON.stringify(body)});if(r.data)setDetail(r.data);else await open(detail.id);await load()}catch(e){setError(apiMessage(e,'Customer update failed'))}finally{setBusy(false)}}
 useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[q]);
 return <section className="content"><PageHeader title="Customer 360" description="Unified customer profile, lifecycle signals, consent, tags, notes and segmentation." action={<Button onClick={load} disabled={loading}>Refresh</Button>}/>{error&&<ErrorState error={error} onRetry={load}/>}
 <Card><DataToolbar value={q} onChange={setQ} placeholder="Search customer, phone or email…"/></Card>
 <Card>{loading?<Loading/>:list?.data?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Customer</th><th>Contact</th><th>Orders</th><th>Spend</th><th>Status</th><th/></tr></thead><tbody>{list.data.map(c=><tr key={String(c.id)}><td><b>{c.name||'Customer #'+c.id}</b><div className="muted">#{c.id}</div></td><td>{c.phone||c.email||'—'}</td><td>{c.orders_count??'—'}</td><td>₹{Number(c.total_spend||0).toLocaleString('en-IN')}</td><td><Badge>{c.status||'active'}</Badge></td><td><Button onClick={()=>open(c.id)}>Open 360</Button></td></tr>)}</tbody></table></div>:<Empty title="No customers found" text="Try a phone number, email address or customer name."/>}</Card>
 {detail&&<Modal title={detail.name||'Customer 360'} onClose={()=>setDetail(null)}><div className="detail-stack">
 <Card><div className="card-title">Profile</div><div className="quick"><div><b>Customer ID</b><span>#{detail.id}</span></div><div><b>Phone</b><span>{detail.phone||'—'}</span></div><div><b>Email</b><span>{detail.email||'—'}</span></div><div><b>Orders / spend</b><span>{detail.orders_count??'—'} · ₹{Number(detail.total_spend||0).toLocaleString('en-IN')}</span></div></div></Card>
 <Card><div className="card-title">Tags</div><div className="form-actions"><input value={tag} onChange={e=>setTag(e.target.value)} placeholder="VIP, repeat-buyer…"/><Button className="primary" disabled={busy||!tag.trim()} onClick={()=>{mutate(API_ROUTES.customer360.tag(detail.id),'POST',{tag:tag.trim()});setTag('')}}>Add tag</Button></div><div className="quick">{(detail.tags||[]).map(t=><div key={String(t.id)}><b>{t.name||t.id}</b><Button disabled={busy} onClick={()=>mutate(API_ROUTES.customer360.removeTag(detail.id,t.id),'DELETE',{})}>Remove</Button></div>)}</div></Card>
 <Card><div className="card-title">Notes</div><div className="form-actions"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add an internal note…"/><Button className="primary" disabled={busy||!note.trim()} onClick={()=>{mutate(API_ROUTES.customer360.note(detail.id),'POST',{note:note.trim()});setNote('')}}>Add note</Button></div>{detail.notes?.length?<div className="quick">{detail.notes.map(n=><div key={String(n.id)}><b>{dateTime(n.created_at)}</b><span>{n.note||'—'}</span></div>)}</div>:<div className="empty">No notes.</div>}</Card>
 <Card><div className="card-title">Consent & segmentation</div><div className="form-grid"><label>Marketing consent<select defaultValue="" disabled={busy} onChange={e=>mutate(API_ROUTES.customer360.consent(detail.id),'PUT',{marketing_opt_in:e.target.value==='true'})}><option value="">No change</option><option value="true">Opt in</option><option value="false">Opt out</option></select></label><label>Segment<input value={segment} onChange={e=>setSegment(e.target.value)} placeholder="Segment ID"/><Button disabled={busy||!segment.trim()} onClick={()=>{mutate(API_ROUTES.customer360.segment(detail.id),'POST',{segment_id:segment.trim()});setSegment('')}}>Assign</Button></label></div></Card>
 </div></Modal>}
 </section>
}