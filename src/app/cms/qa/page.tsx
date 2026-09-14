'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {AlertTriangle,CheckCircle2,ExternalLink,RefreshCw} from 'lucide-react';
import {api} from '@/lib/api';
import {apiMessage,dateTime} from '@/lib/format';
import {PageHeader,Card,Button,Badge,Loading,ErrorState,Empty} from '@/components/ui';

type Section={id:number|string;key:string;type:string;title?:string|null;subtitle?:string|null;image_url?:string|null;cta_label?:string|null;cta_href?:string|null;payload?:Record<string,unknown>|null;sort_order:number;is_active:boolean;starts_at?:string|null;ends_at?:string|null;updated_at?:string};
type List={data:Section[];current_page?:number;last_page?:number};
type Issue={severity:'error'|'warning';section:Section;message:string};

function check(sections:Section[]):Issue[]{
 const issues:Issue[]=[]; const keys=new Map<string,Section[]>();
 sections.forEach(s=>{const k=s.key.trim().toLowerCase();keys.set(k,[...(keys.get(k)||[]),s]);});
 keys.forEach(items=>{if(items.length>1)items.forEach(s=>issues.push({severity:'error',section:s,message:'Duplicate section key; storefront targeting can become ambiguous.'}));});
 sections.forEach(s=>{
  if(!s.key?.trim())issues.push({severity:'error',section:s,message:'Missing section key.'});
  if(!s.type?.trim())issues.push({severity:'error',section:s,message:'Missing section type.'});
  if(s.is_active&&!s.title?.trim()&&!s.image_url)issues.push({severity:'warning',section:s,message:'Active section has neither a title nor an image.'});
  if(s.cta_label&&!s.cta_href)issues.push({severity:'warning',section:s,message:'CTA label exists but CTA link is empty.'});
  if(s.starts_at&&s.ends_at&&new Date(s.starts_at)>new Date(s.ends_at))issues.push({severity:'error',section:s,message:'Start time is after end time.'});
  if(s.sort_order<0)issues.push({severity:'error',section:s,message:'Sort order cannot be negative.'});
 });
 return issues;
}

export default function CmsQa(){
 const [sections,setSections]=useState<Section[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const r=await api<List>('/admin/cms?per_page=100');setSections(r.data?.data||[])}catch(e){setError(apiMessage(e,'Unable to load CMS sections'))}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const issues=useMemo(()=>check(sections),[sections]);
 const errors=issues.filter(i=>i.severity==='error'),warnings=issues.filter(i=>i.severity==='warning');
 return <section className="content"><PageHeader title="Storefront Content QA" description="Pre-publish validation for CMS sections. This is a read-only safety layer over PriyasaCore CMS." action={<div className="form-actions"><Button onClick={load} disabled={loading}><RefreshCw size={14}/> Refresh</Button><Link href="/cms"><Button>Open CMS <ExternalLink size={14}/></Button></Link></div>}/>{error&&<ErrorState error={error} onRetry={load}/>} {loading?<Loading/>:<><div className="metrics-grid"><Card><div className="metric-label">Sections</div><div className="metric-value">{sections.length}</div></Card><Card><div className="metric-label">Active</div><div className="metric-value">{sections.filter(s=>s.is_active).length}</div></Card><Card><div className="metric-label">Blocking issues</div><div className="metric-value">{errors.length}</div></Card><Card><div className="metric-label">Warnings</div><div className="metric-value">{warnings.length}</div></Card></div><Card><div className="section-head"><div><h2>Release readiness</h2><p>Errors should be resolved before publishing storefront content.</p></div><Badge>{errors.length?'Needs attention':'Ready'}</Badge></div>{!issues.length?<div className="empty"><CheckCircle2 size={22}/><strong>No validation issues detected</strong><span>The current CMS payload passes the available client-side safety checks.</span></div>:<div className="table-wrap"><table className="table"><thead><tr><th>Severity</th><th>Section</th><th>Type</th><th>Issue</th><th>Updated</th></tr></thead><tbody>{issues.map((i,n)=><tr key={`${String(i.section.id)}-${n}`}><td><Badge>{i.severity}</Badge></td><td><b>{i.section.key||`#${i.section.id}`}</b><div className="muted">#{i.section.id}</div></td><td>{i.section.type||'—'}</td><td>{i.message}</td><td>{dateTime(i.section.updated_at)}</td></tr>)}</tbody></table></div>}</Card><Card><div className="card-title">Validation boundary</div><p className="muted">Checks cover duplicate keys, required identity fields, CTA completeness, active-section content, scheduling order and sort order. They do not claim image URLs are reachable or that a section is visually correct; use the CMS/Home Studio preview for visual verification.</p></Card>{!sections.length&&<Card><Empty title="No CMS sections" text="Create storefront content in CMS before running a release review."/></Card>}</>}</section>;
}
