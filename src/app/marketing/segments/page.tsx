'use client';

import {useEffect,useState} from 'react';
import {Plus,RefreshCw,Save,Users,Eye} from 'lucide-react';
import {api} from '@/lib/api';
import {apiMessage,dateTime} from '@/lib/format';
import {Badge,Button,Card,DataToolbar,Empty,ErrorState,Loading,Modal,PageHeader} from '@/components/ui';

type Rule={field:string;operator:string;value:string|number|boolean};
type Segment={segment_id:string;name:string;logic:'AND'|'OR';rules:Rule[];is_active:boolean;created_at?:string;updated_at?:string};
const FIELDS=[
 {value:'last_order_at',label:'Last order date'},
 {value:'lifetime_value',label:'Lifetime value'},
 {value:'order_count',label:'Order count'},
 {value:'marketing_opt_in',label:'Marketing opt-in'},
];
const OPERATORS=[
 {value:'eq',label:'equals'},
 {value:'gte',label:'greater than / equal'},
 {value:'lte',label:'less than / equal'},
 {value:'before_days',label:'before N days ago'},
 {value:'after_days',label:'after N days ago'},
];
const emptyRule=():Rule=>({field:'lifetime_value',operator:'gte',value:''});

export default function MarketingSegments(){
 const[segments,setSegments]=useState<Segment[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState('');const[message,setMessage]=useState('');const[q,setQ]=useState('');const[open,setOpen]=useState(false);const[busy,setBusy]=useState(false);const[preview,setPreview]=useState<{id:string;count:number}|null>(null);const[name,setName]=useState('');const[logic,setLogic]=useState<'AND'|'OR'>('AND');const[rules,setRules]=useState<Rule[]>([emptyRule()]);
 async function load(){setLoading(true);setError('');try{const r=await api<any>('/admin/marketing/segments?per_page=100');const raw=r.data;setSegments((Array.isArray(raw)?raw:Array.isArray(raw?.data)?raw.data:[]) as Segment[])}catch(e){setError(apiMessage(e,'Unable to load customer segments.'))}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 function reset(){setName('');setLogic('AND');setRules([emptyRule()]);setMessage('');setError('');setOpen(true)}
 function patchRule(i:number,p:Partial<Rule>){setRules(v=>v.map((r,n)=>n===i?{...r,...p}:r))}
 async function create(){if(!name.trim()){setError('Segment name is required.');return}const clean=rules.filter(r=>String(r.value).trim()!=='').map(r=>({...r,value:r.field==='marketing_opt_in'?String(r.value)==='true':(r.operator.includes('days')||r.field==='order_count'||r.field==='lifetime_value'?Number(r.value):r.value)}));if(!clean.length){setError('Add at least one rule with a value.');return}setBusy(true);setError('');try{await api('/admin/marketing/segments',{method:'POST',body:JSON.stringify({name:name.trim(),logic,rules:clean,is_active:true})});setOpen(false);setMessage('Customer segment created.');await load()}catch(e){setError(apiMessage(e,'Unable to create customer segment.'))}finally{setBusy(false)}}
 async function showPreview(id:string){setBusy(true);setError('');try{const r=await api<any>(`/admin/marketing/segments/${encodeURIComponent(id)}/preview`);setPreview({id,count:Number(r.data?.count||0)})}catch(e){setError(apiMessage(e,'Unable to preview this segment.'))}finally{setBusy(false)}}
 const filtered=segments.filter(s=>!q||`${s.name} ${s.segment_id}`.toLowerCase().includes(q.toLowerCase()));
 return <section className="content"><PageHeader title="Customer Segments" description="Build reusable, backend-evaluated Priyasa Store audiences for campaigns and customer journeys." action={<div className="form-actions"><Button onClick={load} disabled={loading||busy}><RefreshCw size={14}/> Refresh</Button><Button className="primary" onClick={reset}><Plus size={14}/> New segment</Button></div>}/>{error&&<ErrorState error={error} onRetry={load}/>} {message&&<div className="form-success" role="status">{message}</div>}{loading?<Loading/>:<><div className="stats-grid"><Card><div className="metric-label">Saved segments</div><div className="metric">{segments.length}</div><div className="muted">Reusable Priyasa audiences</div></Card><Card><div className="metric-label">Evaluation</div><div className="metric">Core API</div><div className="muted">Rules are evaluated server-side</div></Card><Card><div className="metric-label">Campaign ready</div><div className="metric">{segments.filter(s=>s.is_active).length}</div><div className="muted">Active audiences</div></Card></div><Card><DataToolbar value={q} onChange={setQ} placeholder="Search segment…"/><div className="table-wrap"><table className="table"><thead><tr><th>Segment</th><th>Logic</th><th>Rules</th><th>Status</th><th>Updated</th><th/></tr></thead><tbody>{filtered.map(s=><tr key={s.segment_id}><td><b>{s.name}</b><div className="muted"><code>{s.segment_id}</code></div></td><td><Badge>{s.logic}</Badge></td><td>{s.rules?.length||0}</td><td><Badge>{s.is_active?'Active':'Paused'}</Badge></td><td>{dateTime(s.updated_at||s.created_at)}</td><td><Button onClick={()=>showPreview(s.segment_id)} disabled={busy}><Eye size={13}/> Preview audience</Button></td></tr>)}</tbody></table></div>{!filtered.length&&<Empty title="No customer segments" text="Create your first reusable audience for Priyasa Store campaigns."/>}</Card></>}{open&&<Modal title="Create customer segment" onClose={()=>!busy&&setOpen(false)}><div className="form-stack"><label>Segment name<input value={name} onChange={e=>setName(e.target.value)} placeholder="High value customers"/></label><label>Rule logic<select value={logic} onChange={e=>setLogic(e.target.value as 'AND'|'OR')}><option value="AND">All rules must match</option><option value="OR">Any rule can match</option></select></label>{rules.map((r,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.2fr 1fr auto',gap:8,alignItems:'end'}}><label>Field<select value={r.field} onChange={e=>patchRule(i,{field:e.target.value})}>{FIELDS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}</select></label><label>Operator<select value={r.operator} onChange={e=>patchRule(i,{operator:e.target.value})}>{OPERATORS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label><label>Value<input value={String(r.value)} onChange={e=>patchRule(i,{value:e.target.value})} placeholder={r.field==='marketing_opt_in'?'true / false':'Value'}/></label>{rules.length>1?<Button onClick={()=>setRules(v=>v.filter((_,n)=>n!==i))}>Remove</Button>:<span/>}</div>)}<Button onClick={()=>setRules(v=>[...v,emptyRule()])}><Plus size={13}/> Add rule</Button>{error&&<div className="form-error">{error}</div>}<div className="form-actions"><Button onClick={()=>setOpen(false)} disabled={busy}>Cancel</Button><Button className="primary" onClick={create} disabled={busy}><Save size={13}/>{busy?'Creating…':'Create segment'}</Button></div></div></Modal>}{preview&&<Modal title="Audience preview" onClose={()=>setPreview(null)}><div style={{textAlign:'center',padding:24}}><Users size={30}/><div className="metric" style={{marginTop:10}}>{preview.count.toLocaleString()}</div><p className="muted">customers currently match <code>{preview.id}</code>. This is a live Core-side count, not a client-side estimate.</p><Button onClick={()=>setPreview(null)}>Close</Button></div></Modal>}</section>;
}
