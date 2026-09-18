'use client';
import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {API_ROUTES} from '@/lib/api-contract';
import {apiMessage,dateTime} from '@/lib/format';
import {Card,PageHeader,DataToolbar,Modal,Button,Badge,Loading,ErrorState,Empty} from '@/components/ui';
type EventItem={id:number|string;event?:string;type?:string;status?:string;source?:string;created_at?:string;payload?:unknown};
type List={data:EventItem[];current_page:number;last_page:number;total:number};
export default function Events(){
 const [list,setList]=useState<List|null>(null),[q,setQ]=useState(''),[detail,setDetail]=useState<EventItem|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const p=new URLSearchParams({per_page:'50'});if(q)p.set('search',q);const r=await api<List>(API_ROUTES.events.list+'?'+p);setList(r.data||null)}catch(e){setError(apiMessage(e,'Unable to load events'))}finally{setLoading(false)}}
 async function open(id:EventItem['id']){try{const r=await api<EventItem>(API_ROUTES.events.detail(id));setDetail(r.data||null)}catch(e){setError(apiMessage(e,'Unable to load event'))}}
 useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[q]);
 return <section className="content"><PageHeader title="Commerce Events" description="Inspect durable commerce events used by automation, operations and integrations." action={<Button onClick={load} disabled={loading}>Refresh</Button>}/>{error&&<ErrorState error={error} onRetry={load}/>}<Card><DataToolbar value={q} onChange={setQ} placeholder="Search event type or source…"/></Card><Card>{loading?<Loading/>:list?.data?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Event</th><th>Source</th><th>Status</th><th>Created</th><th/></tr></thead><tbody>{list.data.map(e=><tr key={String(e.id)}><td><b>{e.event||e.type||'event'}</b><div className="muted">#{e.id}</div></td><td>{e.source||'—'}</td><td><Badge>{e.status||'received'}</Badge></td><td>{dateTime(e.created_at)}</td><td><Button onClick={()=>open(e.id)}>Inspect</Button></td></tr>)}</tbody></table></div>:<Empty title="No events" text="No commerce events match the current search."/>}</Card>{detail&&<Modal title={'Event #'+detail.id} onClose={()=>setDetail(null)}><div className="quick"><div><b>Type</b><span>{detail.event||detail.type||'—'}</span></div><div><b>Source</b><span>{detail.source||'—'}</span></div><div><b>Status</b><span><Badge>{detail.status||'received'}</Badge></span></div></div><pre style={{whiteSpace:'pre-wrap',overflow:'auto',fontSize:12,marginTop:16}}>{JSON.stringify(detail.payload||detail,null,2)}</pre></Modal>}</section>
}