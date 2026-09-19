'use client';

import {useEffect,useState} from 'react';
import {api} from '@/lib/api';
import {Card,PageHeader,Button,Badge,Loading,ErrorState} from '@/components/ui';

type SecurityData={me:any;users:any;roles:any};

export default function Security(){
 const [data,setData]=useState<SecurityData|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 async function load(){
  setLoading(true);setError('');
  try{
   const [me,users,roles]=await Promise.all([api<any>('/admin/security/me'),api<any>('/admin/security/users?per_page=50'),api<any>('/admin/security/roles')]);
   setData({me:me.data,users:users.data,roles:roles.data});
  }catch(e){setError(e instanceof Error?e.message:'Unable to load security controls')}
  finally{setLoading(false)}
 }
 useEffect(()=>{load()},[]);
 const roles=Array.isArray(data?.roles)?data?.roles:[];
 const users=Array.isArray(data?.users)?data?.users:(data?.users?.data||[]);
 return <section className="content">
  <PageHeader title="Security & RBAC" description="Administrator identity, roles, permissions and audit-aware access control." action={<Button onClick={load} disabled={loading}>Refresh</Button>}/>
  {error&&<ErrorState error={error} onRetry={load}/>}
  {loading&&!data?<Loading/>:data&&<div className="section-grid">
   <Card><div className="card-title">Current operator</div><p><b>{data.me?.name||data.me?.email||'Administrator'}</b></p><p className="muted">Roles: {Array.isArray(data.me?.roles)?data.me.roles.join(', '):(data.me?.role||'admin')}</p></Card>
   <Card><div className="card-title">Roles</div>{roles.length?<div className="quick">{roles.map((r:any)=><div key={String(r.id??r.name)}><b>{r.display_name||r.name||r.slug}</b><span><Badge>{r.is_active===false?'Inactive':'Active'}</Badge></span></div>)}</div>:<div className="empty">No roles returned.</div>}</Card>
   <Card><div className="card-title">Admin users</div>{users.length?<div className="table-wrap"><table className="table"><thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Status</th></tr></thead><tbody>{users.map((u:any)=><tr key={String(u.id)}><td>{u.name||'—'}</td><td>{u.email||'—'}</td><td>{u.mobile||u.phone||'—'}</td><td><Badge>{u.status||'active'}</Badge></td></tr>)}</tbody></table></div>:<div className="empty">No admin users returned.</div>}</Card>
  </div>}
 </section>;
}
