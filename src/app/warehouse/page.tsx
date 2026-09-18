'use client';

import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {apiMessage} from '@/lib/format';
import {API_ROUTES} from '@/lib/api-contract';
import {PageHeader,Card,Button,Loading,ErrorState,Empty,Badge,Modal} from '@/components/ui';

type Warehouse={id:number|string;code:string;name:string;city?:string;state?:string;is_active?:boolean};
type Stock={id:number|string;warehouse_id:number|string;variant_id:number|string;quantity:number;reserved_quantity?:number;available_quantity?:number;warehouse_code?:string;warehouse_name?:string};

export default function Warehouse(){
 const [warehouses,setWarehouses]=useState<Warehouse[]>([]);
 const [stock,setStock]=useState<{data:Stock[];current_page:number;last_page:number;total:number}|null>(null);
 const [warehouseId,setWarehouseId]=useState('');
 const [variantId,setVariantId]=useState('');
 const [open,setOpen]=useState(false);
 const [form,setForm]=useState({warehouse_id:'',variant_id:'',delta:'',reason:'Manual admin adjustment'});
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');

 async function loadWarehouses(){try{const r=await api<any>(API_ROUTES.warehouses.list);const d=r.data;setWarehouses(Array.isArray(d)?d:[])}catch(e){setError(apiMessage(e,'Unable to load warehouses'))}}
 async function loadInventory(){
  setLoading(true);setError('');
  try{const p=new URLSearchParams({per_page:'100'});if(warehouseId)p.set('warehouse_id',warehouseId);if(variantId)p.set('variant_id',variantId);const r=await api<any>(API_ROUTES.warehouses.inventory+'?'+p);setStock(r.data||null)}
  catch(e){setError(apiMessage(e,'Unable to load warehouse inventory'))}finally{setLoading(false)}
 }
 useEffect(()=>{loadWarehouses()},[]);
 useEffect(()=>{const t=setTimeout(loadInventory,250);return()=>clearTimeout(t)},[warehouseId,variantId]);

 function startAdjust(w?:Warehouse,s?:Stock){setForm({warehouse_id:String(w?.id||s?.warehouse_id||warehouseId||''),variant_id:String(s?.variant_id||''),delta:'',reason:'Manual admin adjustment'});setOpen(true)}
 async function adjust(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{const delta=Number(form.delta);if(!Number.isInteger(delta)||delta===0)throw new Error('Adjustment must be a non-zero whole number.');await api(API_ROUTES.warehouses.adjust,{method:'POST',body:JSON.stringify({warehouse_id:Number(form.warehouse_id),variant_id:Number(form.variant_id),delta,reason:form.reason.trim()||'Manual admin adjustment'})});setOpen(false);await loadInventory()}
  catch(e){setError(apiMessage(e,'Stock adjustment failed'))}finally{setBusy(false)}
 }

 return <section className="content">
  <PageHeader title="Warehouse & Stock" description="Warehouse-level inventory visibility and controlled stock adjustments." action={<div className="form-actions"><Button onClick={loadInventory} disabled={loading}>Refresh</Button><Button className="primary" onClick={()=>startAdjust()}>Adjust stock</Button></div>}/>
  {error&&<ErrorState error={error} onRetry={loadInventory}/>}
  <div className="section-grid">
   <Card><div className="card-title">Warehouses</div>{warehouses.length?<div className="quick">{warehouses.map(w=><div key={String(w.id)}><b>{w.name} <span className="muted">({w.code})</span></b><span><Badge>{w.is_active===false?'Inactive':'Active'}</Badge>{w.city||w.state?(' · '+[w.city,w.state].filter(Boolean).join(', ')):''}</span></div>)}</div>:<Empty title="No warehouses" text="PriyasaCore returned no warehouse records."/>}</Card>
   <Card><div className="card-title">Filters</div><div className="form-grid"><label>Warehouse<select value={warehouseId} onChange={e=>setWarehouseId(e.target.value)}><option value="">All warehouses</option>{warehouses.map(w=><option key={String(w.id)} value={String(w.id)}>{w.name} ({w.code})</option>)}</select></label><label>Variant ID<input inputMode="numeric" value={variantId} onChange={e=>setVariantId(e.target.value.replace(/\D/g,''))} placeholder="Filter by variant ID"/></label></div></Card>
  </div>
  <Card><div className="card-title">Warehouse inventory</div>{loading?<Loading/>:stock?.data?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Warehouse</th><th>Variant</th><th>On hand</th><th>Reserved</th><th>Available</th><th/></tr></thead><tbody>{stock.data.map(s=><tr key={String(s.id)}><td><b>{s.warehouse_name||s.warehouse_code||s.warehouse_id}</b></td><td>#{s.variant_id}</td><td>{s.quantity}</td><td>{s.reserved_quantity??0}</td><td>{s.available_quantity??Math.max(0,Number(s.quantity||0)-Number(s.reserved_quantity||0))}</td><td><Button onClick={()=>startAdjust(warehouses.find(w=>String(w.id)===String(s.warehouse_id)),s)}>Adjust</Button></td></tr>)}</tbody></table></div>:<Empty title="No inventory records" text="No warehouse stock matches the current filters."/>}</Card>
  {open&&<Modal title="Adjust warehouse stock" onClose={()=>setOpen(false)}><form className="form" onSubmit={adjust}><div className="form-grid"><label>Warehouse<select required value={form.warehouse_id} onChange={e=>setForm({...form,warehouse_id:e.target.value})}><option value="">Select warehouse</option>{warehouses.map(w=><option key={String(w.id)} value={String(w.id)}>{w.name} ({w.code})</option>)}</select></label><label>Variant ID<input required inputMode="numeric" value={form.variant_id} onChange={e=>setForm({...form,variant_id:e.target.value.replace(/\D/g,'')})}/></label><label>Delta<input required type="number" step="1" value={form.delta} onChange={e=>setForm({...form,delta:e.target.value})} placeholder="+10 or -5"/></label></div><label>Reason<input maxLength={100} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></label><div className="form-actions"><Button type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button className="primary" disabled={busy}>{busy?'Updating…':'Apply adjustment'}</Button></div></form></Modal>}
 </section>
}