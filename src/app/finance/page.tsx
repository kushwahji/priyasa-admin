'use client';
import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {API_ROUTES} from '@/lib/api-contract';
import {Card,PageHeader,Button,Badge,Loading,ErrorState,Empty} from '@/components/ui';

const reports=[
  ['tax','Tax / GST'],['invoices','Invoices'],['refunds','Refunds'],['wallet','Wallet'],['loyalty','Loyalty'],['closing','Closing']
] as const;

export default function Finance(){
 const [tab,setTab]=useState<(typeof reports)[number][0]>('tax');
 const [data,setData]=useState<any>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(next=tab){
  setLoading(true);setError('');
  try{const r=await api<any>(API_ROUTES.financial[next]+'?from='+encodeURIComponent(new Date(Date.now()-29*86400000).toISOString().slice(0,10))+'&to='+encodeURIComponent(new Date().toISOString().slice(0,10)));setData(r.data??r);}
  catch(e){setError(e instanceof Error?e.message:'Unable to load financial report')}
  finally{setLoading(false)}
 }
 useEffect(()=>{load()},[tab]);
 return <section className="content">
  <PageHeader title="Financial Reports" description="Tax, invoices, refunds and settlement-oriented reporting from PriyasaCore." action={<Button onClick={()=>load()} disabled={loading}>Refresh</Button>}/>
  <div className="toolbar">{reports.map(([id,label])=><Button key={id} className={tab===id?'primary':''} onClick={()=>setTab(id)}>{label}</Button>)}</div>
  {error&&<ErrorState error={error} onRetry={()=>load()}/>}
  {loading?<Loading/>:<Card><div className="card-title">{reports.find(x=>x[0]===tab)?.[1]}</div>{Array.isArray(data)?<div className="table-wrap"><table className="table"><thead><tr>{Object.keys(data[0]||{}).slice(0,8).map(k=><th key={k}>{k.replaceAll('_',' ')}</th>)}</tr></thead><tbody>{data.slice(0,100).map((row:any,i:number)=><tr key={i}>{Object.keys(data[0]||{}).slice(0,8).map(k=><td key={k}>{typeof row[k]==='object'?JSON.stringify(row[k]):String(row[k]??'—')}</td>)}</tr>)}</tbody></table></div>:data&&typeof data==='object'?<div className="quick">{Object.entries(data).slice(0,30).map(([k,v])=><div key={k}><b>{k.replaceAll('_',' ')}</b><span>{typeof v==='object'?JSON.stringify(v):String(v??'—')}</span></div>)}</div>:<Empty title="No report data" text="PriyasaCore returned no records for this report and period."/>}</Card>}
 </section>
}
