'use client';
import {useEffect,useState} from 'react';
import {RefreshCw} from 'lucide-react';
import {api} from '@/lib/api';
import {PageHeader,Card,Button,Loading,ErrorState,Empty,Badge} from '@/components/ui';

function rows(value:unknown):Array<Record<string,unknown>>{
  if(Array.isArray(value)) return value.filter(x=>x&&typeof x==='object') as Array<Record<string,unknown>>;
  if(value&&typeof value==='object'){
    const o=value as Record<string,unknown>;
    for(const k of ['data','items','results','records','campaigns','tickets','events','warehouses']) if(Array.isArray(o[k])) return o[k].filter(x=>x&&typeof x==='object') as Array<Record<string,unknown>>;
  }
  return [];
}
function scalarEntries(value:unknown){if(!value||typeof value!=='object'||Array.isArray(value))return [];return Object.entries(value as Record<string,unknown>).filter(([,v])=>v===null||['string','number','boolean'].includes(typeof v)).slice(0,12)}
export function ApiWorkspace({title,description,endpoint}:{title:string;description:string;endpoint:string}){
 const [data,setData]=useState<unknown>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const r=await api<any>(endpoint);setData(r?.data??r)}catch(e){setError(e instanceof Error?e.message:'Unable to load API data')}finally{setLoading(false)}}
 useEffect(()=>{load()},[endpoint]);
 const list=rows(data); const scalars=scalarEntries(data);
 return <section className="content"><PageHeader title={title} description={description} action={<Button onClick={load} disabled={loading}><RefreshCw size={14}/>{loading?'Refreshing…':'Refresh'}</Button>}/>{error?<ErrorState error={error} onRetry={load}/>:loading?<Loading/>:<>
  {scalars.length>0&&<div className="grid">{scalars.map(([k,v])=><Card key={k}><div className="metric-label">{k.replaceAll('_',' ')}</div><div className="metric" style={{fontSize:22}}>{String(v??'—')}</div></Card>)}</div>}
  {list.length>0?<Card><div className="table-wrap"><table className="table"><thead><tr>{Object.keys(list[0]).filter(k=>!['created_at','updated_at'].includes(k)).slice(0,8).map(k=><th key={k}>{k.replaceAll('_',' ')}</th>)}</tr></thead><tbody>{list.slice(0,50).map((row,i)=><tr key={String(row.id??row.key??i)}>{Object.keys(list[0]).filter(k=>!['created_at','updated_at'].includes(k)).slice(0,8).map(k=><td key={k}>{typeof row[k]==='object'?JSON.stringify(row[k]):String(row[k]??'—')}</td>)}</tr>)}</tbody></table></div></Card>:!scalars.length?<Empty title="No records returned" text={endpoint}/>:null}
 </>}</section>
}