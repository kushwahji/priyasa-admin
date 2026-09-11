'use client';
import {useEffect,useMemo,useState} from 'react';
import {api} from '@/lib/api';
import {Card,PageHeader,DataToolbar,Button,Modal,Loading,ErrorState,Badge} from '@/components/ui';
import {money,dateTime,titleCase,apiMessage} from '@/lib/format';

type ReturnRow={
 id:number|string; status?:string; reason?:string|null; note?:string|null; amount?:number|string|null; refund_amount?:number|string|null;
 created_at?:string; updated_at?:string;
 order?:{id?:number|string;order_number?:string;grand_total?:number|string;total?:number|string;currency?:string}|null;
 order_id?:number|string; order_number?:string;
 customer?:{name?:string;phone?:string;email?:string}|null;
};
const statuses=['','requested','approved','rejected','received','refunded'];
const terminalStatuses=new Set(['rejected','refunded']);
function amountOf(r:ReturnRow){return r.refund_amount??r.amount??r.order?.grand_total??r.order?.total??null}
export default function Returns(){
 const [rows,setRows]=useState<ReturnRow[]>([]),[q,setQ]=useState(''),[statusFilter,setStatusFilter]=useState(''),[selected,setSelected]=useState<ReturnRow|null>(null),[status,setStatus]=useState(''),[note,setNote]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 async function load(){setError('');setLoading(true);try{const r=await api<ReturnRow[]|{data:ReturnRow[]}>('/admin/returns');const d=r.data;setRows(Array.isArray(d)?d:(d?.data||[]))}catch(e){setError(apiMessage(e,'Unable to load returns'))}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>rows.filter(v=>{if(statusFilter&&v.status!==statusFilter)return false;return JSON.stringify(v).toLowerCase().includes(q.trim().toLowerCase())}),[rows,q,statusFilter]);
 function review(r:ReturnRow){setSelected(r);setStatus(r.status||'requested');setNote(r.note||'');setError('')}
 async function update(){
  if(!selected||!status||status===selected.status&&!note.trim())return;
  if(terminalStatuses.has(selected.status||''))return;
  if(status==='refunded'&&selected.status!=='refunded'&&!window.confirm('Mark this return as refunded? Confirm the refund has actually been processed before changing this state.'))return;
  if(status==='rejected'&&!window.confirm('Reject this return request? This decision will be recorded by Core.'))return;
  setBusy(true);setError('');
  try{await api(`/admin/returns/${selected.id}/status`,{method:'POST',body:JSON.stringify({status,note:note.trim()||undefined})});setSelected(null);setNote('');await load()}
  catch(e){setError(apiMessage(e,'Return update failed'))}finally{setBusy(false)}
 }
 return <section className="content"><PageHeader title="Returns & refunds" description="Review customer return requests and keep approval, receipt and refund state aligned with Core."/><Card>
  <DataToolbar value={q} onChange={setQ} placeholder="Search return, order, customer…"><select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s?titleCase(s):'All statuses'}</option>)}</select><Button onClick={load} disabled={loading||busy}>Refresh</Button></DataToolbar>
  {error&&!selected&&<ErrorState error={error} onRetry={load}/>} {loading?<Loading/>:filtered.length?<div className="table-wrap"><table className="table"><thead><tr><th>Return</th><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Created</th><th/></tr></thead><tbody>{filtered.map((r,i)=><tr key={String(r.id||i)}><td><b>#{r.id||'—'}</b></td><td>{r.order?.order_number||r.order_number||r.order_id||'—'}</td><td>{r.customer?.name||r.customer?.phone||'—'}</td><td>{amountOf(r)!=null?money(Number(amountOf(r)),r.order?.currency||'INR'):'—'}</td><td><Badge>{titleCase(r.status||'unknown')}</Badge></td><td>{r.created_at?dateTime(r.created_at):'—'}</td><td>{r.id&&<Button onClick={()=>review(r)}>Review</Button>}</td></tr>)}</tbody></table></div>:<div className="empty"><strong>No returns</strong><span>No return requests match the current filters.</span></div>}
 </Card>
 {selected&&<Modal title={`Return #${selected.id}`} onClose={()=>setSelected(null)}><div className="form"><div className="form-grid"><Card><div className="metric-label">Order</div><b>#{selected.order?.order_number||selected.order_number||selected.order_id||'—'}</b><div className="muted">{selected.customer?.name||'Customer'} · {selected.customer?.phone||selected.customer?.email||'—'}</div></Card><Card><div className="metric-label">Refund value</div><b>{amountOf(selected)!=null?money(Number(amountOf(selected)),selected.order?.currency||'INR'):'Not provided'}</b><div className="muted">Current state: {titleCase(selected.status||'unknown')}</div></Card></div>
  <div className="card"><div className="metric-label">Reason</div><div style={{fontSize:13,marginTop:6}}>{selected.reason||'No reason supplied.'}</div></div>
  <label>Status<select value={status} disabled={busy||terminalStatuses.has(selected.status||'')} onChange={e=>setStatus(e.target.value)}>{statuses.filter(Boolean).map(s=><option key={s} value={s}>{titleCase(s)}</option>)}</select></label>
  <label>Internal note<textarea value={note} disabled={busy} onChange={e=>setNote(e.target.value)} placeholder="QC / approval / refund processing note…"/></label>
  {terminalStatuses.has(selected.status||'')&&<div className="muted">This return is in a terminal state and cannot be changed from Admin.</div>}
  {error&&<div className="form-error">{error}</div>}
  <div className="form-actions"><Button onClick={()=>setSelected(null)} disabled={busy}>Close</Button><Button className="primary" disabled={busy||terminalStatuses.has(selected.status||'')||(status===selected.status&&!note.trim())} onClick={update}>{busy?'Saving…':'Save return state'}</Button></div>
 </div></Modal>}
 </section>
}