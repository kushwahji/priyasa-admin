'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {api} from '@/lib/api';
import {Button} from '@/components/ui';

export default function Login(){
 const [email,setEmail]=useState('');
 const [otp,setOtp]=useState('');
 const [requestId,setRequestId]=useState('');
 const [sent,setSent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [seconds,setSeconds]=useState(0);
 const router=useRouter();

 useEffect(()=>{if(!seconds)return;const t=window.setInterval(()=>setSeconds(v=>Math.max(0,v-1)),1000);return()=>window.clearInterval(t)},[seconds]);

 async function sendOtp(){
  setBusy(true);setError('');
  try{
   const r=await api<any>('/admin/auth/send-otp',{method:'POST',body:JSON.stringify({email:email.trim().toLowerCase()})});
   const data=r.data||r;
   setRequestId(data.request_id||'');
   setSent(true);
   setOtp('');
   setSeconds(Number(data.resend_after_seconds||data.resend_after||60));
  }catch(err){setError(err instanceof Error?err.message:'Unable to send OTP. Please try again.')}finally{setBusy(false)}
 }

 async function verifyOtp(){
  if(!requestId){setError('Your OTP session has expired. Please request a new code.');return}
  setBusy(true);setError('');
  try{
   const r=await api<any>('/admin/auth/verify-otp',{method:'POST',body:JSON.stringify({email:email.trim().toLowerCase(),otp,request_id:requestId})});
   const data=r.data||r;
   const token=data.token;
   if(!token)throw new Error('Authentication token was not returned by the API.');
   localStorage.setItem('priyasa_admin_token',token);
   localStorage.setItem('priyasa_admin_user',JSON.stringify(data.user||{}));
   router.replace('/');
  }catch(err){setError(err instanceof Error?err.message:'Invalid or expired OTP. Please try again.')}finally{setBusy(false)}
 }

 async function submit(e:FormEvent){e.preventDefault();if(sent)await verifyOtp();else await sendOtp()}
 function changeEmail(){setSent(false);setRequestId('');setOtp('');setSeconds(0);setError('')}

 return <main className="login-page"><div className="login-card">
  <div className="login-brand">PRIYASA <span>✦</span></div>
  <h1>Admin portal</h1>
  <p>Secure access to your commerce operations.</p>
  <form onSubmit={submit}>
   {!sent?<label>Administrator email<input autoFocus type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@priyasa.com" required/></label>:<>
    <label>One-time password<input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="••••••" required/></label>
    <div className="form-actions" style={{justifyContent:'space-between'}}><button type="button" className="text-button" onClick={changeEmail}>Change email</button><button type="button" className="text-button" disabled={busy||seconds>0} onClick={sendOtp}>{seconds>0?`Resend in ${seconds}s`:'Resend OTP'}</button></div>
   </>}
   {error&&<div className="form-error" role="alert">{error}</div>}
   <Button className="primary-btn" disabled={busy||(!sent?email.trim().length===0:otp.length!==6)}>{busy?'Please wait…':sent?'Verify & continue':'Send OTP'}</Button>
  </form>
  <small>Only authorized PRIYASA administrators can sign in. OTPs are verified and stored server-side; this portal never stores the OTP.</small>
 </div></main>
}
