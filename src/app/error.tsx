'use client';

import {useEffect} from 'react';

export default function Error({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
  useEffect(()=>{console.error('[PRIYASA Admin] client route error',error)},[error]);
  return <main className="error-page">
    <div className="error-card">
      <div className="error-mark">!</div>
      <div className="login-brand">PRIYASA <span>✦</span></div>
      <h1>Admin page could not load</h1>
      <p>A client-side error interrupted this page. Your admin session has not been changed.</p>
      {error?.message&&<pre>{error.message}</pre>}
      {error?.digest&&<small>Reference: {error.digest}</small>}
      <div className="error-actions"><button className="btn primary" onClick={()=>reset()}>Try again</button><button className="btn" onClick={()=>window.location.assign('/login')}>Back to login</button></div>
    </div>
  </main>;
}
