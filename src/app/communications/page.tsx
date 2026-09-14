'use client';

import {useEffect,useMemo,useState} from 'react';
import {api} from '@/lib/api';
import {apiMessage,dateTime,titleCase} from '@/lib/format';
import {PageHeader,Card,DataToolbar,Button,Badge,Loading,ErrorState,Empty} from '@/components/ui';

type Audit={id:number|string;action:string;actor_type?:string|null;actor_id?:number|string|null;entity_type?:string|null;entity_id?:number|string|null;created_at?:string;data?:Record<string,unknown>|null};
type Page={data:Audit[];current_page:number;last_page:number;total:number};

const channels=['All','WhatsApp','FCM','Email','SMS'];
const channelOf=(a:Audit)=>{const s=`${a.action} ${a.entity_type||''} ${JSON.stringify(a.data||{})}`.toLowerCase();if(s.includes('whatsapp')||s.includes('template')||s.includes('message'))return 'WhatsApp';if(s.includes('fcm')||s.includes('push')||s.includes('notification'))return 'FCM';if(s.includes('email')||s.includes('mail'))return 'Email';if(s.includes('sms')||s.includes('otp'))return 'SMS';return 'Other'};
const failed=(a:Audit)=>/fail|error|bounce|reject|disconnect|invalid/i.test(`${a.action} ${JSON.stringify(a.data||{})}`);

export default function Communications(){
 const [items,setItems]=useState<Audit[]>([]),[q,setQ]=useState(''),[channel,setChannel]=useState('All'),[page,setPage]=useState(1),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const r=await api<{audit_logs:Page}>(`/admin/audit-logs?page=${page}&per_page=100&search=${encodeURIComponent(q)}`);setItems(r.data?.audit_logs?.data||[])}catch(e){setError(apiMessage(e,'Unable to load communication activity'))}finally{setLoading(false)}}
 useEffect(()=>{load()},[page]);
 useEffect(()=>{const t=setTimeout(()=>{setPage(1);load()},350);return()=>clearTimeout(t)},[q]);
 const scoped=useMemo(()=>items.filter(a=>{const c=channelOf(a);return (channel==='All'||c===channel)&&(!q||`${a.action} ${a.entity_type||''} ${JSON.stringify(a.data||{})}`.toLowerCase().includes(q.toLowerCase()))}),[items,q,channel]);
 const failures=scoped.filter(failed).length;
 const counts=useMemo(()=>channels.slice(1).map(c=>({channel:c,count:items.filter(a=>channelOf(a)===c).length})),[items]);
 return <section className="content"><PageHeader title="Communications Command Center" description="Unified operational visibility for WhatsApp, push, email and SMS activity. Delivery actions remain backed by PriyasaCore APIs." action={<Button onClick={load} disabled={loading}>Refresh</Button>}/>
 {error&&<ErrorState error={error} onRetry={load}/>}<div className="stats-grid">{counts.map(x=><Card key={x.channel}><div className="metric-label">{x.channel}</div><div className="metric">{x.count}</div><div className="muted">Recent events</div></Card>)}<Card><div className="metric-label">Failures / exceptions</div><div className="metric">{failures}</div><div className="muted">Current event window</div></Card></div>
 <Card><DataToolbar value={q} onChange={setQ} placeholder="Search recipient, event, template or provider…"><select className="filter-select" value={channel} onChange={e=>{setPage(1);setChannel(e.target.value)}}>{channels.map(c=><option key={c}>{c}</option>)}</select></DataToolbar>{loading?<Loading/>:scoped.length?<div className="table-wrap"><table className="table"><thead><tr><th>Channel</th><th>Event</th><th>Entity</th><th>Payload</th><th>Time</th><th>Health</th></tr></thead><tbody>{scoped.map(a=><tr key={String(a.id)}><td><Badge>{channelOf(a)}</Badge></td><td><b>{titleCase(a.action)}</b></td><td>{a.entity_type?`${titleCase(a.entity_type)} #${a.entity_id??'—'}`:'—'}</td><td><code>{JSON.stringify(a.data||{}).slice(0,220)}</code></td><td>{dateTime(a.created_at)}</td><td><Badge>{failed(a)?'Attention':'Recorded'}</Badge></td></tr>)}</tbody></table></div>:<Empty title="No communication events" text="No matching communication activity was found in the current audit window."/>}</Card>
 <Card><h2>Operator guidance</h2><p className="muted">Use WhatsApp for live customer conversations and Meta template synchronization. This command center intentionally does not fabricate send, retry, template-edit, FCM-token or email-provider endpoints when they are not exposed by PriyasaCore.</p></Card>
 </section>
}
