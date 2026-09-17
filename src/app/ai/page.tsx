'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Badge, Button, Card, ErrorState, Loading, PageHeader } from '@/components/ui';

type Provider = { id:number; key:string; name:string; driver:string; model:string|null; enabled:boolean; priority:number; configured:boolean };
type Product = { id:number; name:string; slug:string; description?:string|null; short_description?:string|null; meta_title?:string|null; meta_description?:string|null; search_keywords?:string|null };
type Section = { generation_id:number; content:Record<string, unknown>; provider?:string; model?:string };

const CONTENT_FIELDS = [
  ['title', 'Title'], ['short_description', 'Short description'], ['description', 'Description'],
  ['highlights', 'Highlights'], ['fabric_details', 'Fabric details'], ['fit_information', 'Fit information'],
  ['styling_suggestions', 'Styling suggestions'], ['care_instructions', 'Care instructions'], ['faqs', 'FAQs'],
] as const;
const SEO_FIELDS = [
  ['meta_title', 'SEO title'], ['meta_description', 'Meta description'], ['focus_keyword', 'Focus keyword'],
  ['secondary_keywords', 'Secondary keywords'], ['tags', 'Tags'], ['slug', 'URL slug'], ['image_alt_text', 'Image ALT text'],
] as const;

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => typeof item === 'object' ? JSON.stringify(item) : String(item)).join('\n');
  if (value && typeof value === 'object') return JSON.stringify(value, null, 2);
  return value == null ? '' : String(value);
}

