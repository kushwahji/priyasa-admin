import {NextRequest,NextResponse} from 'next/server';

const API_BASE=(process.env.PRIYASA_API_BASE_URL||process.env.NEXT_PUBLIC_API_URL||'https://api.priyasa.com/api/v1').replace(/\/$/,'');
const METHODS=['GET','POST','PUT','PATCH','DELETE','HEAD'] as const;

type Context={params:Promise<{path:string[]}>};

async function proxy(request:NextRequest,context:Context){
 const {path=[]}=await context.params;
 const target=`${API_BASE}/${path.map(segment=>encodeURIComponent(segment)).join('/')}${request.nextUrl.search}`;
 const headers=new Headers();
 for(const name of ['accept','authorization','content-type','x-request-id','idempotency-key','x-correlation-id','x-client-version']){
  const value=request.headers.get(name);if(value)headers.set(name,value);
 }
 const hasBody=!['GET','HEAD'].includes(request.method);
 try{
  const upstream=await fetch(target,{method:request.method,headers,body:hasBody?await request.arrayBuffer():undefined,cache:'no-store',redirect:'manual'});
  const responseHeaders=new Headers();
  const contentType=upstream.headers.get('content-type');if(contentType)responseHeaders.set('content-type',contentType);
  const requestId=upstream.headers.get('x-request-id');if(requestId)responseHeaders.set('x-request-id',requestId);
  return new NextResponse(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:responseHeaders});
 }catch(error){
  console.error('PRIYASA API proxy request failed',{method:request.method,target,error});
  return NextResponse.json({success:false,message:'PriyasaCore API is temporarily unreachable.'},{status:502});
 }
}

export async function GET(request:NextRequest,context:Context){return proxy(request,context)}
export async function POST(request:NextRequest,context:Context){return proxy(request,context)}
export async function PUT(request:NextRequest,context:Context){return proxy(request,context)}
export async function PATCH(request:NextRequest,context:Context){return proxy(request,context)}
export async function DELETE(request:NextRequest,context:Context){return proxy(request,context)}
export async function HEAD(request:NextRequest,context:Context){return proxy(request,context)}

export const dynamic='force-dynamic';
export const runtime='nodejs';
