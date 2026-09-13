'use client';

import {useMemo,useState} from 'react';
import {CheckSquare,Power,Archive,RefreshCw} from 'lucide-react';
import {api} from '@/lib/api';
import {Button} from '@/components/ui';
import {Product} from '@/lib/types';

type Props={products:Product[];onRefresh:()=>Promise<void>|void};

export default function ProductBulkActions({products,onRefresh}:Props){
 const [selected,setSelected]=useState<string[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const ids=useMemo(()=>products.map(p=>String(p.id)),[products]);
 const all=ids.length>0&&ids.every(id=>selected.includes(id));
 function toggle(id:string){setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
 function toggleAll(){setSelected(all?[]:ids)}
 async function run(action:'published'|'draft'|'archive'){
  if(!selected.length)return;
  const label=action==='archive'?'archive':action==='published'?'publish':'move to draft';
  if(!confirm(`${label[0].toUpperCase()+label.slice(1)} ${selected.length} selected product${selected.length===1?'':'s'}?`))return;
  setBusy(true);setMessage('');
  try{
   let completed=0;
   for(const id of selected){
    if(action==='archive')await api(`/admin/catalog/products/${id}`,{method:'DELETE'});
    else await api(`/admin/catalog/products/${id}`,{method:'PUT',body:JSON.stringify({status:action})});
    completed++;
   }
   setMessage(`${completed} product${completed===1?'':'s'} updated.`);
   setSelected([]);
   await onRefresh();
  }catch(e){setMessage(e instanceof Error?e.message:'Bulk operation failed');await onRefresh()}
  finally{setBusy(false)}
 }
 if(!products.length)return null;
 return <div className="bulkbar" aria-label="Bulk product actions">
  <button type="button" className="bulkSelect" onClick={toggleAll} aria-pressed={all}><CheckSquare size={16}/>{all?'Clear all':'Select all'}</button>
  <span className="bulkCount">{selected.length} selected</span>
  <div className="bulkActions">
   <Button disabled={!selected.length||busy} onClick={()=>run('published')}><Power size={14}/> Publish</Button>
   <Button disabled={!selected.length||busy} onClick={()=>run('draft')}><RefreshCw size={14}/> Draft</Button>
   <Button disabled={!selected.length||busy} onClick={()=>run('archive')}><Archive size={14}/> Archive</Button>
  </div>
  {message&&<span className="bulkMessage" role="status">{message}</span>}
  <div className="bulkChecks">{products.map(p=><label key={String(p.id)} className="bulkCheck"><input type="checkbox" checked={selected.includes(String(p.id))} onChange={()=>toggle(String(p.id))}/><span>{p.name}</span></label>)}</div>
 </div>
}
