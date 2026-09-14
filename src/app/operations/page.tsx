'use client';

import {useEffect,useMemo,useState} from 'react';
import {Activity,AlertTriangle,CheckCircle2,Clock3,RefreshCw,ServerCog} from 'lucide-react';
import {api} from '@/lib/api';
import {apiMessage,dateTime,titleCase} from '@/lib/format';
import {PageHeader,Card,Button,Badge,Loading,ErrorState,Empty} from '@/components/ui';

type Audit={id:number|string;action:string;actor_type?:string|null;actor_id?:number|string|null;entity_type?:string|null;entity_id?:number|string|null;created_at?:string;data?:Record<string,unknown>|null};
type Page={data:Audit[];current_page:number;last_page:number;total:number};

const isFailure=(x:Audit)=>/fail|error|exception|timeout|disconnect|blocked|conflict/i.test(`${x.action} ${x.entity_type||''} ${JSON.stringify(x.data||{})}`);
const domain=(x:Audit)=>{const s=`${x.action} ${x.entity_type||''} ${JSON.stringify(x.data||{})}`.toLowerCase();if(s.includes('inventory')||s.includes('stock')||s.includes('reservation'))return 'Inventory';if(s.includes('order')||s.includes('payment'))return 'Orders';if(s.includes('shipment')||s.includes('shipping')||s.includes('ndr'))return 'Fulfillment';if(s.includes('whatsapp')||s.includes('fcm')||s.includes('email')||s.includes('notification'))return 'Communications';if(s.includes('bulk')||s.includes('job')||s.includes('queue'))return 'Jobs';return 'Platform'};

export default function Operations(){
 const [items,setItems]=useState<Audit[]>([]),[q,setQ]=useState(''),[domainFilter,setDomainFilter]=useState('All'),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const r=await api<{audit_logs:Page}>('/admin/audit-logs?page=1&per_page=100');setItems(r.data?.audit_logs?.data||[])}catch(e){setError(apiMessage(e,'Unable to load operational telemetry'))}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>items.filter(x=>(domainFilter==='All'||domain(x)===domainFilter)&&(!q||`${x.action} ${x.entity_type||''} ${JSON.stringify(x.data||{})}`.toLowerCase().includes(q.toLowerCase()))),[items,q,domainFilter]);
 const failures=items.filter(isFailure).length;const healthy=Math.max(items.length-failures,0);const domains=['All','Platform','Orders','Inventory','Fulfillment','Communications','Jobs'];
 return <section className="content"><PageHeader title="Operations Reliability" description="Operational telemetry and exception visibility from the PriyasaCore administrative event stream." action={<Button onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</Button>}/>
 {error&&<ErrorState error={error} onRetry={load}/>}<div className="stats-grid"><Card><div className="metric-label">Events observed</div><div className="metric">{items.length}</div><div className="muted">Current telemetry window</div></Card><Card><div className="metric-label">Healthy events</div><div className="metric">{healthy}</div><div className="muted"><CheckCircle2 size={14}/> Recorded without exception signal</div></Card><Card><div className="metric-label">Exceptions</div><div className="metric">{failures}</div><div className="muted"><AlertTriangle size={14}/> Requires investigation</div></Card><Card><div className="metric-label">Domains</div><div className="metric">{new Set(items.map(domain)).size}</div><div className="muted"><Activity size={14}/> Active operational areas</div></Card></div>
 <Card><div className="toolbar"><div className="searchbox"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search events, entities, jobs or references…"/></div><select value={domainFilter} onChange={e=>setDomainFilter(e.target.value)}>{domains.map(d=><option key={d}>{d}</option>)}</select><Badge>{filtered.length} events</Badge></div>{loading?<Loading/>:filtered.length?<div className="table-wrap"><table className="table"><thead><tr><th>Domain</th><th>Event</th><th>Entity</th><th>Details</th><th>Time</th><th>Health</th></tr></thead><tbody>{filtered.map(x=><tr key={String(x.id)}><td><Badge>{domain(x)}</Badge></td><td><b>{titleCase(x.action)}</b></td><td>{x.entity_type?`${titleCase(x.entity_type)} #${x.entity_id??'—'}`:'System'}</td><td><code>{JSON.stringify(x.data||{}).slice(0,220)}</code></td><td>{dateTime(x.created_at)}</td><td><Badge>{isFailure(x)?'Exception':'Observed'}</Badge></td></tr>)}</tbody></table></div>:<Empty title="No operational events" text="No telemetry matches the current filters."/>}</Card>
 <div className="grid"><Card><div className="section-head"><div><h2><ServerCog size={18}/> Reliability boundary</h2><p>Core-owned health and execution</p></div></div><p className="muted">The Admin UI does not claim a subsystem is healthy merely because the dashboard loaded. Reliability status is derived from actual backend events, while provider secrets, queues and workers remain server-side.</p></Card><Card><div className="section-head"><div><h2><Clock3 size={18}/> Operational workflow</h2><p>Detect → inspect → resolve → audit</p></div></div><p className="muted">Use Orders, Inventory, Shipping, Communications and API Operations for domain-specific remediation. Changes continue through authenticated PriyasaCore endpoints.</p></Card></div>
 </section>
}
