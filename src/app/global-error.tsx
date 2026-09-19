'use client';

export default function GlobalError({reset}:{error:Error & {digest?:string};reset:()=>void}){
  return <html><body><main className="error-page"><div className="error-card"><div className="error-mark">!</div><div className="login-brand">PRIYASA <span>✦</span></div><h1>Admin application error</h1><p>The admin application encountered an unexpected client error.</p><div className="error-actions"><button className="btn primary" onClick={()=>reset()}>Reload admin</button><button className="btn" onClick={()=>window.location.assign('/login')}>Back to login</button></div></div></main></body></html>;
}