export default function AIStudioPage() {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [content, setContent] = useState<Section | null>(null);
  const [seo, setSeo] = useState<Section | null>(null);
  const [instructions, setInstructions] = useState('');
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const configured = useMemo(() => providers.filter((p) => p.enabled && p.configured).sort((a,b) => a.priority-b.priority), [providers]);

  async function loadProviders() {
    try { const r = await api<{providers:Provider[]}>('/admin/ai/providers'); setProviders(r.data?.providers || []); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load AI providers'); }
  }

  async function loadProduct() {
    if (!productId.trim()) return;
    setError(''); setNotice(''); setContent(null); setSeo(null);
    try {
      const r = await api<Product>(`/admin/catalog/products/${encodeURIComponent(productId.trim())}`);
      setProduct(r.data || null);
      if (!r.data) throw new Error('Product not found');
    } catch (e) { setProduct(null); setError(e instanceof Error ? e.message : 'Unable to load product'); }
  }

  useEffect(() => { void loadProviders(); }, []);

  async function generate() {
    if (!product) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const r = await api<{sections:Record<string,Section>}>(`/admin/ai/products/${product.id}/generate`, {
        method: 'POST', body: JSON.stringify({ sections: ['content','seo'], instructions: instructions.trim() || undefined }),
      });
      setContent(r.data?.sections?.content || null); setSeo(r.data?.sections?.seo || null);
      setNotice('Draft generated. Review it before applying anything to the catalogue.');
    } catch (e) { setError(e instanceof Error ? e.message : 'AI generation failed'); }
    finally { setBusy(false); }
  }

  async function apply(section: Section, fields: string[]) {
    if (!product || !fields.length) return;
    setApplying(true); setError(''); setNotice('');
    try {
      await api(`/admin/ai/products/${product.id}/apply`, { method:'POST', body:JSON.stringify({ generation_id:section.generation_id, fields }) });
      setNotice(`Applied ${fields.length} field${fields.length === 1 ? '' : 's'} to ${product.name}.`);
      await loadProduct();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to apply AI draft'); }
    finally { setApplying(false); }
  }

  return <section className="content">
    <PageHeader title="AI Product Studio" description="Generate product content and SEO with provider-independent AI. Nothing is published automatically." />
    {error && <ErrorState error={error} onRetry={product ? loadProduct : loadProviders} />}
    {notice && <div style={{marginBottom:16,padding:'12px 14px',border:'1px solid #f3d0dd',borderRadius:12,background:'#fff7fa'}}>{notice}</div>}

    <div style={{display:'grid',gridTemplateColumns:'minmax(0,2fr) minmax(280px,1fr)',gap:16,alignItems:'start'}}>
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:14}}>
          <div><h2 style={{margin:0}}>Product AI Assistant</h2><p style={{margin:'5px 0 0',color:'#777'}}>Use factual catalogue data as the source of truth.</p></div>
          <Badge>{configured.length ? `${configured.length} provider${configured.length > 1 ? 's' : ''} ready` : 'No provider configured'}</Badge>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10}}>
          <input value={productId} onChange={e=>setProductId(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void loadProduct()}} placeholder="Product ID" aria-label="Product ID" />
          <Button className="primary" onClick={()=>void loadProduct()}>Load product</Button>
        </div>
        {product && <div style={{marginTop:16,padding:14,border:'1px solid #eee',borderRadius:12}}>
          <strong style={{fontSize:18}}>{product.name}</strong><div style={{color:'#777',marginTop:4}}>{product.slug} · ID {product.id}</div>
          <label style={{display:'block',marginTop:14}}>Optional instructions<textarea value={instructions} onChange={e=>setInstructions(e.target.value)} rows={3} placeholder="Example: Keep the tone premium and concise for Indian ethnic wear." style={{width:'100%',marginTop:6}} /></label>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}><Button className="primary" disabled={busy || !configured.length} onClick={()=>void generate()}>{busy?'Generating…':'✨ Generate content + SEO'}</Button></div>
        </div>}
        {!product && !error && <div style={{padding:'32px 8px',textAlign:'center',color:'#777'}}>Enter a product ID to start.</div>}
      </Card>

      <Card>
        <h2 style={{marginTop:0}}>Provider routing</h2>
        <p style={{color:'#777'}}>Lowest priority number is tried first; failures fall through automatically.</p>
        {providers.length ? <div style={{display:'grid',gap:10}}>{providers.map(p=><div key={p.key} style={{border:'1px solid #eee',borderRadius:10,padding:11}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><strong>{p.name}</strong><Badge>{p.enabled?'enabled':'off'}</Badge></div><div style={{fontSize:12,color:'#777',marginTop:4}}>{p.model || 'No model'} · priority {p.priority}</div><div style={{fontSize:12,marginTop:5}}>{p.configured?'API key configured':'API key missing'}</div></div>)}</div> : <Loading/>}
      </Card>
    </div>

    {(content || seo) && <div style={{display:'grid',gap:16,marginTop:16}}>
      {content && <AIDraft title="Content draft" section={content} fields={CONTENT_FIELDS} applying={applying} onApply={(fields)=>void apply(content,fields)} />}
      {seo && <AIDraft title="SEO draft" section={seo} fields={SEO_FIELDS} applying={applying} onApply={(fields)=>void apply(seo,fields)} />}
    </div>}
  </section>;
}

function AIDraft({title,section,fields,applying,onApply}:{title:string;section:Section;fields:readonly (readonly [string,string])[];applying:boolean;onApply:(fields:string[])=>void}) {
  const [selected,setSelected]=useState<string[]>(fields.map(([key])=>key));
  return <Card>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:14}}>
      <div><h2 style={{margin:0}}>{title}</h2><p style={{margin:'5px 0 0',color:'#777'}}>Provider: {section.provider || '—'} · {section.model || '—'} · Draft #{section.generation_id}</p></div>
      <Button className="primary" disabled={applying || !selected.length} onClick={()=>onApply(selected)}>{applying?'Applying…':'Apply selected'}</Button>
    </div>
    <div style={{display:'grid',gap:10}}>{fields.map(([key,label])=>{
      const value=section.content[key]; if(value===undefined)return null; const checked=selected.includes(key);
      return <div key={key} style={{border:'1px solid #eee',borderRadius:10,padding:12}}>
        <label style={{display:'flex',gap:9,alignItems:'center',fontWeight:600}}><input type="checkbox" checked={checked} onChange={()=>setSelected(v=>checked?v.filter(x=>x!==key):[...v,key])}/>{label}</label>
        <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',margin:'10px 0 0',color:'#333',maxHeight:260,overflow:'auto'}}>{displayValue(value)}</pre>
      </div>;
    })}</div>
  </Card>;
}
