'use client';

import {FormEvent,useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Check,Copy,Grid3X3,RefreshCw,Save,Trash2} from 'lucide-react';
import {useParams} from 'next/navigation';
import {api} from '@/lib/api';
import {apiMessage} from '@/lib/format';
import {Product,Variant} from '@/lib/types';
import {Badge,Button,Card,ErrorState,Loading,PageHeader} from '@/components/ui';

type Row={key:string;color:string;size:string;sku:string;barcode:string;price:string;mrp:string;quantity:string;weight_grams:string;gst_rate:string;hsn:string;image_url:string;attributes:string;is_active:boolean};

const split=(v:string)=>v.split(/[,\n]+/).map(x=>x.trim()).filter(Boolean);
const slug=(v:string)=>v.toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'');
const money=(v:string)=>v===''?'—':`₹ ${Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;

export default function VariantMatrix(){
 const params=useParams<{id:string}>();
 const [product,setProduct]=useState<Product|null>(null);
 const [colors,setColors]=useState('Black, White');
 const [sizes,setSizes]=useState('XS, S, M, L, XL');
 const [skuPrefix,setSkuPrefix]=useState('');
 const [defaultPrice,setDefaultPrice]=useState('');
 const [defaultMrp,setDefaultMrp]=useState('');
 const [defaultStock,setDefaultStock]=useState('0');
 const [gstRate,setGstRate]=useState('5');
 const [hsn,setHsn]=useState('');
 const [imageMap,setImageMap]=useState('');
 const [rows,setRows]=useState<Row[]>([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');

 async function load(){setLoading(true);setError('');try{const r=await api<Product>(`/admin/catalog/products/${params.id}`);const p=r.data||null;setProduct(p);if(p){setSkuPrefix(p.sku||slug(p.name).slice(0,12));setDefaultPrice(p.price==null?'':String(p.price));setDefaultMrp(p.mrp==null?'':String(p.mrp));}}catch(e){setError(apiMessage(e,'Unable to load product'))}finally{setLoading(false)}}
 useEffect(()=>{if(params.id)load()},[params.id]);

 const existing=useMemo(()=>new Set((product?.variants||[]).map(v=>`${String(v.color||'').toLowerCase()}|${String(v.size||'').toLowerCase()}`)),[product]);
 const imageByColor=useMemo(()=>{const m=new Map<string,string>();for(const part of imageMap.split(/\n/)){const i=part.indexOf('=');if(i>0)m.set(part.slice(0,i).trim().toLowerCase(),part.slice(i+1).trim())}return m},[imageMap]);

 function generate(){
   setError('');setMessage('');
   const cs=split(colors),ss=split(sizes);if(!cs.length||!ss.length){setError('Add at least one colour and one size.');return}
   const prefix=slug(skuPrefix||product?.sku||product?.name||'SKU');
   const oldByKey=new Map((product?.variants||[]).map(v=>[`${String(v.color||'').toLowerCase()}|${String(v.size||'').toLowerCase()}`,v]));
   const generated:Row[]=[];
   for(const color of cs)for(const size of ss){
     const key=`${color.toLowerCase()}|${size.toLowerCase()}`;const old=oldByKey.get(key);
     generated.push({key,color,size,sku:old?.sku||`${prefix}-${slug(color)}-${slug(size)}`,barcode:old?.barcode||'',price:old?.price!=null?String(old.price):defaultPrice,mrp:old?.mrp!=null?String(old.mrp):defaultMrp,quantity:old?.inventory?.quantity!=null?String(old.inventory.quantity):defaultStock,weight_grams:old?.weight_grams!=null?String(old.weight_grams):'',gst_rate:String((old?.attributes as any)?.gst_rate??gstRate),hsn:String((old?.attributes as any)?.hsn??hsn),image_url:old?.image_url||imageByColor.get(color.toLowerCase())||'',attributes:JSON.stringify(old?.attributes||{},null,0),is_active:old?.is_active!==false});
   }
   setRows(generated);setMessage(`${generated.length} combinations generated. Existing colour/size variants were prefilled for safe review.`);
 }
 function update(i:number,key:keyof Row,value:string|boolean){setRows(r=>r.map((x,n)=>n===i?{...x,[key]:value}:x))}
 function duplicate(i:number){const r=rows[i];setRows(x=>[...x.slice(0,i+1),{...r,key:`${r.key}-${Date.now()}`,sku:`${r.sku}-COPY`},...x.slice(i+1)])}
 function remove(i:number){setRows(x=>x.filter((_,n)=>n!==i))}

 async function save(e:FormEvent){e.preventDefault();if(!rows.length)return;setBusy(true);setError('');setMessage('');try{
   const seen=new Set<string>();
   for(const row of rows){
     if(!row.sku.trim())throw new Error(`Missing SKU for ${row.color} / ${row.size}.`);
     const unique=row.sku.trim().toLowerCase();if(seen.has(unique))throw new Error(`Duplicate SKU in matrix: ${row.sku}`);seen.add(unique);
     let attributes:any={};try{attributes=row.attributes.trim()?JSON.parse(row.attributes):{}}catch{throw new Error(`Invalid attributes JSON for ${row.sku}.`)}
     attributes.gst_rate=row.gst_rate===''?null:Number(row.gst_rate);attributes.hsn=row.hsn.trim()||null;
     const body={sku:row.sku.trim(),barcode:row.barcode.trim()||null,size:row.size||null,color:row.color||null,price:row.price===''?null:Number(row.price),mrp:row.mrp===''?null:Number(row.mrp),weight_grams:row.weight_grams===''?null:Number(row.weight_grams),image_url:row.image_url.trim()||null,quantity:Number(row.quantity||0),low_stock_threshold:3,is_active:row.is_active,attributes};
     const current=(product?.variants||[]).find(v=>String(v.sku||'').toLowerCase()===unique);
     await api(`/admin/catalog/products/${params.id}/variants${current?`/${current.id}`:''}`,{method:current?'PUT':'POST',body:JSON.stringify(body)});
   }
   setMessage(`${rows.length} variants saved successfully.`);await load();
 }catch(e){setError(apiMessage(e,'Variant matrix save failed'))}finally{setBusy(false)}}

 if(loading)return <section className="content"><Loading/></section>;
 return <section className="content">
   <div className="form-actions" style={{justifyContent:'flex-start',marginBottom:10}}><Link href={`/products/${params.id}`}><Button><ArrowLeft size={14}/> Product</Button></Link></div>
   <PageHeader title="Variant Matrix" description={product?`${product.name} · Color × Size generator with safe review before save.`:'Generate sellable SKU combinations.'} action={<Button onClick={load}><RefreshCw size={14}/> Refresh</Button>}/>
   {error&&<ErrorState error={error} onRetry={load}/>} {message&&<div className="status green" style={{marginBottom:14}}>{message}</div>}
   <div className="section-grid">
    <Card><div className="section-head"><div><h2>Generate combinations</h2><p>Enter reusable attributes once. The matrix creates every colour × size combination and preserves existing SKU data when matched.</p></div></div>
      <div className="form-grid">
       <label>Colours<textarea rows={3} value={colors} onChange={e=>setColors(e.target.value)} placeholder="Black, White, Navy"/></label>
       <label>Sizes<textarea rows={3} value={sizes} onChange={e=>setSizes(e.target.value)} placeholder="XS, S, M, L, XL"/></label>
       <label>SKU prefix<input value={skuPrefix} onChange={e=>setSkuPrefix(e.target.value)} placeholder="PRY-SHIRT"/></label>
       <label>Default selling price (₹)<input type="number" min="0" step="0.01" value={defaultPrice} onChange={e=>setDefaultPrice(e.target.value)}/></label>
       <label>Default MRP (₹)<input type="number" min="0" step="0.01" value={defaultMrp} onChange={e=>setDefaultMrp(e.target.value)}/></label>
       <label>Opening stock<input type="number" min="0" step="1" value={defaultStock} onChange={e=>setDefaultStock(e.target.value)}/></label>
       <label>GST rate (%)<input type="number" min="0" step="0.01" value={gstRate} onChange={e=>setGstRate(e.target.value)}/></label>
       <label>HSN / SAC<input value={hsn} onChange={e=>setHsn(e.target.value)} placeholder="6109"/></label>
      </div>
      <label>Colour image map <span className="muted">one per line: Colour = image URL</span><textarea rows={4} value={imageMap} onChange={e=>setImageMap(e.target.value)} placeholder={'Black = https://.../black.jpg\nWhite = https://.../white.jpg'}/></label>
      <div className="form-actions" style={{marginTop:14}}><Button className="primary" onClick={generate}><Grid3X3 size={15}/> Generate Variant Matrix</Button></div>
    </Card>
    <Card><div className="section-head"><div><h2>Safety checks</h2><p>Review before writing to Core.</p></div></div><div className="detail-list"><div><span>Existing variants</span><b>{product?.variants?.length||0}</b></div><div><span>Generated rows</span><b>{rows.length}</b></div><div><span>Combination source</span><b>Colour × Size</b></div><div><span>SKU rule</span><b>{slug(skuPrefix||product?.sku||product?.name||'SKU')}-COLOUR-SIZE</b></div></div></Card>
   </div>
   <div style={{marginTop:15}}><Card><div className="section-head"><div><h2>Review & save</h2><p>Edit any SKU, price, stock, tax or media value before saving. Existing SKUs are updated; new SKUs are created.</p></div><Badge>{rows.length} rows</Badge></div>
    {!rows.length?<div className="empty"><strong>No matrix generated</strong><span>Choose colours and sizes above, then generate the combinations.</span></div>:<div className="table-wrap"><table className="table"><thead><tr><th>Active</th><th>Colour / Size</th><th>SKU</th><th>Barcode</th><th>Price</th><th>MRP</th><th>Stock</th><th>GST</th><th>HSN</th><th>Image</th><th/></tr></thead><tbody>{rows.map((r,i)=><tr key={r.key}>
      <td><input type="checkbox" checked={r.is_active} onChange={e=>update(i,'is_active',e.target.checked)}/></td>
      <td><b>{r.color}</b><div className="muted">{r.size}</div></td>
      <td><input value={r.sku} onChange={e=>update(i,'sku',e.target.value)}/></td>
      <td><input value={r.barcode} onChange={e=>update(i,'barcode',e.target.value)}/></td>
      <td><input type="number" min="0" step="0.01" value={r.price} onChange={e=>update(i,'price',e.target.value)} placeholder={money(defaultPrice)}/></td>
      <td><input type="number" min="0" step="0.01" value={r.mrp} onChange={e=>update(i,'mrp',e.target.value)} placeholder={money(defaultMrp)}/></td>
      <td><input type="number" min="0" step="1" value={r.quantity} onChange={e=>update(i,'quantity',e.target.value)}/></td>
      <td><input type="number" min="0" step="0.01" value={r.gst_rate} onChange={e=>update(i,'gst_rate',e.target.value)}/></td>
      <td><input value={r.hsn} onChange={e=>update(i,'hsn',e.target.value)}/></td>
      <td><input value={r.image_url} onChange={e=>update(i,'image_url',e.target.value)} placeholder="https://…"/></td>
      <td><div className="form-actions"><Button type="button" onClick={()=>duplicate(i)} title="Duplicate"><Copy size={13}/></Button><Button type="button" onClick={()=>remove(i)} title="Remove"><Trash2 size={13}/></Button></div></td>
    </tr>)}</tbody></table></div>}
    {rows.length>0&&<div className="form-actions" style={{marginTop:14,justifyContent:'flex-end'}}><Button className="primary" disabled={busy} onClick={save}><Save size={14}/>{busy?`Saving ${rows.length} variants…`:'Save Variant Matrix'}</Button></div>}
   </Card></div>
 </section>
}
