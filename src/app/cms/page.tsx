'use client';

import {useEffect,useMemo,useState} from 'react';
import {ArrowDown,ArrowUp,ImagePlus,Plus,RefreshCw,Save,Trash2,ExternalLink,Eye} from 'lucide-react';
import {api} from '@/lib/api';
import {apiMessage} from '@/lib/format';
import {PageHeader,Card,Modal,Button,Badge,Loading,ErrorState,Empty} from '@/components/ui';

type Section={id:number|string;key:string;type:string;title?:string|null;subtitle?:string|null;image_url?:string|null;cta_label?:string|null;cta_href?:string|null;content?:Record<string,any>|null;payload?:Record<string,any>|null;sort_order:number;is_active:boolean;starts_at?:string|null;ends_at?:string|null;updated_at?:string};
type List={data:Section[];current_page:number;last_page:number};
type Form={key:string;type:string;title:string;subtitle:string;image_url:string;cta_label:string;cta_href:string;content:string;sort_order:number;is_active:boolean;starts_at:string;ends_at:string};
type Slide={image_url:string;mobile_image_url?:string;title?:string;highlight?:string;subtitle?:string;cta?:{label?:string;href?:string};overlay_opacity?:number;position?:string};

const BLOCKS=[
 ['home-hero','Hero slider','hero_slider'],['home-promises','Service strip','service_strip'],['home-categories','Category tiles','category_tiles'],
 ['home-new-arrivals','New arrivals','product_carousel'],['home-editorial','Editorial grid','editorial_grid'],['home-flash-sale','Flash sale','flash_sale'],
 ['home-offer-banner','Offer banner','offer_banner'],['home-trending','Trending now','product_carousel'],['home-best-sellers','Best sellers','product_carousel'],
 ['home-brands','Brand carousel','brand_carousel'],['home-all-products','Product grid','product_grid'],['home-review-carousel','Review carousel','review_carousel'],['home-recommendations','Recommendations','personalized_products']
] as const;

const defaults:Record<string,any>={
 'hero_slider':{autoplay:true,interval_ms:4500,items:[]},
 'service_strip':{items:[{icon:'truck',title:'Free Shipping',text:'On eligible orders'},{icon:'refresh',title:'Easy Returns',text:'7-day returns'},{icon:'shield',title:'Secure Payments',text:'100% secure checkout'}]},
 'category_tiles':{layout:{desktop_columns:6,tablet_columns:4,mobile_columns:3,mobile_scroll:true},items:[]},
 'editorial_grid':{layout:{desktop_columns:3,tablet_columns:3,mobile_columns:2},items:[]},
 'offer_banner':{eyebrow:'LIMITED TIME OFFER',title:'FESTIVE OFFERS',subtitle:'Find your celebration-ready look.',image_url:null,mobile_image_url:null,cta:{label:'Shop Sale',href:'/sale'}},
 'product_carousel':{query:{mode:'dynamic',source:'products',sort:'newest',limit:12,filters:{in_stock:true}},display:{desktop_columns:4,tablet_columns:3,mobile_cards:2,mobile_scroll:true,show_wishlist:true,show_rating:true,show_discount:true,show_mrp:true},cta:{label:'View All',href:'/shop'}},
 'flash_sale':{query:{mode:'dynamic',source:'products',sort:'discount',limit:12,filters:{in_stock:true,sale_only:true}},sale:{starts_at:null,ends_at:null,show_countdown:true},display:{mobile_scroll:true,show_discount:true,show_mrp:true,show_stock_progress:true},cta:{label:'View All Deals',href:'/sale'}},
 'product_grid':{query:{mode:'dynamic',source:'products',sort:'recommended',limit:30,filters:{in_stock:true}},display:{desktop_columns:5,tablet_columns:4,mobile_columns:2,load_more:true,load_more_step:12,show_wishlist:true,show_rating:true,show_discount:true,show_mrp:true}},
 'brand_carousel':{source:'featured_brands',limit:12,display:{desktop_columns:6,tablet_columns:4,mobile_cards:3,mobile_scroll:true,show_name:true}},
 'review_carousel':{source:'product_reviews',limit:10,display:{show_rating:true,show_customer:true,show_product:true,show_product_image:true,mobile_scroll:true}},
 'personalized_products':{query:{mode:'personalized',strategy:'hybrid',limit:12,fallback_sort:'popular'}}
};

const blank:Form={key:'home-offer-banner',type:'offer_banner',title:'',subtitle:'',image_url:'',cta_label:'Shop Now',cta_href:'/',content:'{}',sort_order:70,is_active:true,starts_at:'',ends_at:''};

