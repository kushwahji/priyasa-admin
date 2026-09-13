'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {api} from '@/lib/api';
import {Button} from '@/components/ui';

type ApiPayload={
 challengeId?:string;challenge_id?:string;request_id?:string;id?:string;
 resendAfterSeconds?:number;resend_after_seconds?:number;resend_after?:number;
 token?:string;access_token?:string;token_type?:string;
 role?:string;user?:{id?:string|number;name?:string;email?:string;role?:string};
 message?:string;
};

export default function Login(){
 const [email,setEmail]=useState('');
 const [otp,setOtp]=useState('');
 const [challengeId,setChallengeId]=useState('');
 const [sent,setSent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [seconds,setSeconds]=useState(0);
 const router=useRouter();
 useEffect(()=>{if(!seconds)return;const t=window.setInterval(()=>setSeconds(v=>Math.max(0,v-1)),1000);return()=>window.clearInterval(t)},[seconds]);

 async function sendOtp(){
  const normalized=email.trim().toLowerCase();
  if(!normalized){setError('Enter your administrator email.');return;}
  setBusy(true);setError('');
  try{
   const r=await api<ApiPayload>('/admin/auth/send-otp',{method:'POST',body:JSON.stringify({email:normalized})});
   const data=(r.data||r) as ApiPayload;
   const id=data.challengeId||data.challenge_id||data.request_id||data.id||'';
   if(!id){
    setChallengeId('');
    setSent(false);
    setOtp('');
    setSeconds(Number(data.resendAfterSeconds||data.resend_after_seconds||data.resend_after||60));
    setError('If this email belongs to an authorized PRIYASA administrator, a verification code will be sent shortly.');
    return;
   }
   setChallengeId(id);
   setSent(true);
   setOtp('');
   setSeconds(Number(data.resendAfterSeconds||data.resend_after_seconds||data.resend_after||60));
  }catch(err){setError(err instanceof Error?err.message:'Unable to send OTP. Please try again.')}finally{setBusy(false)}
 }

 async function verifyOtp(){
  if(!challengeId){setError('Your OTP session was not returned by PriyasaCore. Please request a new code.');return;}
  if(otp.length!==6){setError('Enter the 6-digit OTP.');return;}
  setBusy(true);setError('');
  try{
   const normalized=email.trim().toLowerCase();
   const r=await api<ApiPayload>('/admin/auth/verify-otp',{method:'POST',body:JSON.stringify({email:normalized,otp,code:otp,request_id:challengeId,challenge_id:challengeId,challengeId})});
   const data=(r.data||r) as ApiPayload;
   const token=data.token||data.access_token;

   /*
    * Authorization is owned by PriyasaCore. The API only issues a token
    * after its server-side admin eligibility check succeeds. Do not reject
    * valid roles such as super_admin in the browser.
    */
   if(!token)throw new Error('PriyasaCore did not return an admin access token.');

   const user=data.user||{};
   localStorage.setItem('priyasa_admin_token',token);
   localStorage.setItem('priyasa_admin_user',JSON.stringify({
    id:user.id,
    name:user.name,
    email:user.email||normalized,
    role:user.role||data.role||'ADMIN',
   }));
   router.replace('/');
   router.refresh();
  }catch(err){setError(err instanceof Error?err.message:'Invalid or expired OTP. Please try again.')}finally{setBusy(false)}
 }
 async function submit(e:FormEvent){e.preventDefault();if(sent)await verifyOtp();else await sendOtp()}
 function changeEmail(){setSent(false);setChallengeId('');setOtp('');setSeconds(0);setError('')}

 return <main className="login-page"><div className="login-card"><div className="login-brand">PRIYASA <span>✦</span></div><h1>Admin portal</h1><p>Secure access to your commerce operations.</p><form onSubmit={submit}>{!sent?<label>Administrator email<input autoFocus type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@priyasa.com" required/></label>:<><label>One-time password<input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="••••••" required/></label><div className="form-actions" style={{justifyContent:'space-between'}}><button type="button" className="text-button" onClick={changeEmail} disabled={busy}>Change email</button><button type="button" className="text-button" disabled={busy||seconds>0} onClick={sendOtp}>{seconds>0?`Resend in ${seconds}s`:'Resend OTP'}</button></div></>}{error&&<div className="form-error" role="alert">{error}</div>}<Button className="primary-btn" disabled={busy||(!sent?email.trim().length===0:otp.length!==6)}>{busy?'Please wait…':sent?'Verify & continue':'Send OTP'}</Button></form><small>Only authorized PRIYASA administrators can sign in. Authorization and OTP verification are enforced server-side.</small></div></main>
}
