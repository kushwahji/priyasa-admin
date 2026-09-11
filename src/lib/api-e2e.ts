import {api,apiBase} from './api';
import {API_ROUTES,AdminList,ApiEnvelope} from './api-contract';

export type SmokeCheck={name:string;method:string;path:string;ok:boolean;status?:number;message?:string};

export async function runAdminApiSmokeChecks():Promise<SmokeCheck[]>{
  const checks:SmokeCheck[]=[];
  const read=(name:string,path:string)=>api(name==='Health'?API_ROUTES.health:path).then((r)=>{checks.push({name,method:'GET',path,ok:true});return r}).catch((e)=>{checks.push({name,method:'GET',path,ok:false,message:e instanceof Error?e.message:String(e)});return null});
  await read('Health',API_ROUTES.health);
  await read('Admin products',`${API_ROUTES.catalog.products}?per_page=1`);
  await read('Admin orders',`${API_ROUTES.orders.list}?per_page=1`);
  await read('Admin customers',`${API_ROUTES.customers.list}?per_page=1`);
  await read('Admin inventory',API_ROUTES.inventory.list);
  await read('Admin returns',API_ROUTES.returns.list);
  await read('Admin reviews',`${API_ROUTES.reviews.list}?per_page=1`);
  await read('Admin promotions',`${API_ROUTES.promotions.list}?per_page=1`);
  await read('Admin analytics',`${API_ROUTES.analytics}?from=${new Date(Date.now()-29*86400000).toISOString().slice(0,10)}&to=${new Date().toISOString().slice(0,10)}`);
  return checks;
}

export {API_ROUTES,api,apiBase};
export type {ApiEnvelope,AdminList};