function pretty(value:any){return JSON.stringify(value??{},null,2)}
function parse(value:string){try{return JSON.parse(value||'{}')}catch{throw new Error('Content JSON must be valid JSON.')}}
function normalizeSections(value:any):List{const root=value?.data && !Array.isArray(value.data)?value.data:value;const rows=Array.isArray(root)?root:(Array.isArray(root?.data)?root.data:(Array.isArray(root?.items)?root.items:[]));return {data:rows,current_page:Number(root?.current_page||1),last_page:Number(root?.last_page||1)}}

export default function Cms(){
 const [list,setList]=useState<List|null>(null),[q,setQ]=useState(''),[editing,setEditing]=useState<Section|null>(null),[open,setOpen]=useState(false),[form,setForm]=useState<Form>({...blank}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[uploading,setUploading]=useState(false);
 const existing=useMemo(()=>new Set((list?.data||[]).map(s=>s.key)),[list]);

 async function load(){setError('');try{const p=new URLSearchParams({per_page:'100'});if(q)p.set('key',q);const r=await api<any>(`/admin/cms?${p}`);setList(normalizeSections(r.data))}catch(e){setError(apiMessage(e,'Unable to load CMS'))}}
 useEffect(()=>{load()},[]);useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[q]);

 function payloadOf(s:Section){return s.content??s.payload??{}}
 function openEditor(s?:Section,key?:string){
  const source=s?payloadOf(s):defaults[key||'offer_banner']||{};
  setEditing(s||null);
  setForm(s?{
   key:s.key,type:s.type,title:s.title||'',subtitle:s.subtitle||'',image_url:s.image_url||source.image_url||'',
   cta_label:s.cta_label||source.cta?.label||'',cta_href:s.cta_href||source.cta?.href||'',
   content:pretty(source),sort_order:s.sort_order||0,is_active:s.is_active,starts_at:s.starts_at?toLocal(s.starts_at):'',ends_at:s.ends_at?toLocal(s.ends_at):''
  }:{...blank,key:key||blank.key,type:(BLOCKS.find(x=>x[0]===key)?.[2]||blank.type),content:pretty(defaults[(BLOCKS.find(x=>x[0]===key)?.[2]||blank.type)]||{})});
  setOpen(true);
 }
 function toLocal(v:string){return v?new Date(v).toISOString().slice(0,16):''}

 async function upload(file:File,onUrl:(url:string)=>void){
  setUploading(true);setError('');
  try{const fd=new FormData();fd.append('file',file);fd.append('folder','cms/home');const r=await api<any>('/admin/cms/assets',{method:'POST',body:fd});const url=r.data?.url;if(!url)throw new Error('Upload succeeded but no URL was returned.');onUrl(url)}
  catch(e){setError(apiMessage(e,'Image upload failed'))}finally{setUploading(false)}
 }
 function patchContent(mut:(x:any)=>void){try{const x=parse(form.content);mut(x);setForm(f=>({...f,content:pretty(x)}))}catch{}}
 function imageField(label:string,url:string,setUrl:(v:string)=>void){
  return <div className="asset-field"><label>{label}<input className="wide-control" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://cdn… or upload below"/></label><div className="asset-actions"><label className="btn"><ImagePlus size={14}/> {uploading?'Uploading…':'Upload'}<input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" disabled={uploading} onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,setUrl)}}/></label>{url&&<a className="btn" href={url} target="_blank" rel="noreferrer"><Eye size={14}/> Preview</a>}</div>{url&&<img src={url} alt="" style={{width:'100%',maxHeight:180,objectFit:'cover',borderRadius:12,marginTop:8}}/>}</div>
 }
 function save(){
  return (async()=>{setBusy(true);setError('');try{
   const content=parse(form.content);
   if(form.image_url)content.image_url=form.image_url;
   if(form.cta_label||form.cta_href){content.cta={...(content.cta||{}),label:form.cta_label||content.cta?.label||'Shop Now',href:form.cta_href||content.cta?.href||'/shop'}}
   const body={key:form.key.trim(),type:form.type,title:form.title||null,subtitle:form.subtitle||null,image_url:form.image_url||null,cta_label:form.cta_label||null,cta_href:form.cta_href||null,content,sort_order:Number(form.sort_order),is_active:form.is_active,starts_at:form.starts_at||null,ends_at:form.ends_at||null};
   const r=editing?await api(`/admin/cms/${editing.id}`,{method:'PUT',body:JSON.stringify(body)}):await api('/admin/cms',{method:'POST',body:JSON.stringify(body)});
   if(!r.success)throw new Error(r.message||'Save failed');setOpen(false);await load()
  }catch(e){setError(apiMessage(e,'Unable to save CMS section'))}finally{setBusy(false)}})()
 }
 async function remove(id:Section['id']){if(!confirm('Delete this home block?'))return;setBusy(true);try{await api(`/admin/cms/${id}`,{method:'DELETE'});await load()}catch(e){setError(apiMessage(e,'Unable to delete section'))}finally{setBusy(false)}}
 async function move(s:Section,dir:-1|1){const rows=[...(list?.data||[])].sort((a,b)=>a.sort_order-b.sort_order);const i=rows.findIndex(x=>x.id===s.id);const j=i+dir;if(i<0||j<0||j>=rows.length)return;const other=rows[j];setBusy(true);try{
   await api(`/admin/cms/${s.id}`,{method:'PUT',body:JSON.stringify({...s,content:payloadOf(s),sort_order:other.sort_order})});
   await api(`/admin/cms/${other.id}`,{method:'PUT',body:JSON.stringify({...other,content:payloadOf(other),sort_order:s.sort_order})});await load()
  }catch(e){setError(apiMessage(e,'Unable to reorder blocks'))}finally{setBusy(false)}}

 return <section className="content">
  <PageHeader title="Home Page Builder" description="Build /home visually from CMS data: upload or paste images, control banners, offers, carousels, grids, product feeds, flash sales and schedules." action={<div className="form-actions"><Button onClick={load} disabled={busy}><RefreshCw size={14}/> Refresh</Button><Button className="primary" onClick={()=>openEditor()}><Plus size={14}/> Custom block</Button></div>}/>
  {error&&<ErrorState error={error} onRetry={load}/>}
  <Card><div className="card-title">Quick add home blocks</div><p className="muted">Create only the blocks you need. Existing blocks are edited below; no code change is required for normal merchandising.</p><div className="quick">{BLOCKS.filter(x=>!existing.has(x[0])).map(x=><button key={x[0]} className="btn" onClick={()=>openEditor(undefined,x[0])}><Plus size={13}/>{x[1]}</button>)}</div>{existing.size===BLOCKS.length&&<div className="muted">All standard home blocks are configured.</div>}</Card>
  {!list&&!error?<Loading/>:list?.data?.length?<Card><div className="card-title">Home layout</div><p className="muted">Lower sort order appears first. Use arrows for fast merchandising order.</p><div className="cms-list">{[...list.data].sort((a,b)=>a.sort_order-b.sort_order).map((s,i)=><div className="cms-row" key={String(s.id)}>
   <div className="cms-thumb">{(s.image_url||payloadOf(s).image_url||payloadOf(s).items?.[0]?.image_url)?<img src={s.image_url||payloadOf(s).image_url||payloadOf(s).items[0].image_url} alt=""/>:<span>{s.type.replaceAll('_',' ')}</span>}</div>
   <div className="cms-main"><div><b>{s.title||s.key}</b><Badge>{s.is_active?'Live':'Draft'}</Badge></div><div className="muted">{s.key} · {s.type} · order {s.sort_order}</div><div className="muted">{s.starts_at||s.ends_at?`${s.starts_at||'Now'} → ${s.ends_at||'No end'}`:'Always active'}</div></div>
   <div className="form-actions"><Button title="Move up" disabled={busy||i===0} onClick={()=>move(s,-1)}><ArrowUp size={14}/></Button><Button title="Move down" disabled={busy||i===list.data.length-1} onClick={()=>move(s,1)}><ArrowDown size={14}/></Button><Button onClick={()=>openEditor(s)}>Edit</Button><Button onClick={()=>remove(s.id)}><Trash2 size={14}/></Button></div>
  </div>)}</div></Card>:<Card><Empty title="No home blocks" text="Use Quick add to create the first homepage section."/></Card>}

  {open&&<Modal title={editing?`Edit ${editing.title||editing.key}`:'Create home block'} onClose={()=>setOpen(false)}>
   <div className="form">
    <div className="form-grid">
     <label>Block<select value={form.key} disabled={!!editing} onChange={e=>{const key=e.target.value;const type=BLOCKS.find(x=>x[0]===key)?.[2]||'offer_banner';setForm(f=>({...f,key,type,content:pretty(defaults[type]||{})}))}}>{BLOCKS.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select></label>
     <label>Type<input value={form.type} onChange={e=>setForm({...form,type:e.target.value})}/></label>
     <label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
     <label>Subtitle<input value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})}/></label>
     <label>Sort order<input type="number" min="0" value={form.sort_order} onChange={e=>setForm({...form,sort_order:Number(e.target.value)})}/></label>
     <label className="address-default"><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> Publish / active</label>
     <label>Starts at<input type="datetime-local" value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})}/></label>
     <label>Ends at<input type="datetime-local" value={form.ends_at} onChange={e=>setForm({...form,ends_at:e.target.value})}/></label>
    </div>
    {['hero_slider','offer_banner','editorial_grid'].includes(form.type)&&imageField('Primary / fallback image',form.image_url,v=>setForm({...form,image_url:v}))}
    <div className="form-grid">
     <label>CTA label<input value={form.cta_label} onChange={e=>setForm({...form,cta_label:e.target.value})}/></label>
     <label>CTA link<input value={form.cta_href} onChange={e=>setForm({...form,cta_href:e.target.value})}/></label>
    </div>
    {form.type==='hero_slider'&&<Card><div className="card-title">Hero slides</div><p className="muted">Use the JSON below for multiple desktop/mobile slides. Each slide supports image_url, mobile_image_url, title, highlight, subtitle and cta.</p></Card>}
    {['product_carousel','product_grid','flash_sale','category_tiles','brand_carousel','review_carousel','personalized_products'].includes(form.type)&&<Card><div className="card-title">Merchandising controls</div><div className="form-grid">
      <label>Desktop columns<input type="number" min="1" max="8" value={(()=>{try{return parse(form.content).display?.desktop_columns??''}catch{return ''}})()} onChange={e=>patchContent(x=>{x.display=x.display||{};x.display.desktop_columns=Number(e.target.value)})}/></label>
      <label>Mobile cards / columns<input type="number" min="1" max="4" value={(()=>{try{const x=parse(form.content);return x.display?.mobile_cards??x.display?.mobile_columns??''}catch{return ''}})()} onChange={e=>patchContent(x=>{x.display=x.display||{};x.display.mobile_cards=Number(e.target.value);x.display.mobile_columns=Number(e.target.value)})}/></label>
      <label>Product/category limit<input type="number" min="1" max="100" value={(()=>{try{return parse(form.content).query?.limit??parse(form.content).limit??''}catch{return ''}})()} onChange={e=>patchContent(x=>{x.query=x.query||{};x.query.limit=Number(e.target.value)})}/></label>
      <label>Sort / source<input value={(()=>{try{const x=parse(form.content);return x.query?.sort||x.source||''}catch{return ''}})()} onChange={e=>patchContent(x=>{x.query=x.query||{};x.query.sort=e.target.value;x.source=e.target.value})}/></label>
    </div></Card>}
    {form.type==='offer_banner'&&<Card>{imageField('Offer image',(()=>{try{return parse(form.content).image_url||''}catch{return ''}})(),v=>patchContent(x=>{x.image_url=v}))}</Card>}
    {form.type==='hero_slider'&&<Card><div className="card-title">Hero slide quick upload</div>{(()=>{let slides:Slide[]=[];try{slides=parse(form.content).items||[]}catch{}return <div className="form">{slides.map((sl,i)=><div key={i} className="card"><div className="form-grid"><label>Slide {i+1} image<input value={sl.image_url||''} onChange={e=>patchContent(x=>{x.items=x.items||[];x.items[i].image_url=e.target.value})}/></label><label>Mobile image<input value={sl.mobile_image_url||''} onChange={e=>patchContent(x=>{x.items=x.items||[];x.items[i].mobile_image_url=e.target.value})}/></label><label>Title<input value={sl.title||''} onChange={e=>patchContent(x=>{x.items[i].title=e.target.value})}/></label><label>CTA link<input value={sl.cta?.href||''} onChange={e=>patchContent(x=>{x.items[i].cta={...(x.items[i].cta||{}),href:e.target.value}})}/></label></div><div className="form-actions"><Button onClick={()=>patchContent(x=>x.items.splice(i,1))}><Trash2 size={13}/> Remove</Button></div></div>)}<Button onClick={()=>patchContent(x=>{x.items=x.items||[];x.items.push({image_url:'',title:'',subtitle:'',cta:{label:'Shop Now',href:'/shop'}})})}><Plus size={13}/> Add slide</Button></div>})()}</Card>}
    <label><span style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>Advanced content JSON <a href="/cms/themes" className="muted">Theme Studio <ExternalLink size={12}/></a></span><textarea rows={14} className="wide-control note" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/></label>
    <div className="form-actions"><Button onClick={()=>setOpen(false)}>Cancel</Button><Button className="primary" disabled={busy||uploading} onClick={save}><Save size={14}/>{busy?'Saving…':'Save & publish'}</Button></div>
   </div>
  </Modal>}
 </section>
}
