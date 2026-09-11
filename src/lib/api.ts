const BASE=(process.env.NEXT_PUBLIC_API_URL||'https://api.priyasa.com/api/v1').replace(/\/$/,'');
export type ApiResult<T=unknown>={success?:boolean;data?:T;message?:string;errors?:Record<string,string[]>};

function requestId(){
  return typeof crypto!=='undefined'&&'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function api<T=unknown>(path:string,init:RequestInit={}){
  const token=typeof window!=='undefined'?localStorage.getItem('priyasa_admin_token'):null;
  const headers=new Headers(init.headers);
  headers.set('Accept','application/json');
  if(init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
  if(token) headers.set('Authorization',`Bearer ${token}`);
  if(!headers.has('X-Request-ID')) headers.set('X-Request-ID',requestId());
  const controller=new AbortController();
  const externalSignal=init.signal;
  const timeout=typeof window!=='undefined'?window.setTimeout(()=>controller.abort(),30000):setTimeout(()=>controller.abort(),30000);
  try{
    const res=await fetch(`${BASE}${path.startsWith('/')?path:`/${path}`}`,{...init,headers,cache:'no-store',signal:externalSignal||controller.signal});
    if(res.status===204)return {success:true} as ApiResult<T>;
    const text=await res.text();
    let body:ApiResult<T>={};
    try{body=text?JSON.parse(text):{}}catch{body={message:'The API returned a non-JSON response'}}
    if(res.status===401&&typeof window!=='undefined'){
      localStorage.removeItem('priyasa_admin_token');
      localStorage.removeItem('priyasa_admin_user');
      if(window.location.pathname!=='/login') window.location.assign('/login');
    }
    if(!res.ok){
      const validation=body.errors?Object.values(body.errors).flat().join(' '):'';
      throw new Error(validation||body.message||`API request failed (${res.status})`)
    }
    return body;
  }catch(error){
    if(error instanceof DOMException&&error.name==='AbortError') throw new Error('Request timed out. Please retry.');
    throw error;
  }finally{clearTimeout(timeout)}
}

export const apiBase=BASE;
