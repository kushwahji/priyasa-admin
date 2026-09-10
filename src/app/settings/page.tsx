'use client';

import {useEffect,useMemo,useState} from 'react';
import {api} from '@/lib/api';
import {apiMessage} from '@/lib/format';

 type Setting={key:string;label:string;type:'string'|'boolean'|'number';group:string;value:string|number|boolean|null;configured:boolean;updated_at?:string|null};

export default function Settings(){
 const [settings,setSettings]=useState<Setting[]>([]); const [draft,setDraft]=useState<Record<string,any>>({});
 const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState(''); const [saved,setSaved]=useState(false);
 const load=async()=>{setLoading(true);setError('');try{const r=await api<{settings:Setting[]}>('/admin/settings');const rows=r.data?.settings||[];setSettings(rows);setDraft(Object.fromEntries(rows.map(s=>[s.key,s.value??defaultValue(s.type)])));}catch(e){setError(apiMessage(e))}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const groups=useMemo(()=>Array.from(new Set(settings.map(s=>s.group))),[settings]);
 async function save(){setSaving(true);setSaved(false);setError('');try{await api('/admin/settings',{method:'PUT',body:JSON.stringify({settings:draft})});setSaved(true);await load();}catch(e){setError(apiMessage(e))}finally{setSaving(false)}}
 return <main className="space-y-6">
  <header><h1 className="text-2xl font-semibold tracking-tight">Settings</h1><p className="mt-1 text-sm text-zinc-500">Control operational store behaviour. Secrets and provider credentials stay outside this UI.</p></header>
  {error&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
  {saved&&<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">Settings saved and audit logged.</div>}
  {loading?<div className="rounded-2xl border bg-white p-8 text-sm text-zinc-500">Loading settings…</div>:<div className="space-y-5">{groups.map(group=><section key={group} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-5"><h2 className="font-semibold">{group}</h2></div><div className="grid gap-4 md:grid-cols-2">{settings.filter(s=>s.group===group).map(s=><label key={s.key} className="rounded-xl border p-4"><span className="block text-sm font-medium">{s.label}</span><span className="mt-1 block text-xs text-zinc-400">{s.key}</span>{s.type==='boolean'?<div className="mt-3 flex items-center gap-3"><input type="checkbox" checked={Boolean(draft[s.key])} onChange={e=>setDraft({...draft,[s.key]:e.target.checked})}/><span className="text-sm">{draft[s.key]?'Enabled':'Disabled'}</span></div>:<input className="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2" type={s.type==='number'?'number':'text'} value={draft[s.key]??''} onChange={e=>setDraft({...draft,[s.key]:s.type==='number'?(e.target.value===''?'':Number(e.target.value)):e.target.value})}/>}</label>)}</div></section>)}</div>}
  {!loading&&<div className="flex justify-end"><button disabled={saving} onClick={save} className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving?'Saving…':'Save settings'}</button></div>}
 </main>
}
function defaultValue(type:Setting['type']){return type==='boolean'?false:type==='number'?0:''}
