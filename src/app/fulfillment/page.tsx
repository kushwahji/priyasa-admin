'use client';

import {useState} from 'react';
import {api} from '@/lib/api';
import {API_ROUTES} from '@/lib/api-contract';
import {PageHeader,Card,Button,ErrorState,Empty} from '@/components/ui';

export default function Fulfilment(){
 const [orderId,setOrderId]=useState('');
 const [data,setData]=useState<any>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 async function load(){if(!orderId.trim())return;setBusy(true);setError('');try{const r=await api<any>(API_ROUTES.fulfillment.order(orderId.trim()));setData(r.data??r)}catch(e){setError(e instanceof Error?e.message:'Unable to load fulfilment data')}finally{setBusy(false)}}
 return <section className="content"><PageHeader title="Fulfilment" description="Inspect an order's allocation, pick, pack and shipment workflow from PriyasaCore."/>
 {error&&<ErrorState error={error} onRetry={load}/>}<Card><div className="card-title">Order fulfilment</div><div className="form-actions"><input aria-label="Order ID" value={orderId} onChange={e=>setOrderId(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')load()}} placeholder="Enter order ID" /><Button className="primary" onClick={load} disabled={busy||!orderId.trim()}>{busy?'Loading…':'Load order'}</Button></div>{data?<pre style={{whiteSpace:'pre-wrap',overflow:'auto',fontSize:12,marginTop:16}}>{JSON.stringify(data,null,2)}</pre>:<Empty title="Select an order" text="Enter an order ID to inspect fulfilment state and available Core operations."/>}</Card></section>
}